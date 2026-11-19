# Implementation Plan: Rename the app to AI FitCoach

**Spec**: [spec.md](./spec.md)

## Constitution Check
- VI Bilingual: name is the same in both languages; surrounding copy updated in `en` and `pt`. PASS
- VII Security by Default: text-only change; no new sink, request or dependency. N/A
- Tests: E2E checks every place the name is shown and that the old names are gone (RED before the rename). PASS

## Where the name lives
```
src/app/layout.tsx                    # <title>, description, Open Graph, Twitter, appleWebApp.title
src/app/client-layout.tsx             # application-name; duplicate apple-mobile-web-app-title removed
public/manifest.json                  # name, short_name, description
public/offline.html                   # <title>
src/lib/i18n/translations.ts          # app.name, app.description (en, pt)
src/lib/i18n/locales/{en,pt}/about.ts # About title and description
README.md                             # project title
e2e/branding.spec.ts                  # new
```

## Decisions
- **`short_name` = full name**: "AI FitCoach" is 11 characters, so there is no need for a shorter variant.
- **One iOS title tag**: the page had two `apple-mobile-web-app-title` tags (Next metadata "AI Personal Trainer" and a hand-written "AI Trainer"); the hand-written one is removed so metadata is the single source.
- **Docs**: README shows the product name; CLAUDE.md and the constitution keep naming the repository and are left as they are.
