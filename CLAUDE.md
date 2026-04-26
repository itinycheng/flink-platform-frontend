# Flink Platform Frontend

Vue 2 admin dashboard for managing Flink workflow jobs, built on vue-admin-template.

## Tech Stack

- **Vue 2.6** + **Vuex 3** + **Vue Router 3**
- **Element UI 2.15** — UI component library
- **Axios 0.18** — HTTP client, wrapped in `src/utils/request.js`
- **@antv/x6** — DAG graph editor for workflow visualization
- **SCSS** — styles

## Dev Commands

```bash
npm run dev          # start dev server (port 9528)
npm run build:prod   # production build
npm run lint         # eslint check
npm run lint:fix     # eslint auto-fix
```

## Project Structure

```
src/
  api/          # API layer — one file per domain (user.js, workspace.js, job.js ...)
  store/
    modules/    # Vuex modules: user, workspace, app, settings
    getters.js  # root getters — all module state exposed here
  views/
    manage/     # CRUD management pages (user, workspace, config, alert ...)
    project/    # Job flow definitions, instances, job runs
    graph/      # Visual DAG editor
    dashboard/  # Statistics dashboard
  layout/
    components/
      Navbar.vue      # Top bar — workspace switcher + user avatar
      Sidebar/        # Left nav — route-driven, renders all routes from router
  utils/
    request.js  # Axios instance — injects X-Token and X-Workspace-Id headers
    auth.js     # Token localStorage helpers (getToken / setToken / removeToken)
    workspace.js # Workspace localStorage helpers (getWorkspaceId / setWorkspaceId / removeWorkspaceId)
  permission.js # Route guard — getInfo + fetchWorkspaceList on first entry
  router/
    index.js    # All routes defined here; meta.superAdminOnly hides from non-admins
```

## Key Patterns

### API files
Every API file follows this pattern:
```js
import request from '@/utils/request'

export function getXxxPage(query) {
  return request({ url: '/xxx/page', method: 'get', params: query }).then(res => res.data)
}
export function createXxx(data) {
  return request({ url: '/xxx/create', method: 'post', data }).then(res => res.data)
}
```

### Manage pages
All pages under `src/views/manage/` follow the same layout: filter bar → table → pagination → el-dialog form. Use `src/views/manage/config.vue` as the reference template.

### Vuex modules
Follow the `getDefaultState` + mutations + actions pattern. See `src/store/modules/user.js` or `src/store/modules/workspace.js`.

### Request headers
`src/utils/request.js` automatically injects:
- `X-Token` — from `localStorage` (via `getToken()` in `src/utils/auth.js`; note: localStorage rather than HttpOnly cookie is intentional for SSO redirect compatibility)
- `X-Workspace-Id` — from `store.getters.currentWorkspace?.id`

### Route guard (`src/permission.js`)
On first authenticated route entry (fresh load or page refresh), `loadUserSession` runs:
1. `user/getInfo` — fetches name, avatar
2. `workspace/fetchWorkspaceList` — fetches workspace list, restores last selection from localStorage, sets `currentWorkspace`
3. If no workspace available → redirects to `/no-workspace`

SSO flow: `doSsoCallback` checks for a `ticket` param in the URL, exchanges it via `user/authenticate`, strips the param with `history.replaceState`, then redirects to `/`.

`whiteList`: `['/login', '/no-workspace']` — these routes skip the auth check.

### SUPER_ADMIN-only sidebar items
The `superAdminOnly` sidebar filtering has been removed. The Sidebar renders all routes from `this.$router.options.routes` without any role check. `globalRole` has also been removed from the Vuex user module. If per-role route visibility is needed again, both the `getInfo` response mapping and the Sidebar render logic must be updated.

## Workspace Feature

Each task/job belongs to a workspace. Users have roles per workspace (ADMIN / DEVELOPER / OPERATOR / VIEWER) plus an optional global role (SUPER_ADMIN).

- **Login flow**: backend returns `{ token, workspaceId }` — frontend sends `workspaceId` hint from localStorage so backend can validate/restore last selection
- **Switching**: Navbar dropdown → `workspace/switchWorkspace(id)` → `window.location.reload()` (full reload so all views re-fetch with the new workspace header)

## Backend

- Base URL: `http://localhost:9104` (dev), configured in `.env.development`
- Auth interceptor requires `X-Token` on all endpoints except `/login`
- Workspace interceptor requires `X-Workspace-Id` on all endpoints except `/login`, `/user/info`, `/workspace/list`
- CORS: uses `CorsFilter` bean (filter level) — handles OPTIONS preflight before interceptors run
