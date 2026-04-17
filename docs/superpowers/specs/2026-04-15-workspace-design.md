# Workspace Feature Design

**Date:** 2026-04-15
**Status:** Approved

## Overview

Add a workspace module to the platform. Each task belongs to a workspace, and each user can have different roles across workspaces. A workspace switcher is accessible from the Navbar, and a `X-Workspace-Id` header is injected into all API requests.

## Backend Data Model

### Workspace Entity

| Field | Type | Notes |
|---|---|---|
| id | Long | Auto-increment PK |
| name | String | Workspace name |
| description | String | Optional description |
| status | Status | ENABLE / DISABLE |
| createTime | LocalDateTime | Auto-set on insert |
| updateTime | LocalDateTime | Auto-updated on save |

### UserRoles

Stored as a JSON field on the `user` table:

```json
{
  "global": "SUPER_ADMIN",
  "workspaces": {
    "1": "ADMIN",
    "2": "VIEWER"
  }
}
```

- `global`: system-level role, only `SUPER_ADMIN` is valid
- `workspaces`: map of workspace ID → role (`ADMIN` / `DEVELOPER` / `OPERATOR` / `VIEWER`)

## Architecture

### New Files

| File | Purpose |
|---|---|
| `src/utils/workspace.js` | localStorage helpers: `getWorkspaceId`, `setWorkspaceId`, `removeWorkspaceId` |
| `src/store/modules/workspace.js` | Vuex module managing current workspace state |
| `src/api/workspace.js` | API calls for workspace CRUD and list |
| `src/views/manage/workspace.vue` | Workspace management page (all logged-in users) |

### Modified Files

| File | Change |
|---|---|
| `src/utils/request.js` | Inject `X-Workspace-Id` header in request interceptor |
| `src/store/modules/user.js` | Store `globalRole` in state after `getInfo`; expose via getter |
| `src/store/getters.js` | Expose `workspaceId`, `currentWorkspace`, `workspaceList`, `globalRole` |
| `src/store/index.js` | Register workspace Vuex module |
| `src/permission.js` | After getInfo, fetch workspace list and restore selection (runs on every route entry when token exists, covering both login and page refresh) |
| `src/layout/components/Navbar.vue` | Add workspace switcher dropdown left of user avatar |
| `src/router/index.js` | Add `/manage/workspace` route |
| `src/views/manage/user.vue` | Add workspace role assignment dialog per user |

## State Management

### `src/utils/workspace.js`

```js
const WorkspaceKey = 'platform_workspace_id'
export function getWorkspaceId() { return localStorage.getItem(WorkspaceKey) }
export function setWorkspaceId(id) { localStorage.setItem(WorkspaceKey, id) }
export function removeWorkspaceId() { localStorage.removeItem(WorkspaceKey) }
```

### `src/store/modules/workspace.js`

```
state:
  workspaceId       // current workspace ID (Number | null)
  workspaceList     // [{ id, name, description, status }]
  currentWorkspace  // full object of current workspace

mutations:
  SET_WORKSPACE_LIST(list)
  SET_CURRENT_WORKSPACE(workspace)

actions:
  fetchWorkspaceList()
    → GET /workspace/list
    → SET_WORKSPACE_LIST
    → restore from localStorage or pick first

  switchWorkspace(id)
    → SET_CURRENT_WORKSPACE
    → setWorkspaceId(id) to localStorage
```

### `src/store/getters.js` additions

```js
workspaceId: state => state.workspace.workspaceId,
workspaceList: state => state.workspace.workspaceList,
currentWorkspace: state => state.workspace.currentWorkspace
```

## API

### `src/api/workspace.js`

```
GET  /workspace/list           List workspaces the current user has access to
GET  /workspace/page           Paginated list (management page)
POST /workspace/create         Create workspace (SUPER_ADMIN only)
POST /workspace/update         Update workspace (SUPER_ADMIN only)
POST /workspace/delete/:id     Delete workspace (SUPER_ADMIN only)
```

## Request Interceptor

In `src/utils/request.js`, add after the `X-Token` header injection:

```js
if (store.getters.workspaceId) {
  config.headers['X-Workspace-Id'] = store.getters.workspaceId
}
```

## UI Components

### Navbar Workspace Switcher

Location: left of the user avatar in `Navbar.vue`

```
[ WorkspaceA ▼ ]  [avatar ▾]
```

- Uses `el-dropdown` listing all workspaces the user has access to
- Currently selected workspace is highlighted
- On select: dispatch `workspace/switchWorkspace(id)` then navigate to `/project/list`
- If workspace list is empty: shows "暂无 workspace" disabled item

### Workspace Management Page (`/manage/workspace`)

Follows the same layout as existing manage pages (`config.vue`, `user.vue`):

- Search bar: filter by name, status
- Table columns: name / description / status / createTime / actions (edit, delete)
- "新建" button top-right
- Create/edit via `el-dialog` form
- Visible to all logged-in users

### User Management Extension

In `src/views/manage/user.vue`, add a "Workspace 权限" button per user row:

- Opens `el-dialog` with a list of workspace-role pairs
- Each row: workspace dropdown + role dropdown (ADMIN/DEVELOPER/OPERATOR/VIEWER)
- Supports add row / delete row
- On save: calls `POST /user/update` with updated `UserRoles.workspaces`

## Data Flows

### Login Flow

```
Login success
  → getInfo (fetch user name, avatar, roles)
  → fetchWorkspaceList (GET /workspace/list)
  → Read localStorage for last workspaceId
      ├─ Found and in list → set as current workspace
      └─ Otherwise → pick first from list
  → Navigate to target page
```

### Workspace Switch Flow

```
User clicks workspace in Navbar dropdown
  → dispatch('workspace/switchWorkspace', id)
  → Update Vuex state + localStorage
  → Navigate to /dashboard
  → All subsequent API requests carry new X-Workspace-Id
```

### API Request Flow

```
Every request
  → request interceptor reads store.getters.workspaceId
  → Injects X-Workspace-Id header if present
  → Request sent to backend
```

## Edge Cases

- **No workspace available**: Switcher shows "暂无 workspace"; `X-Workspace-Id` header not injected
- **Stored workspace no longer accessible**: Falls back to first available workspace
- **SUPER_ADMIN**: Has access to all workspaces
- **Logout**: `removeWorkspaceId()` clears localStorage selection; workspace Vuex state reset (`SET_WORKSPACE_LIST([])`, `SET_CURRENT_WORKSPACE(null)`)
