# Coinquest 🪙

A gamified personal-finance app — your real spending, worn as a neo-brutalist retro RPG. Money has *health*, spending categories are *boss battles*, and good habits earn XP and coins. Built cross-platform (**React Native / Expo**), **iOS-first**, fully on-device.

> The finance is the product; the game is the skin. Real amounts and real merchants are always the loudest thing on screen.

## Repo layout

| Path | What |
|------|------|
| [`DESIGN.md`](./DESIGN.md) | The **Coinquest Arcade** design system (light theme, semantic color, tokens, governance rules). |
| [`SPEC.md`](./SPEC.md) | v1 build spec — stack, ingestion, engines, data model, phases. |
| [`designs/`](./designs) | All v1 screen designs — PNG + exported HTML + per-screen docs ([`designs/README.md`](./designs/README.md)). |
| [`brand/`](./brand) | Logo / coin / app-icon assets. |
| [`app/`](./app) | The Expo (React Native + TypeScript) application. |

## Run the app

```bash
cd app
npm install
npx expo start
# press  w  to open in a browser, or scan the QR with a dev build
```

The neo-brutalist **widget kit** lives in `app/components/` and reads tokens from `app/theme.ts`.

## Status

- ✅ Design system + full v1 screen set (light theme)
- ✅ P0 — Expo scaffold + widget kit
- ⏳ P1 — email (IMAP) ingestion + receipt parser + Ledger

## Stack (v1)

React Native + Expo · TypeScript · Zustand · SQLite (encrypted) · IMAP email capture · on-device parsing · Apple Foundation Models (optional, on-device) · **no backend, $0 to run**.
