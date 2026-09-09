#!/usr/bin/env node
/**
 * i18n drift check.
 *
 * Diffs the t() call sites in apps/desktop against every dictionary in
 * src/renderer/locales, and reports:
 *
 *   missing   called but not translated  -> renders in English
 *   orphaned  translated but not called  -> dead entry
 *   dynamic   t(<expression>)            -> cannot be checked statically
 *
 * Run:  node scripts/i18n-drift.mjs [--check]
 *       --check exits 1 when any locale has missing keys, so this can gate CI.
 *
 * This is a static text scan, not a type-aware pass: it reads source with
 * regular expressions and has no compiler in the loop. That is a deliberate
 * trade (no dependency, runs anywhere node does) and it has consequences —
 * see "Known limits" at the bottom of this file.
 */

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const SRC = join(ROOT, "src")
const LOCALES = join(SRC, "renderer", "locales")

/** t("literal"), tolerating the trailing comma Prettier adds when it wraps. */
const LITERAL_CALL = /\bt\(\s*"((?:[^"\\]|\\.)*)"\s*,?\s*\)/g
/**
 * t(<expression>) — a variable, template literal, concatenation.
 * Excludes t(" (handled above), t() in prose, and the `t(key: string)` in the
 * declaration of t itself. The lookaheads consume their own whitespace: with
 * a leading \s* the engine backtracks it to zero and tests the assertion
 * against the newline instead of the quote, which lets wrapped literal calls
 * leak in here.
 */
const DYNAMIC_CALL = /\bt\((?!\s*["\)])(?!\s*[A-Za-z_$][\w$]*\s*:)/g
/** One dictionary entry: two-space indented bare or quoted key, then a string. */
const DICT_ENTRY = /^ {2}(?:"((?:[^"\\]|\\.)*)"|([A-Za-z_$][\w$]*))\s*:\s*"/gm

/**
 * Strip comments before scanning. Without this, the t() written in a JSDoc
 * block or a JSX comment explaining the i18n layer counts as a call site.
 * Block comments cover JSDoc and {/* ... *\/}; only whole-line // comments are
 * removed, to avoid mangling a "https://" inside a string.
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^[ \t]*\/\/.*$/gm, "")
}

function unescape(raw) {
  return raw.replace(/\\(.)/g, (_, c) => (c === "n" ? "\n" : c === "t" ? "\t" : c))
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(full)) out.push(full)
  }
  return out
}

// --- call sites -------------------------------------------------------------

const callSites = new Map() // key -> [files]
const dynamicSites = []

for (const file of walk(SRC)) {
  if (file.startsWith(LOCALES)) continue
  const text = stripComments(readFileSync(file, "utf8"))
  const where = relative(ROOT, file)

  for (const m of text.matchAll(LITERAL_CALL)) {
    const key = unescape(m[1])
    if (!callSites.has(key)) callSites.set(key, [])
    callSites.get(key).push(where)
  }
  for (const m of text.matchAll(DYNAMIC_CALL)) {
    const line = text.slice(0, m.index).split("\n").length
    dynamicSites.push(`${where}:${line}`)
  }
}

// --- dictionaries -----------------------------------------------------------

const dictFiles = readdirSync(LOCALES)
  .filter((f) => /\.ts$/.test(f) && f !== "index.ts")
  .sort()

if (dictFiles.length === 0) {
  console.error("i18n-drift: no dictionaries found in src/renderer/locales")
  process.exit(2)
}

const dicts = new Map() // locale -> { keys:Set, duplicates:[] }

for (const file of dictFiles) {
  const text = readFileSync(join(LOCALES, file), "utf8")
  const keys = new Set()
  const duplicates = []
  for (const m of text.matchAll(DICT_ENTRY)) {
    const key = unescape(m[1] ?? m[2])
    if (keys.has(key)) duplicates.push(key)
    keys.add(key)
  }
  // A dictionary that parses to nothing means the scan broke, not that the
  // translation vanished. Fail loudly rather than reporting every key missing.
  if (keys.size === 0) {
    console.error(`i18n-drift: parsed 0 entries from ${file} — the scan is broken, not the translation`)
    process.exit(2)
  }
  dicts.set(file.replace(/\.ts$/, ""), { keys, duplicates })
}

// --- report -----------------------------------------------------------------

const called = new Set(callSites.keys())
const check = process.argv.includes("--check")
let failed = false

console.log(`i18n drift — ${called.size} literal t() call sites in apps/desktop\n`)

for (const [locale, { keys, duplicates }] of dicts) {
  const missing = [...called].filter((k) => !keys.has(k)).sort()
  const orphaned = [...keys].filter((k) => !called.has(k)).sort()

  console.log(`${locale}: ${keys.size} entries · ${missing.length} missing · ${orphaned.length} orphaned`)

  for (const key of missing) console.log(`  missing   ${JSON.stringify(key)}  (${callSites.get(key)[0]})`)
  for (const key of orphaned) console.log(`  orphaned  ${JSON.stringify(key)}`)
  for (const key of duplicates) console.log(`  duplicate ${JSON.stringify(key)}  (later entry wins)`)

  if (missing.length > 0 || duplicates.length > 0) failed = true
  console.log()
}

if (dynamicSites.length > 0) {
  console.log(`${dynamicSites.length} dynamic call site(s) — t(<expression>), not statically checkable:`)
  for (const site of dynamicSites) console.log(`  ${site}`)
  console.log(
    "\nThese keys live in data rather than at the call site (e.g. the sidebar nav\n" +
      "labels). They are real keys, so a dictionary entry for them will read as\n" +
      "orphaned above even though it is used. Check them by hand when they change.",
  )
}

if (check && failed) {
  console.error("\ni18n-drift: failing because a locale has missing or duplicate keys")
  process.exit(1)
}

/**
 * Known limits, in the order you are likely to hit them:
 *
 * 1. Only t("literal") is seen. t(variable) is counted and listed, not resolved.
 * 2. Keys reached only through a dynamic call site show up as orphaned. That is
 *    a false positive by construction, not a bug to fix by deleting the entry.
 * 3. A t("...") inside a comment or a disabled code path still counts as called.
 * 4. Dictionary parsing assumes the two-space indented object literal shape the
 *    existing locale files use. Reformat them and the parser needs updating —
 *    it fails loudly (exit 2) rather than silently reporting zero coverage.
 */
