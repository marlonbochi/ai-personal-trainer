# 🏋️ AI Personal Trainer

An AI-powered app that generates a personalized weekly **workout routine** and **meal plan** from a short questionnaire. Fill in your profile and goals, and the app asks the [Gemini API](https://ai.google.dev/) to put together a plan tailored to you.

**Live app:** [aitrainer.marlonbochi.com.br](https://aitrainer.marlonbochi.com.br)

## How it works

The app has two independent generators, each backed by its own form and API route:

### 💪 Workout plan (`/generate-workout`)
Answer a few questions and get a day-by-day training split:
- Age and gender
- Fitness level (beginner / intermediate / advanced)
- Main goal (weight loss, muscle gain, endurance, strength)
- Session duration (15 / 30 / 45 / 60 min)
- Training days of the week
- Where you'll train (gym or home)
- Specific focus areas (chest, back, legs, shoulders, arms, core, cardio)
- Injuries or limitations
- Any additional notes

The result is a collapsible weekly schedule with exercises and descriptions per day, generated at [`/api/workout`](src/pages/api/workout.ts).

### 🥗 Nutrition plan (`/generate-nutrition`)
A similar questionnaire tailored to diet:
- Age and gender
- Diet goal (weight loss, muscle gain, maintenance, endurance)
- Daily calorie target
- Weekly grocery budget
- Meals per day
- Additional notes (restrictions, allergies, preferences, etc.)

The result is a full week of meals (breakfast, lunch, dinner, snacks) with ingredients, preparation steps, and macros, generated at [`/api/nutrition`](src/pages/api/nutrition.ts).

All the narrowing questions exist to give the AI enough context to produce a plan that actually fits the user, instead of a generic one-size-fits-all routine.

Both forms remember your last answers (`localStorage`) and the generated plans are also kept client-side, so you can revisit `/workout` and `/nutrition` without regenerating.

## Tech stack

- **[Next.js](https://nextjs.org)** (App Router + a couple of Pages API routes) with **React 19** and **TypeScript**
- **[Tailwind CSS](https://tailwindcss.com)** for styling
- **[Gemini API](https://ai.google.dev/)** for plan generation — chosen because it had a free tier suitable for this at the time
- **PWA support** ([`next-pwa`](https://github.com/shadowwalker/next-pwa) + Workbox) — installable, works offline for cached pages
- **i18n** — English and Portuguese, see [`src/lib/i18n`](src/lib/i18n)
- Deployed on **[Vercel](https://vercel.com)**

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 22+
- A [Gemini API key](https://ai.google.dev/) (the app won't be able to generate plans without one)

### 1. Clone and configure environment variables

```bash
git clone https://github.com/marlonbochi/ai-personal-trainer.git
cd ai-personal-trainer
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Your Gemini API key |
| `GEMINI_API_URL` | Gemini endpoint used to generate content |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app (defaults to `http://localhost:3000` locally) |

### 2. Run it

You can run the project either directly with Node or with Docker — pick whichever you prefer.

#### Option A — Node

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

#### Option B — Docker (recommended for a no-hassle local setup)

No need to install Node or run a build yourself — this spins up a dev server with hot reload inside a container:

```bash
docker compose up
```

Open [http://localhost:3001](http://localhost:3001) (mapped to the container's port 3000; edit the port in [`docker-compose.yml`](docker-compose.yml) if it clashes with something else you have running).

Stop it with:

```bash
docker compose down
```

## Project structure

```
src/
├── app/                  # Pages (App Router): home, workout, nutrition, generators, about
├── components/           # Navbar, PWA install prompt, etc.
├── lib/
│   ├── api.ts            # fetch wrapper used by the client forms
│   └── i18n/              # translations (en/pt) and language context
├── middleware/            # origin validation middleware
├── models/                 # shared types (e.g. nutrition week plan)
└── pages/api/              # /api/workout and /api/nutrition (Gemini calls)
```

## License

Personal project by [Marlon Bochi](https://marlonbochi.com.br). No license file yet — ask before reusing.
