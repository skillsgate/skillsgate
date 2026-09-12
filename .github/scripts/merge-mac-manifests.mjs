#!/usr/bin/env node
/**
 * Merge the per-architecture macOS update manifests into a single latest-mac.yml.
 *
 * The desktop-publish workflow builds macOS arm64 and x64 in two separate matrix
 * jobs. Each job's electron-builder run emits its own `latest-mac.yml` listing
 * only that job's artifacts. The publish job downloads every artifact with
 * `merge-multiple: true`, so without disambiguation one manifest silently
 * overwrites the other and the survivor lists a single architecture.
 *
 * electron-updater's MacUpdater picks an arm64 download only when the manifest's
 * `files` array actually contains an entry whose URL mentions arm64 (see
 * MacUpdater#doDownloadUpdate); otherwise it filters arm64 entries out and hands
 * arm64 users the x64 build. So the published manifest has to list every macOS
 * artifact from both jobs.
 *
 * The build job renames each manifest to `latest-mac-<arch>.yml`; this script
 * merges those back into the canonical `latest-mac.yml` and removes the
 * per-arch files so they are not uploaded as release assets.
 *
 * Usage: node merge-mac-manifests.mjs [artifacts-dir]
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

/**
 * Resolve js-yaml from the current project or from an explicitly provided
 * NODE_PATH (the workflow installs it into a scratch directory so it does not
 * have to install the whole monorepo just to read two small YAML files).
 */
function loadYamlModule() {
  const attempts = ["js-yaml"]
  for (const base of (process.env.NODE_PATH ?? "").split(path.delimiter).filter(Boolean)) {
    attempts.push(path.resolve(base, "js-yaml"))
  }

  for (const id of attempts) {
    try {
      return require(id)
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    "js-yaml could not be resolved. Install it first, e.g. `npm install --no-save js-yaml`.",
  )
}

const yaml = loadYamlModule()

const ARCHES = ["arm64", "x64"]

/** electron-builder writes releaseDate as an ISO string; keep it a string. */
function normalizeReleaseDate(value) {
  if (value instanceof Date) return value.toISOString()
  return value
}

function main() {
  const dir = process.argv[2] ?? "artifacts"

  const manifests = new Map()
  for (const arch of ARCHES) {
    const file = path.join(dir, `latest-mac-${arch}.yml`)
    if (!fs.existsSync(file)) continue
    const doc = yaml.load(fs.readFileSync(file, "utf8"))
    if (doc && typeof doc === "object") {
      manifests.set(arch, { file, doc })
    }
  }

  if (manifests.size === 0) {
    console.log("No per-arch macOS manifests found; nothing to merge.")
    return
  }

  // A mismatch means artifacts from two different releases got mixed together.
  // Publishing that would produce a manifest pointing at files that do not
  // exist in the release, so fail loudly instead.
  const versions = [...new Set([...manifests.values()].map((m) => m.doc.version))]
  if (versions.length > 1) {
    throw new Error(
      `Refusing to merge macOS manifests with mismatched versions: ${versions.join(", ")}`,
    )
  }

  // Preserve x64-then-arm64 ordering so the generic entries stay first, and
  // de-duplicate by URL in case both jobs somehow emitted the same artifact.
  const files = []
  const seen = new Set()
  for (const arch of ["x64", "arm64"]) {
    for (const entry of manifests.get(arch)?.doc.files ?? []) {
      if (!entry?.url || seen.has(entry.url)) continue
      seen.add(entry.url)
      files.push(entry)
    }
  }

  if (files.length === 0) {
    throw new Error("Merged macOS manifest would contain no files.")
  }

  // electron-builder points the legacy top-level path/sha512 at the x64 zip.
  // Modern electron-updater selects from `files`, but older clients still read
  // these, so keep them pointing at the widest-compatibility download.
  const isArm64 = (entry) => entry.url.includes("arm64")
  const zips = files.filter((entry) => entry.url.endsWith(".zip"))
  const primary = zips.find((entry) => !isArm64(entry)) ?? zips[0] ?? files[0]

  const releaseDates = [...manifests.values()]
    .map((m) => normalizeReleaseDate(m.doc.releaseDate))
    .filter(Boolean)
    .sort()

  const merged = {
    version: versions[0],
    files,
    path: primary.url,
    sha512: primary.sha512,
    releaseDate: releaseDates[releaseDates.length - 1],
  }

  // electron-updater refuses an update whose manifest declares a
  // minimumSystemVersion above the running OS. It compares against
  // os.release(), which on macOS is the Darwin kernel version, so the value
  // must be a Darwin version (macOS 13 = 22.0.0), not a marketing version.
  // electron-builder does not emit this field itself, so the workflow passes
  // it in; without it, users on an OS the new Electron dropped would be
  // swapped onto an app that cannot launch.
  const minimumSystemVersion = process.env.MAC_MINIMUM_SYSTEM_VERSION?.trim()
  if (minimumSystemVersion) {
    merged.minimumSystemVersion = minimumSystemVersion
  }

  const out = path.join(dir, "latest-mac.yml")
  fs.writeFileSync(out, yaml.dump(merged, { lineWidth: -1, noRefs: true }), "utf8")

  // Drop the per-arch manifests so they are not attached to the release.
  for (const { file } of manifests.values()) {
    fs.rmSync(file, { force: true })
  }

  console.log(
    `Merged ${manifests.size} macOS manifest(s) into ${out} with ${files.length} file entries:`,
  )
  for (const entry of files) {
    console.log(`  - ${entry.url}`)
  }
}

main()
