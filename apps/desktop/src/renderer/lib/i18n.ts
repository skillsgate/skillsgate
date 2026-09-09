/**
 * Minimal i18n layer.
 *
 * Design notes (read before "optimising" them away):
 *  1. **Keys are the English source string**, not a separate key namespace.
 *     If an upstream string changes and a dictionary is not updated, that entry
 *     simply falls back to English — nothing breaks, and nothing points at a
 *     missing key. It also means a partial translation is shippable.
 *  2. **No external dependency and no new IPC surface.** The saved preference
 *     rides the existing settings channel; `package.json` and the lockfile are
 *     untouched, so there is no dependency tree to reconcile on rebase.
 *  3. Brand and agent names (SkillsGate, Cursor, GitHub Copilot, ...) are
 *     deliberately left out of dictionaries and fall through to English.
 */

import { useSyncExternalStore } from "react"
import {
  DEFAULT_LOCALE,
  LOCALES,
  dictFor,
  isSupportedLocale,
  type Locale,
} from "../locales"
import { electronAPI } from "./electron-api"

export type { Locale }
export { LOCALES }

/** Settings key holding the user's explicit choice. Absent = follow the system. */
const SETTINGS_KEY = "ui.locale"

let current: Locale = DEFAULT_LOCALE
let dict: Record<string, string> = dictFor(DEFAULT_LOCALE)

const listeners = new Set<() => void>()

/**
 * Resolution order: saved preference → system locale (exact match such as
 * `pt-BR`, then base language `pt`) → English.
 */
export function resolveLocale(
  saved: unknown,
  systemLocale: string | undefined,
): Locale {
  if (isSupportedLocale(saved)) return saved

  if (systemLocale) {
    if (isSupportedLocale(systemLocale)) return systemLocale
    const base = systemLocale.split("-")[0]
    const match = LOCALES.find((entry) => entry.code.split("-")[0] === base)
    if (match) return match.code
  }

  return DEFAULT_LOCALE
}

export function getLocale(): Locale {
  return current
}

export function setLocale(locale: Locale): void {
  if (locale === current) return
  current = locale
  dict = dictFor(locale)
  for (const listener of listeners) listener()
}

/**
 * Resolves the startup locale. Call and await this before the first render so
 * the UI never flashes English before switching.
 */
export async function initLocale(): Promise<Locale> {
  let saved: unknown = null
  try {
    saved = await electronAPI.settingsGet<unknown>(SETTINGS_KEY, null)
  } catch {
    // Settings unavailable — fall through to the system locale.
  }
  setLocale(resolveLocale(saved, navigator.language))
  return current
}

/** Applies the choice immediately, then persists it. */
export async function changeLocale(locale: Locale): Promise<void> {
  setLocale(locale)
  try {
    await electronAPI.settingsSet(SETTINGS_KEY, locale)
  } catch (err) {
    console.error("Failed to persist locale:", err)
  }
}

/** Look up a translation. Falls back to the key, i.e. the English source string. */
export function t(key: string): string {
  return dict[key] ?? key
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Subscribes a component to locale changes.
 *
 * Used at the app root to key the tree on the current locale: `t()` is a plain
 * function, so `memo`ised components (there are several) would otherwise keep
 * rendering the previous language until their props happened to change.
 */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale, getLocale)
}
