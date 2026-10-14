# Implementation Plan: Migrate to Tailwind CSS 4

**Spec**: [spec.md](./spec.md)

## Constitution Check
- IV Simplicity: official upgrade tool; manual changes limited to v3-compat CSS, one no-op class, one dead config file. PASS
- VII Security (dependencies): removes the Tailwind 3 advisory chain. PASS
- Verification: pixel diff of every screen. PASS

## Changes
```
package.json             tailwindcss ^4, + @tailwindcss/postcss, - autoprefixer (v4 handles prefixes)
tailwind.config.js       removed: theme moved to `@theme` in src/app/globals.css
postcss.config.js        @tailwindcss/postcss
postcss.config.mjs       removed (unused duplicate from the Next.js template)
src/app/globals.css      @import 'tailwindcss', @theme, v3 compat (border colour, placeholder,
                         button cursor), form-control rules moved to the utilities layer
src/**/*.tsx             class renames by the tool (shadow-sm -> shadow-xs, rounded -> rounded-sm,
                         flex-shrink-0 -> shrink-0, outline-none -> outline-hidden, ...)
src/app/home/page.tsx    removed `flex-2` (did nothing in v3, became flex: 2 in v4)
scripts/visual-snapshots.mjs, scripts/visual-diff.mjs
```

## Decisions
- **Form controls in the utilities layer**: v3 "layers" were only ordering, so `input[type='radio']` (specificity 0,1,1) beat `.h-4` (0,1,0). v4 uses native cascade layers where any utility beats any base rule, which shrank radios to 16 px. Putting the rules in the utilities layer makes specificity decide again, so `disabled:cursor-not-allowed` still wins.
- **Removed `flex-2`** instead of keeping v4's new meaning: the goal is "looks identical".

## Visual regression procedure
1. Build `main` and this branch; start each with `npx next start` in a container that keeps running (`... & sleep infinity`).
2. Run `scripts/visual-snapshots.mjs <dir>` with Playwright sharing the container network (`--network container:<name>`, `BASE=http://localhost:3000`), once per build.
3. `node scripts/visual-diff.mjs before after diff` prints the % of differing pixels per screenshot and writes diff images.
Run the same build twice first: the noise floor measured 0.00 %.
