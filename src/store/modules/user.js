// src/store/modules/user.js
import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getWorkspaceId } from '@/utils/workspace'
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
  login({ commit, dispatch }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password, workspaceId: getWorkspaceId() }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        if (data.workspaceId) {
          dispatch('workspace/setFromLogin', data.workspaceId, { root: true })
        }
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

  resetToken({ commit, dispatch }) {
    return new Promise(resolve => {
      removeToken()
      commit('RESET_STATE')
      dispatch('workspace/resetWorkspace', null, { root: true })
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
