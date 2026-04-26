import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getWorkspaceId } from '@/utils/workspace'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: ''
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
  }
}

const actions = {
  authenticate({ commit, dispatch }, credentials) {
    return new Promise((resolve, reject) => {
      login({ workspaceId: getWorkspaceId(), ...credentials }).then(data => {
        const { token, workspaceId } = data
        commit('SET_TOKEN', token)
        setToken(token)
        if (workspaceId) {
          dispatch('workspace/setWorkspaceHint', workspaceId, { root: true })
        }
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(data => {
        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  logout({ commit, state }) {
    logout(state.token)
      .then(data => {
        removeToken()
        commit('RESET_STATE')
        const { redirectUrl } = data || {}
        window.location.href = redirectUrl || '/#/login'
      }).catch(() => {
        removeToken()
        commit('RESET_STATE')
        window.location.href = '/#/login'
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
