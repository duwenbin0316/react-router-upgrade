### Repo: react-router-upgrade — brief for AI coding agents

This project is a React + TypeScript + Vite single-page app that uses React Router v5, Redux, and Connected Router.

Key places to read first:
- `package.json` — scripts: `dev` (vite), `build` (tsc -b && vite build), `preview`.
- `src/main.tsx` — app bootstrap: `Provider` (Redux) + `ConnectedRouter` + `App`.
- `src/App.tsx` — main router and lazy-loaded pages (uses `react-router-dom` v5 `Switch` and `Route`).
- `store/` — Redux store and `history` integration (`store/index.ts`, `store/history.ts`).
- `pages/` — top-level route handlers and grouped subfolders (e.g. `dashboard`, `workspace`, `strict`).

Architecture notes (what matters for edits):
- The app intentionally stays on React Router v5 APIs (`Switch`, `Route`, `component` prop). Migrations to v6 require converting to `Routes`, element-based routes, and removing `ConnectedRouter` patterns.
- Routing is implemented at two levels: top-level route switches in `App.tsx` and nested route exports inside `pages/*` directories. Changes to route shapes often require touching `App.tsx` and affected page folders.
- Redux is coupled with navigation via `connected-react-router` and a custom `history` object (`store/history.ts`). When modifying navigation logic, update `history` import sites and test Redux action flows.

Developer workflows and commands:
- Start dev server (fast HMR): `npm run dev` or `yarn dev`.
- Build for production: `npm run build` (runs `tsc -b` then `vite build`). Type errors will fail build because of the `tsc -b` step.
- Lint: `npm run lint` uses ESLint configuration in repo root.

Project-specific conventions and patterns:
- Lazy-loaded pages: pages are imported with `React.lazy(() => import('./pages/...'))` in `App.tsx`. Preserve Suspense boundaries when refactoring.
- Route selection uses `useLocation()` + path prefix checks to compute `selectedKey` for the `Menu` in `App.tsx`; prefer updating that function when adding new top-level routes.
- UI library: `antd` with `reset.css` import in `src/main.tsx`.
- TypeScript projects use multiple tsconfig targets (`tsconfig.app.json`, `tsconfig.node.json`). Build uses `tsc -b` so respect project references and composite settings.

Integration points and external dependencies:
- `react-router-dom` v5 (not v6) — many components rely on v5 semantics (`Switch`, `Route component={}`). Search for `react-router-dom` imports when changing routing.
- `connected-react-router` + `history` v4 — navigation actions flow through Redux middleware.
- `react-router-cache-route` — caching routes; check `pages` for any use and preserve their behavior when refactoring routes.
- `antd` and `@ant-design/icons` — UI components and icons used across `pages`.

Editing rules for AI agents (concise):
1. When editing routing, update both `src/App.tsx` and any nested `pages/*` files; preserve `Switch`/`Route` semantics.
2. Do not change React Router major version without explicit task: migration requires code-wide updates (Routes API, `useNavigate`, etc.).
3. When touching Redux or navigation, run `npm run build` (or `tsc -b`) locally to catch type errors due to project references.
4. Keep lazy imports and Suspense wrappers intact for pages; tests and runtime rely on them.
5. Update `store/history.ts` if navigation history behavior is changed; `ConnectedRouter` depends on that single `history` instance.

Helpful examples (where to make small changes):
- Add a new top-level page: create `src/pages/MyPage.tsx`, lazy import it in `src/App.tsx`, add a `Route path="/my" component={MyPage}` and update `selectedKey` logic.
- Add a Redux-connected route action: update `store/index.ts` to add the thunk/reducer, import `history` from `store/history.ts` when dispatching navigation side-effects.

Files to reference for patterns:
- `src/App.tsx`, `src/main.tsx`, `store/history.ts`, `store/index.ts`, `pages/*`

If unsure, run these checks locally before committing:
- `npm run dev` to verify HMR and runtime routing behavior.
- `npm run build` to validate TypeScript composite build and catch type errors.
- `npm run lint` to satisfy eslint rules.

If you find an existing `.github/copilot-instructions.md` or AGENT.md in subfolders, preserve any unique guidance there and merge explanations about local tests or mocks.

Ask the repo owner if you need to migrate to react-router v6 — it's a repo-wide decision and not safe to do piecemeal.

-- End of file

### Note: repo contains a frontend SDK under `js-sdk/` (mini-debug-sdk)

This repository contains a separate, self-contained frontend library in `js-sdk/`. The outer React app imports and tests this SDK. The SDK implements network logging, request/response interception and a small debug UI. AI agents should treat `js-sdk/` as a library subproject with its own build and conventions.

Key SDK files to read first:
- `js-sdk/package.json` — scripts: `build` (rollup -c), `dev` (rollup -c -w).
- `js-sdk/ARCHITECTURE.md` — architecture and module layout (core, interceptors, ui, utils).
- `js-sdk/src/index.js` — SDK entry point.
- `js-sdk/src/core/index.js` — core SDK class and lifecycle.
- `js-sdk/src/interceptors/*` — `network-logger.js`, `request-interceptor.js`, `response-interceptor.js`.
- `js-sdk/rollup.config.js` — packaging formats (UMD, ES, minified builds).
- `js-sdk/examples/` — quick manual test pages (e.g. `basic.html`) used to validate behavior in browsers.

Why this matters:
- The outer React app (root `src/`) imports the SDK for integration tests and demos. Changes to the SDK's public API, bundle shape, or globals (UMD) may break the host app.
- The SDK is distributed via bundle files in `js-sdk/dist/` (UMD / ES). Keep API stability in mind when editing.

SDK-specific editing rules for AI agents:
1. Preserve public API: Do not rename exported functions/classes without updating `js-sdk/src/index.js`, `rollup.config.js`, and any example or consuming code in the outer app (`src/` imports).
2. Build and test locally after changes: run `cd js-sdk && npm run build` to produce `dist/` artifacts; open `js-sdk/examples/basic.html` to manually verify UI and network logging.
3. When adding new interceptors, follow the module pattern in `js-sdk/src/interceptors/` and register them via the core SDK (`js-sdk/src/core/index.js`).
4. UI components live in `js-sdk/src/ui/` and are lightweight vanilla JS widgets (not React). When changing these, verify behavior in example HTML pages.
5. Respect bundle formats: Rollup config produces UMD and ES outputs. If you change bundling or globals, update `rollup.config.js` and `package.json` `main`/`module` fields.

How the outer React app integrates the SDK (examples):
- Local import for testing during development: the host app may import `js-sdk/src/index.js` directly or load `js-sdk/dist/*` in `public/` for manual testing.
- Production usage expects a built bundle (UMD or ES) — ensure `js-sdk` is built before trying to use `dist` from the host app.

Quick SDK developer commands (from repo root):
```bash
# in a separate terminal
cd js-sdk
npm install        # if needed for rollup plugins
npm run dev        # rollup -c -w, watch builds for local SDK development
npm run build      # produce dist/ bundles (UMD/ES/minified)
```

Integration sanity checks:
- After building SDK, run the host app dev server (`npm run dev`) and exercise pages using the SDK (examples or `src/DebugTest.tsx`) to ensure no runtime errors.
- If the host app imports source files directly during development, note that TypeScript/ES builds in the host may not process SDK source; prefer using built bundles for stable tests.

Files that exemplify SDK usage in this repo:
- `js-sdk/examples/basic.html` — manual smoke test for logging/interceptors.
- `src/DebugTest.tsx` — shows how the host app triggers SDK flows.

If you plan larger changes to `js-sdk` (API, package format, or major refactor): create a feature branch, update `ARCHITECTURE.md` with the design decision, update examples, and run `npm run build` in `js-sdk` plus `npm run build` in the host to catch type and bundling issues.

---

If you'd like,我可以：
- 把 `js-sdk/ARCHITECTURE.md` 的关键段落摘录并放入本文件的“设计要点”中（便于 AI 离线读取）。
- 为 `js-sdk` 添加一个最小 README->`js-sdk/README.md`（如果缺失）来列出快速开始命令。

请告诉我你想如何合并更多 `js-sdk` 的细节（或让我把 `ARCHITECTURE.md` 的摘要直接写入本文件）。
