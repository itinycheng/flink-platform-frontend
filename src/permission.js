import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/no-workspace']

async function loadUserSession(to, next) {
  try {
    await store.dispatch('user/getInfo')
    await store.dispatch('workspace/fetchWorkspaceList')
    if (!store.getters.currentWorkspace) {
      next('/no-workspace')
      return true
    }
    next()
  } catch (error) {
    await store.dispatch('user/resetToken')
    Message.error(error || 'Has Error')
    next(`/login?redirect=${to.path}`)
  }
  return true
}

async function doSsoCallback(to, next) {
  const ticket = new URLSearchParams(window.location.search).get('ticket')
  if (!ticket || store.getters.token) {
    return false
  }

  try {
    await store.dispatch('user/authenticate', { ticket })
    window.history.replaceState(null, '',
      window.location.pathname + window.location.hash)
    next({ path: '/', replace: true })
  } catch (e) {
    Message.error('SSO login failed')
    next('/login')
  }
  return true
}

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  document.title = getPageTitle(to.meta.title)
  // do callback from SSO login
  if (await doSsoCallback(to, next)) {
    return
  }

  if (store.getters.token) {
    if (to.path === '/login') {
      next({ path: '/' })
      return
    }

    if (!store.getters.name) {
      await loadUserSession(to, next)
      return
    }
  } else {
    if (!whiteList.includes(to.path)) {
      next(`/login?redirect=${to.path}`)
      return
    }
  }

  next()
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
