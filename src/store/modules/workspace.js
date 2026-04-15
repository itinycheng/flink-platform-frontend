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
  },
  SET_WORKSPACE_ID: (state, id) => {
    state.workspaceId = id
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

  // called right after login — backend returns a default workspaceId with the token
  setFromLogin({ commit }, workspaceId) {
    commit('SET_WORKSPACE_ID', workspaceId)
    setWorkspaceId(workspaceId)
  },

  // restore only the id from localStorage (synchronous, used before getInfo on page refresh)
  restoreFromStorage({ commit, state }) {
    if (state.workspaceId) return
    const savedId = getWorkspaceId()
    if (savedId) {
      commit('SET_WORKSPACE_ID', savedId)
    }
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
