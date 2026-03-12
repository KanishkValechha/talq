# Talq

Talq is an open source alternative to Slack built with React, Vite, and Convex.

It focuses on real-time team communication with a simple interface, channels, direct messages, presence, typing indicators, and fast search. The goal is to provide a modern chat foundation that anyone can run, fork, and improve in the open.

## Features

- Public channel messaging
- Direct messages
- Real-time updates with Convex
- Password auth and guest access
- Unread counts for channels and DMs
- Read receipts
- Typing indicators
- User presence and last seen state
- Profile editing with avatar uploads
- Message search

## Tech Stack

- React 19
- Vite
- TypeScript
- Convex
- Convex Auth
- Zustand
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Convex account

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd talq
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Convex

Run the Convex dev environment once to link or create a project and generate local env values:

```bash
npx convex dev
```

On first run, Convex will prompt you to create or link a project and will generate local environment values for the app.

This project expects local env values in `.env.local`. At minimum, you should have:

```env
VITE_CONVEX_URL=...
CONVEX_SITE_URL=...
```

`VITE_CONVEX_URL` is used by the frontend client.

`CONVEX_SITE_URL` is used by Convex Auth in [`convex/auth.config.ts`](/C:/Coding/projects/talq/convex/auth.config.ts).

After the project is linked and `.env.local` has been created, you can stop that command and use the normal dev script below.

### 4. Run the app

Start the frontend and backend together:

```bash
npm run dev
```

This runs:

- `vite --open`
- `convex dev`

If you prefer to run them separately:

```bash
npm run dev:frontend
npm run dev:backend
```

## Available Scripts

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run lint
```

`npm run lint` performs TypeScript checks, validates the Convex project, and builds the frontend.

## Project Structure

```text
src/              Frontend app, components, hooks, and state
convex/           Backend schema, queries, mutations, and auth config
setup.mjs         Optional helper for Convex Auth setup workflows
```

## Open Source

Talq is intended to be developed in the open as an open source Slack alternative.

That means:

- The codebase should stay easy to run locally
- Product decisions should be understandable from the repo history
- Contributions should be practical, reviewable, and easy to verify

## Contributing

Contributions are welcome.

Please open a pull request with:

- A clear description of what changed
- Why the change is needed
- A short video showing the feature or fix working

Small fixes can go straight to a PR. For larger changes, opening an issue first is helpful so the direction is clear before implementation starts.

## License

This project is licensed under the MIT License. See [`LICENSE`](/C:/Coding/projects/talq/LICENSE).
