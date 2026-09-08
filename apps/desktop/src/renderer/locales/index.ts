/**
 * Locale registry — the single extension point for adding a language.
 *
 * To add one:
 *   1. Create `./<code>.ts` exporting a `Record<string, string>` dictionary.
 *   2. Add one entry to `LOCALES` below.
 *
 * Nothing else changes. The settings selector, the locale resolver and any
 * future tooling all enumerate languages from this list, so contributors never
 * touch `lib/i18n.ts` or any component.
 *
 * `label` is the language's endonym (`简体中文`, not "Chinese") — that is what
 * people scan for in a language menu.
 */

import { zhCN } from "./zh-CN"

type Dict = Record<string, string>

/**
 * English carries an empty dictionary by design: translation keys *are* the
 * English source strings, so every lookup falls through to the key itself.
 * English is therefore always 100% complete and needs no maintenance.
 */
export const LOCALES = [
  { code: "en", label: "English", dict: {} as Dict },
  { code: "zh-CN", label: "简体中文", dict: zhCN },
] as const satisfies ReadonlyArray<{ code: string; label: string; dict: Dict }>

/** Derived from the registry, so adding a language does not touch this type. */
export type Locale = (typeof LOCALES)[number]["code"]

export const DEFAULT_LOCALE: Locale = "en"

export function isSupportedLocale(value: unknown): value is Locale {
  return LOCALES.some((entry) => entry.code === value)
}

export function dictFor(locale: Locale): Dict {
  return LOCALES.find((entry) => entry.code === locale)?.dict ?? {}
}
