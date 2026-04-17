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
      Sidebar/        # Left nav — route-driven, filters superAdminOnly routes
  utils/
    request.js  # Axios instance — injects X-Token and X-Workspace-Id headers
    auth.js     # Token cookie helpers (getToken / setToken / removeToken)
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
`login` and `getInfo` in `src/api/user.js` are exceptions — they omit `.then(res => res.data)` because the store actions destructure `data` directly.

### Manage pages
All pages under `src/views/manage/` follow the same layout: filter bar → table → pagination → el-dialog form. Use `src/views/manage/config.vue` as the reference template.

### Vuex modules
Follow the `getDefaultState` + mutations + actions pattern. See `src/store/modules/user.js` or `src/store/modules/workspace.js`.

### Request headers
`src/utils/request.js` automatically injects:
- `X-Token` — from cookie
- `X-Workspace-Id` — from `store.getters.workspaceId`

### Route guard (`src/permission.js`)
On first authenticated route entry (fresh load or page refresh):
1. `workspace/restoreFromStorage` — restores workspaceId from localStorage synchronously
2. `user/getInfo` — fetches name, avatar, globalRole
3. `workspace/fetchWorkspaceList` — fetches full workspace list for Navbar switcher

### SUPER_ADMIN-only sidebar items
Add `meta: { superAdminOnly: true }` to a route. The Sidebar (`src/layout/components/Sidebar/index.vue`) filters these out for non-SUPER_ADMIN users via `store.getters.globalRole`. Currently no routes use this restriction — workspace management is visible to all logged-in users.

## Workspace Feature

Each task/job belongs to a workspace. Users have roles per workspace (ADMIN / DEVELOPER / OPERATOR / VIEWER) plus an optional global role (SUPER_ADMIN).

- **Login flow**: backend returns `{ token, workspaceId }` — frontend sends `workspaceId` hint from localStorage so backend can validate/restore last selection
- **Switching**: Navbar dropdown → `workspace/switchWorkspace(id)` → navigate to `/dashboard`
- **Design spec**: `docs/superpowers/specs/2026-04-15-workspace-design.md`

## Backend

- Base URL: `http://localhost:9104` (dev), configured in `.env.development`
- Auth interceptor requires `X-Token` on all endpoints except `/login`
- Workspace interceptor requires `X-Workspace-Id` on all endpoints except `/login`, `/user/info`, `/workspace/list`
- CORS: uses `CorsFilter` bean (filter level) — handles OPTIONS preflight before interceptors run
