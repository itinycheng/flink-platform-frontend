# Workspace Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add workspace module — switcher in Navbar, CRUD management page, user workspace role assignment, and `X-Workspace-Id` header on all API requests.

**Architecture:** New Vuex `workspace` module stores current workspace and list; `src/utils/workspace.js` persists selection to localStorage; `request.js` interceptor injects `X-Workspace-Id` on every request; `permission.js` fetches workspace list after user info on every authenticated route entry.

**Tech Stack:** Vue 2, Vuex 3, Vue Router 3, Element UI 2, Axios

---

## Task 1: Workspace localStorage utility

**Files:**
- Create: `src/utils/workspace.js`

- [ ] **Step 1: Create the file**

```js
// src/utils/workspace.js
const WorkspaceKey = 'platform_workspace_id'

export function getWorkspaceId() {
  const id = localStorage.getItem(WorkspaceKey)
  return id ? Number(id) : null
}

export function setWorkspaceId(id) {
  localStorage.setItem(WorkspaceKey, id)
}

export function removeWorkspaceId() {
  localStorage.removeItem(WorkspaceKey)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/workspace.js
git commit -m "feat: add workspace localStorage utility"
```

---

## Task 2: Workspace API layer

**Files:**
- Create: `src/api/workspace.js`

- [ ] **Step 1: Create the file**

```js
// src/api/workspace.js
import request from '@/utils/request'

export function getWorkspaceList() {
  return request({
    url: '/workspace/list',
    method: 'get'
  }).then(res => res.data)
}

export function getWorkspacePage(query) {
  return request({
    url: '/workspace/page',
    method: 'get',
    params: query
  }).then(res => res.data)
}

export function createWorkspace(data) {
  return request({
    url: '/workspace/create',
    method: 'post',
    data
  }).then(res => res.data)
}

export function updateWorkspace(data) {
  return request({
    url: '/workspace/update',
    method: 'post',
    data
  }).then(res => res.data)
}

export function deleteWorkspace(id) {
  return request({
    url: `/workspace/delete/${id}`,
    method: 'get'
  }).then(res => res.data)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/api/workspace.js
git commit -m "feat: add workspace API layer"
```

---

## Task 3: Workspace Vuex module + store wiring

**Files:**
- Create: `src/store/modules/workspace.js`
- Modify: `src/store/modules/user.js`
- Modify: `src/store/index.js`
- Modify: `src/store/getters.js`

- [ ] **Step 1: Create `src/store/modules/workspace.js`**

```js
// src/store/modules/workspace.js
import { getWorkspaceList } from '@/api/workspace'
import { getWorkspaceId, setWorkspaceId, removeWorkspaceId } from '@/utils/workspace'

const getDefaultState = () => ({
  workspaceId: null,
  workspaceList: [],
  currentWorkspace: null
})

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_WORKSPACE_LIST: (state, list) => {
    state.workspaceList = list
  },
  SET_CURRENT_WORKSPACE: (state, workspace) => {
    state.currentWorkspace = workspace
    state.workspaceId = workspace ? workspace.id : null
  }
}

const actions = {
  fetchWorkspaceList({ commit }) {
    return getWorkspaceList().then(list => {
      commit('SET_WORKSPACE_LIST', list || [])

      if (!list || list.length === 0) {
        commit('SET_CURRENT_WORKSPACE', null)
        return
      }

      // restore from localStorage or pick first
      const savedId = getWorkspaceId()
      const saved = savedId && list.find(w => w.id === savedId)
      const workspace = saved || list[0]

      commit('SET_CURRENT_WORKSPACE', workspace)
      setWorkspaceId(workspace.id)
    })
  },

  switchWorkspace({ commit, state }, id) {
    const workspace = state.workspaceList.find(w => w.id === id)
    if (!workspace) return
    commit('SET_CURRENT_WORKSPACE', workspace)
    setWorkspaceId(id)
  },

  resetWorkspace({ commit }) {
    removeWorkspaceId()
    commit('RESET_STATE')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
```

- [ ] **Step 2: Update `src/store/modules/user.js` — add `globalRole` to state**

In `getDefaultState`, add `globalRole: null`. In `mutations`, add `SET_GLOBAL_ROLE`. In `getInfo` action, extract `global` from response data and commit it. In `RESET_STATE`, `globalRole` resets to null.

Replace the entire file:

```js
// src/store/modules/user.js
import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    globalRole: null
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_GLOBAL_ROLE: (state, role) => {
    state.globalRole = role
  }
}

const actions = {
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar, roles } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        if (roles && roles.global) {
          commit('SET_GLOBAL_ROLE', roles.global)
        }
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken()
        resetRouter()
        commit('RESET_STATE')
        dispatch('workspace/resetWorkspace', null, { root: true })
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken()
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
```

- [ ] **Step 3: Register workspace module in `src/store/index.js`**

```js
// src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import workspace from './modules/workspace'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    workspace
  },
  getters
})

export default store
```

- [ ] **Step 4: Add workspace getters to `src/store/getters.js`**

```js
// src/store/getters.js
const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  globalRole: state => state.user.globalRole,
  workspaceId: state => state.workspace.workspaceId,
  workspaceList: state => state.workspace.workspaceList,
  currentWorkspace: state => state.workspace.currentWorkspace
}
export default getters
```

- [ ] **Step 5: Commit**

```bash
git add src/store/modules/workspace.js src/store/modules/user.js src/store/index.js src/store/getters.js
git commit -m "feat: add workspace Vuex module and wire into store"
```

---

## Task 4: Inject X-Workspace-Id into every request

**Files:**
- Modify: `src/utils/request.js`

- [ ] **Step 1: Add header injection after X-Token in the request interceptor**

In `src/utils/request.js`, find the block:
```js
    if (store.getters.token) {
      config.headers['X-Token'] = getToken()
    }
```

Replace with:
```js
    if (store.getters.token) {
      config.headers['X-Token'] = getToken()
    }
    if (store.getters.workspaceId) {
      config.headers['X-Workspace-Id'] = store.getters.workspaceId
    }
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/request.js
git commit -m "feat: inject X-Workspace-Id header into all API requests"
```

---

## Task 5: Fetch workspace list in permission guard

**Files:**
- Modify: `src/permission.js`

- [ ] **Step 1: Call fetchWorkspaceList after getInfo**

The `hasGetUserInfo` guard is unchanged — it stays as `store.getters.name`. Only the try block changes to also fetch the workspace list. This ensures workspace list is fetched on fresh load and page refresh (when Vuex state is empty), but not on every SPA navigation.

Replace only the try block inside `router.beforeEach`:

```js
        try {
          // get user info
          await store.dispatch('user/getInfo')
          // fetch workspace list and restore selection
          await store.dispatch('workspace/fetchWorkspaceList')
          next()
        } catch (error) {
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
```

The `hasGetUserInfo` check above the try block stays exactly as it was:
```js
      const hasGetUserInfo = store.getters.name
      if (hasGetUserInfo) {
        next()
      } else {
        try {
          ...
```

- [ ] **Step 2: Commit**

```bash
git add src/permission.js
git commit -m "feat: fetch workspace list after user info in route guard"
```

---

## Task 6: Workspace switcher in Navbar

**Files:**
- Modify: `src/layout/components/Navbar.vue`

- [ ] **Step 1: Replace the full Navbar.vue content**

```vue
<template>
  <div class="navbar">
    <hamburger :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb class="breadcrumb-container" />

    <div class="right-menu">
      <el-dropdown class="workspace-switcher" trigger="click" @command="handleSwitchWorkspace">
        <span class="workspace-label">
          {{ currentWorkspace ? currentWorkspace.name : '暂无 Workspace' }}
          <i class="el-icon-caret-bottom" />
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-if="workspaceList.length === 0"
            disabled
          >
            暂无 Workspace
          </el-dropdown-item>
          <el-dropdown-item
            v-for="ws in workspaceList"
            :key="ws.id"
            :command="ws.id"
            :class="{ 'workspace-active': currentWorkspace && currentWorkspace.id === ws.id }"
          >
            {{ ws.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar+'?imageView2/1/w/80/h/80'" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <router-link to="/">
            <el-dropdown-item>
              Home
            </el-dropdown-item>
          </router-link>
          <a target="_blank" href="https://github.com/PanJiaChen/vue-admin-template/">
            <el-dropdown-item>Github</el-dropdown-item>
          </a>
          <a target="_blank" href="https://panjiachen.github.io/vue-element-admin-site/#/">
            <el-dropdown-item>Docs</el-dropdown-item>
          </a>
          <el-dropdown-item divided @click.native="logout">
            <span style="display:block;">Log Out</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'

export default {
  components: {
    Breadcrumb,
    Hamburger
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'workspaceList',
      'currentWorkspace'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    handleSwitchWorkspace(id) {
      this.$store.dispatch('workspace/switchWorkspace', id)
      this.$router.push('/dashboard')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;

    &:focus {
      outline: none;
    }

    .workspace-switcher {
      margin-right: 20px;
      cursor: pointer;

      .workspace-label {
        font-size: 14px;
        color: #5a5e66;

        .el-icon-caret-bottom {
          font-size: 12px;
          margin-left: 4px;
        }
      }
    }

    .workspace-active {
      color: #409EFF;
      font-weight: bold;
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/layout/components/Navbar.vue
git commit -m "feat: add workspace switcher to Navbar"
```

---

## Task 7: Workspace management page

**Files:**
- Create: `src/views/manage/workspace.vue`

- [ ] **Step 1: Create the file**

```vue
<template>
  <div class="app-container">
    <div class="filter-container" style="margin-bottom: 10px">
      <el-input
        v-model="listQuery.name"
        placeholder="Name"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.status"
        placeholder="Status"
        clearable
        class="filter-item"
      >
        <el-option
          v-for="item in statusList"
          :key="item.name"
          :label="item.name"
          :value="item.name"
        />
      </el-select>
      <el-button v-waves type="primary" icon="el-icon-search" @click.stop="handleFilter">
        Search
      </el-button>
      <el-button type="primary" icon="el-icon-edit" @click.stop="openForm">
        Create
      </el-button>
    </div>

    <el-table
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80" :class-name="getSortClass('id')">
        <template slot-scope="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Name" min-width="150" align="center">
        <template slot-scope="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="Description" min-width="200" align="center">
        <template slot-scope="{ row }">{{ row.description }}</template>
      </el-table-column>
      <el-table-column label="Status" width="120" align="center">
        <template slot-scope="{ row }">{{ row.status }}</template>
      </el-table-column>
      <el-table-column label="Create Time" min-width="160" align="center">
        <template slot-scope="{ row }">{{ row.createTime }}</template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="{ row, $index }">
          <el-button type="success" size="mini" @click="openForm(row)">Edit</el-button>
          <el-button type="danger" size="mini" @click="deleteRow(row, $index)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog title="Edit Workspace" :visible.sync="dialogFormVisible">
      <el-row :gutter="20">
        <el-col :span="22">
          <el-form :model="formData" :rules="formRules" label-width="120px">
            <el-form-item label="Name" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
            <el-form-item label="Description" prop="description">
              <el-input v-model="formData.description" type="textarea" />
            </el-form-item>
            <el-form-item label="Status" prop="status">
              <el-select v-model="formData.status" style="width:100%" placeholder="Please select status">
                <el-option
                  v-for="item in statusList"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
                />
              </el-select>
            </el-form-item>
            <el-form-item style="text-align: right;">
              <el-button @click.stop="closeForm">Cancel</el-button>
              <el-button type="primary" @click.stop="submitForm">Confirm</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import { getWorkspacePage, createWorkspace, updateWorkspace, deleteWorkspace } from '@/api/workspace'
import { getStatusList } from '@/api/attr'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'WorkspaceList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      dialogFormVisible: false,
      statusList: [],
      formData: {},
      formRules: {
        name: [{ required: true, message: 'Please enter name', trigger: 'blur' }]
      },
      list: null,
      total: 0,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        status: undefined,
        sort: '-id'
      }
    }
  },
  created() {
    this.getList()
    this.getCommonStatus()
  },
  methods: {
    getList() {
      getWorkspacePage(this.listQuery).then(data => {
        this.list = data.records
        this.total = data.total
      })
    },
    getCommonStatus() {
      getStatusList({ className: 'Status' }).then(result => {
        this.statusList = result
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    openForm(row) {
      this.formData = row && row.id ? { ...row } : {}
      this.dialogFormVisible = true
    },
    closeForm() {
      this.dialogFormVisible = false
      this.formData = {}
    },
    submitForm() {
      if (this.formData.id) {
        updateWorkspace(this.formData).then(() => {
          this.closeForm()
          this.getList()
        })
      } else {
        createWorkspace(this.formData).then(() => {
          this.closeForm()
          this.getList()
        })
      }
    },
    deleteRow(row, index) {
      this.$confirm(`Delete Workspace [${row.id}, ${row.name}] ?`, 'Warning', {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        deleteWorkspace(row.id).then(() => {
          this.$message({ message: `Delete [${row.name}] Successfully`, type: 'success' })
          this.list.splice(index, 1)
        })
      })
    },
    sortChange({ prop, order }) {
      if (prop === 'id') {
        this.listQuery.sort = order === 'ascending' ? '+id' : '-id'
        this.handleFilter()
      }
    },
    getSortClass(key) {
      return this.listQuery.sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>

<style scoped>
.filter-item {
  width: 200px;
  margin-right: 15px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/manage/workspace.vue
git commit -m "feat: add workspace management page"
```

---

## Task 8: Add workspace route

**Files:**
- Modify: `src/router/index.js`
- Modify: `src/layout/components/Sidebar/index.vue`

- [ ] **Step 1: Add workspace route to `src/router/index.js`**

Inside the `/manage` children array, after the `config` route, add:

```js
      {
        path: 'workspace',
        name: 'Workspace Manage',
        component: () => import('@/views/manage/workspace'),
        meta: { title: 'Workspace Manage', icon: 'tree' }
      }
```

- [ ] **Step 2: Filter SUPER_ADMIN-only routes in `src/layout/components/Sidebar/index.vue`**

Update the `routes` computed property to filter workspace routes based on `globalRole`:

```js
import { mapGetters } from 'vuex'
```

Add `globalRole` to `mapGetters` and update `routes`:

```js
  computed: {
    ...mapGetters([
      'sidebar',
      'globalRole'
    ]),
    routes() {
      return this.$router.options.routes.map(route => {
        if (!route.children) return route
        return {
          ...route,
          children: route.children.filter(child => {
            if (child.meta && child.meta.superAdminOnly) {
              return this.globalRole === 'SUPER_ADMIN'
            }
            return true
          })
        }
      })
    },
    // ... rest of computed properties unchanged
```

- [ ] **Step 3: Commit**

```bash
git add src/router/index.js src/layout/components/Sidebar/index.vue
git commit -m "feat: add workspace route and sidebar SUPER_ADMIN filter"
```

---

## Task 9: User workspace role assignment dialog

**Files:**
- Modify: `src/views/manage/user.vue`

- [ ] **Step 1: Add workspace role dialog state to `data()`**

In the `data()` return object, add after `formRules`:

```js
      // workspace roles dialog
      rolesDialogVisible: false,
      rolesUserId: null,
      workspaceRoleRows: [],   // [{ workspaceId: null, role: null }]
      allWorkspaceList: [],
      roleOptions: ['ADMIN', 'DEVELOPER', 'OPERATOR', 'VIEWER'],
```

- [ ] **Step 2: Add `getWorkspaces()` call in `created()`**

```js
  created() {
    this.getList()
    this.getTypes()
    this.getWorkers()
    this.getAllWorkspaces()
  },
```

- [ ] **Step 3: Add `getAllWorkspaces` method**

```js
    getAllWorkspaces() {
      getWorkspaceList().then(list => {
        this.allWorkspaceList = list || []
      })
    },
```

- [ ] **Step 4: Add `openRolesDialog`, `addRoleRow`, `removeRoleRow`, `saveRoles` methods**

```js
    openRolesDialog(row) {
      this.rolesUserId = row.id
      const workspaces = (row.roles && row.roles.workspaces) ? row.roles.workspaces : {}
      this.workspaceRoleRows = Object.entries(workspaces).map(([id, role]) => ({
        workspaceId: Number(id),
        role
      }))
      this.rolesDialogVisible = true
    },
    addRoleRow() {
      this.workspaceRoleRows.push({ workspaceId: null, role: null })
    },
    removeRoleRow(index) {
      this.workspaceRoleRows.splice(index, 1)
    },
    saveRoles() {
      const workspaces = {}
      this.workspaceRoleRows.forEach(row => {
        if (row.workspaceId && row.role) {
          workspaces[row.workspaceId] = row.role
        }
      })
      const user = this.list.find(u => u.id === this.rolesUserId)
      const updated = {
        ...user,
        roles: { ...(user.roles || {}), workspaces }
      }
      updateUser(updated).then(() => {
        this.$message({ message: 'Workspace roles updated', type: 'success' })
        this.rolesDialogVisible = false
        this.getList()
      })
    },
```

- [ ] **Step 5: Add "Workspace 权限" button to the Actions column**

In the `<el-table-column label="Actions">` template, add after the Edit button:

```html
          <el-button size="mini" @click="openRolesDialog(row)">Workspace 权限</el-button>
```

- [ ] **Step 6: Add workspace roles dialog after the existing Edit User dialog**

```html
    <el-dialog title="Workspace 权限" :visible.sync="rolesDialogVisible" width="600px">
      <div v-for="(row, index) in workspaceRoleRows" :key="index" style="display:flex; margin-bottom:10px; gap:10px;">
        <el-select v-model="row.workspaceId" placeholder="Select Workspace" style="flex:1">
          <el-option
            v-for="ws in allWorkspaceList"
            :key="ws.id"
            :label="ws.name"
            :value="ws.id"
          />
        </el-select>
        <el-select v-model="row.role" placeholder="Select Role" style="flex:1">
          <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
        </el-select>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleRow(index)" />
      </div>
      <el-button type="text" icon="el-icon-plus" @click="addRoleRow">Add Row</el-button>
      <div slot="footer">
        <el-button @click="rolesDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveRoles">Save</el-button>
      </div>
    </el-dialog>
```

- [ ] **Step 7: Add `getWorkspaceList` to the import line**

Change:
```js
import { getUser, getUserPage, createUser, updateUser } from '@/api/user'
```
to:
```js
import { getUser, getUserPage, createUser, updateUser } from '@/api/user'
import { getWorkspaceList } from '@/api/workspace'
```

- [ ] **Step 8: Commit**

```bash
git add src/views/manage/user.vue
git commit -m "feat: add workspace role assignment to user management"
```
