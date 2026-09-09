# Locales

Translations for the desktop app. Adding a language is one new file plus one line in `index.ts`.

## Add a language

**1. Create the dictionary.** Copy an existing file, e.g. `pt-BR.ts`:

```ts
export const ptBR: Record<string, string> = {
  Installed: "Instalado",
  Settings: "Configurações",
}
```

**2. Register it** in `index.ts`:

```ts
export const LOCALES = [
  { code: "en",    label: "English",  dict: {} },
  { code: "zh-CN", label: "简体中文",  dict: zhCN },
  { code: "pt-BR", label: "Português (Brasil)", dict: ptBR },  // <- one line
] as const satisfies ...
```

`label` is the **endonym** — the language's own name (`Português`, not `Portuguese`). That is what people look for in a language menu.

**3. That's it.** The `Locale` type is derived from that array, and the settings selector and the locale resolver both enumerate from it. You do not touch `lib/i18n.ts` or any component.

## How keys work

**The key is the English source string**, not a namespaced identifier:

```tsx
{t("Install method")}      // ✅
{t("settings.install")}    // ❌ not how this works
```

A key with no entry falls back to the key itself, so an untranslated string renders in **English** — never as a missing-key placeholder, never as a crash.

Three things follow from that, and they are the point:

- **A partial translation is shippable.** Land 40 strings now, the rest later. Nothing breaks in between.
- **English needs no dictionary.** `en` is an empty object and is always 100% complete.
- **An upstream copy change degrades gracefully.** If someone rewords a string and your dictionary still has the old key, that one string reverts to English. Run the drift check (below) to find it.

**Do not translate brand or product names** — SkillsGate, Cursor, GitHub Copilot, Droid CLI. Leave them out of the dictionary entirely and they fall through to English.

## Check your work

```bash
npm run i18n:check -w apps/desktop
```

Reports, per locale:

| | meaning |
|---|---|
| `missing` | called in the UI but not in your dictionary — will render English |
| `orphaned` | in your dictionary but no longer called — a dead entry, usually after an upstream copy change |
| `duplicate` | the same key twice in one file — the later one silently wins |

Exits non-zero on `missing` or `duplicate`. `orphaned` is reported but does not fail, since it costs nothing at runtime.

### One caveat worth knowing

The check is a static text scan. It sees `t("literal")` but cannot resolve `t(someVariable)` — where the key lives in data rather than at the call site, as with the sidebar nav labels. Those are listed separately at the end of the report, and **a dictionary entry reached only that way will be reported as orphaned even though it is used**. Don't delete it. The script tells you how many such call sites exist so the number stays honest.
