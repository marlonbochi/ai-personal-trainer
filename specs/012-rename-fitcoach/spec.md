# Feature Specification: Rename the app to AI FitCoach

**Feature Branch**: `rename-fitcoach`
**Status**: Implemented (pending user review)
**Input**: "The app is called AI Trainer, which sounds like it trains the AI. I liked AI FitCoach; the English name is better."

## Why

"AI Trainer" / "AI Personal Trainer" reads as "someone who trains an AI". "AI FitCoach" says what the app is: a fitness coach (workouts and nutrition) powered by AI, and works the same in English and Portuguese.

## User Story (P1)

As a user, everywhere the app shows its name (browser tab, home-screen icon, install prompt, About page, offline page, link previews) I see **AI FitCoach**, in both languages.

**Acceptance**:
1. Page titles, Open Graph/Twitter metadata, `application-name` and `apple-mobile-web-app-title` are `AI FitCoach`.
2. The PWA manifest `name` and `short_name` are `AI FitCoach` (11 characters, fits under a home-screen icon).
3. The About page and the app description say "AI FitCoach" in en and pt.
4. The old names ("AI Trainer", "AI Personal Trainer") appear nowhere in the UI, manifest or offline page.

## Out of scope
- Repository name, domain (`aitrainer.marlonbochi.com.br`) and the Vercel project name.
- Icon artwork (it has no text).
- Users who already installed the PWA see the new name only after the browser refreshes the manifest (it can take days; Android may need a reinstall).
