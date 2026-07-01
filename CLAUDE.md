# Olympics UI Contribution Guide

This guide provides context for coding agents working in this repository. Olympics UI is the frontend for a family "olympics" yard-games tournament: a React 19 + TypeScript SPA built with Vite, styled with MUI (Material UI v9) in an amber/gold dark theme, state managed with Redux Toolkit, authenticated via OIDC, and kept in sync over a WebSocket. It ships as a Docker image served by NGINX and is deployed via the sibling `charts/olympics` Helm chart. The backend is the sibling `olympics-api` workspace.

The architecture mirrors the sibling `squares` UI; look there for the canonical pattern, but this app is intentionally leaner (no tests, minimal toasts).

## Product shape (fixed and opinionated)

- One tournament at a time. **Only an olympics admin** (OIDC group `olympics-admin`) can create it; anyone can view without logging in (a link gets shared).
- The tournament moves through stages: `setup → teams_generated → group_stage → playoffs → finished`. The UI is organized as one page per stage under a shared layout, and all connected viewers are carried forward automatically over WebSocket as the admin advances stages.
- Fixed format lives on the backend (teams of 2, groups of 6, everyone advances, games Darts/Bocce/Cornhole). The UI does not offer knobs for these.

## Directory overview

- `src/`
  - `main.tsx` – entrypoint. Configures `AuthProvider` (oidc-client-ts), MUI `ThemeProvider` + theme, the Redux `Provider`, the `ToastProvider`, and `react-router-dom` routes.
  - `App.tsx` – app shell: `Header`, `<Outlet />`, and the silent OIDC sign-in effect. No footer.
  - `theme.ts` – the amber/gold MUI theme plus `gradients` tokens.
  - `pages/`
    - `landing/LandingPage.tsx` – animated, game-themed hero. Shows the leadup (no active tournament, admin can create) or a CTA into the active/finished tournament.
    - `tournaments/` – `TournamentLayout.tsx` (fetches the bundle, renders the stage stepper + delete + the WebSocket wiring + score popup + champion modal), `StageRedirect.tsx` (index → current stage), and one page per stage: `SetupPage`, `TeamsPage`, `GroupsPage`, `BracketPage`. `stages.ts` maps status → stage.
    - `auth/CallbackPage.tsx`, `error/NotFoundPage.tsx`.
  - `components/`
    - `header/Header.tsx` – gold app bar with login/logout.
    - `landing/` – `FloatingIcons`, `Emblem`, `CreateTournamentDialog`, and `animations.ts` (shared `keyframes`).
    - `tournament/` – `MatchCard`, `StandingsTable`, `ScoreDialog`, `Bracket` (custom March-Madness bracket), `ScorePopup` (timed), `ChampionModal` (must-close final celebration).
    - `toast/` – `ToastProvider.tsx` (the component) and `toastContext.ts` (context + `useToast` hook, kept separate so the provider file only exports a component — react-refresh rule).
  - `features/tournaments/` – Redux Toolkit slice, thunks, selectors (the only stateful domain).
  - `app/store.ts` – `configureStore`; exports `RootState`, `AppDispatch`, `AppStore`.
  - `service/` – `tournamentService.ts` (axios calls) and `handleError.ts`.
  - `axios/api.ts` – shared axios instance + `setupAxiosInterceptors` (attaches the OIDC token; public GETs still work signed out).
  - `hooks/` – `reduxHooks` (typed `useAppDispatch`/`useAppSelector`), `useAxiosAuth`, `useTournament` (shared data + action layer for stage pages), `useTournamentSocket` (native WebSocket subscription).
  - `types/` – `tournament.ts`, `ws.ts`, `error.ts`.
  - `utils/` – `oidcHelpers.ts` (silent-refresh detection, `getUsername`, `isOlympicsAdmin`), `sanitize.ts`.

## Tooling

- Package manager: **pnpm**. `pnpm dev`, `pnpm build` (runs `tsc -b` then `vite build`), `pnpm preview`, `pnpm lint` (ESLint flat config), `pnpm type-check` (`tsc --noEmit`), `pnpm format` (Prettier).
- **No tests.** CI runs install → type-check → lint → build → uploads `dist/` → builds/pushes the Docker image. Keep type-check, lint, and build green.
- Build/lint on Windows: run via `pnpm` (PowerShell). Vite/rolldown emits a `dist/` the NGINX image serves.

## Code style

- Function components in `.tsx`; page files `export default`, shared components use named exports.
- Props via a local `interface Props { ... }`. Use **MUI v9** primitives, the `sx` prop, and theme tokens; animations use `keyframes` from `@emotion/react` (see `components/landing/animations.ts`). Do not import from `@mui/system` (not a direct dependency — it breaks under pnpm's strict resolution).
- Always use the typed `useAppDispatch`/`useAppSelector`.
- **No em dashes anywhere in UI copy or comments.**
- Never type with `any`; sanitize user-controlled strings via `utils/sanitize.ts`.
- Avoid comments unless genuinely non-obvious.

## State, services & data flow

Strict **page/hook → service → backend** with Redux as the cache for tournament data:

- `features/tournaments/tournamentsSlice.ts` owns `list`, `current`, `matches`, `standings`, `bracket`. Thunks (`tournamentsThunks.ts`) call `service/tournamentService.ts` (never axios directly). Selectors are the only way components read slice state.
- `hooks/useTournament(id)` is the shared layer stage pages use: it exposes `tournament`, `matches`, `standings`, `bracket`, `canManage` (creator or admin), `busy`, `runAction` (dispatch a mutation thunk then reload the bundle), and `handleRecord`.
- Mutations return the reloaded bundle via `fetchTournamentBundle`. On failure `runAction` swallows the error (no toast) and returns false.

## Toasts (deliberately minimal, no Redux)

`components/toast` is a small React context (`toastContext.ts` + `ToastProvider.tsx`), mounted in `main.tsx`. Use `useToast()` sparingly — currently only to block tied scores and confirm a player swap. Do not route general errors through it.

## Authentication

- OIDC configured in `main.tsx` (`AuthProvider`, oidc-client-ts, `localStorage` store). `hooks/useAxiosAuth` syncs the token into the shared axios instance; `App.tsx` runs a silent sign-in on load.
- Read auth with `useAuth()` from `react-oidc-context`; `utils/oidcHelpers` extract `getUsername` and `isOlympicsAdmin`. Management controls render only when `canManage`.

## Real-time (WebSockets)

- `hooks/useTournamentSocket(id, onMessage)` opens a native WebSocket to `.../ws/tournaments/:id` (public, no token) and reconnects on drop. It is mounted once in `TournamentLayout`.
- On `tournament_updated` the layout reloads the bundle and, if the status changed, navigates every viewer to the new stage. `score_recorded` drives `ScorePopup` (suppressed for the final, which the `ChampionModal` celebrates). `tournament_deleted` sends viewers home. Message shapes are in `types/ws.ts`.

## Routing & pages

Routes are in `main.tsx` with `createBrowserRouter`, all under the `App` layout. The tournament routes nest under `TournamentLayout`; add a new stage page under `pages/tournaments/` and a nested route + `stages.ts` entry. Use `<Link>`/`useNavigate` for navigation.

## Deployment

- Production build emits `dist/`, served by NGINX via [Dockerfile](Dockerfile) + [nginx.conf](nginx.conf) (keep the SPA fallback `try_files ... /index.html` and the `/health` endpoint). CI uploads `dist/` and the Docker CI builds the image from it.
- Single replica (`charts/olympics`, namespace `apps`). Don't change the chart from this repo unless asked — coordinate via the `charts` workspace.
- Set the OIDC `client_id` (via `VITE_OIDC_CLIENT_ID` or the fallback in `main.tsx`) and the API base URL in `axios/api.ts` for prod (`https://olympics-api.maxstash.io`).

## Commit conventions

Conventional commits. Types: `feat`, `fix`, `refactor`, `chore`, `ci`, `docs`, `style`. Scopes (optional): `pages`, `components`, `features`, `hooks`, `service`, `store`, `auth`, `ws`, `toast`, `build`, `deploy`.

Always run `pnpm type-check`, `pnpm lint`, and `pnpm build` before committing.
