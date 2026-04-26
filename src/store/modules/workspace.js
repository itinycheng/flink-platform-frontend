import { getWorkspaceList } from '@/api/workspace'
import { getWorkspaceId, setWorkspaceId, removeWorkspaceId } from '@/utils/workspace'

const getDefaultState = () => ({
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

  setWorkspaceHint(_, workspaceId) {
    setWorkspaceId(workspaceId)
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
