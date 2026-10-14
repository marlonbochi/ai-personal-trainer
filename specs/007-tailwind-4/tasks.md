# Tasks: Migrate to Tailwind CSS 4

- [x] T001 Baseline screenshots of `main` (18) + noise floor (0.00 %)
- [x] T002 `npx @tailwindcss/upgrade`
- [x] T003 Remove duplicate `postcss.config.mjs`; v3 compat for placeholder and button cursor
- [x] T004 Diff: radios/checkboxes and home buttons changed -> form rules to utilities layer, drop `flex-2`
- [x] T005 Diff again: 0.00 % on all 18; computed styles checked (size, cursor enabled/disabled)
- [x] T006 Unit tests, build, tsc, integration
- [ ] T007 Accept the browser support trade-off (spec) before merging
- [ ] T008 After merge: strike SECURITY.md row 1b (kept out of this branch to avoid a conflict with `replace-next-pwa`)
