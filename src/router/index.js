import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: 'Dashboard', icon: 'dashboard' }
      }
    ]
  },

  {
    path: '/project',
    component: Layout,
    redirect: '/project/definitions',
    name: 'Project',
    meta: { title: 'Project', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'definitions',
        name: 'Definitions',
        component: () => import('@/views/project/definitions'),
        meta: { title: 'Definitions', icon: 'tree' }
      },
      {
        path: 'list/:id',
        name: 'ProjectList',
        component: () => import('@/views/graph/listEditor'),
        meta: { title: 'Job List', icon: 'tree' },
        hidden: true
      },
      {
        path: 'flow/:type/:id',
        name: 'ProjectGraph',
        component: () => import('@/views/graph/graphEditor'),
        meta: { title: 'Flow', icon: 'tree' },
        hidden: true
      },
      {
        path: 'instances',
        name: 'ProjectInstances',
        component: () => import('@/views/project/instances'),
        meta: { title: 'Instances', icon: 'tree' }
      },
      {
        path: 'jobRuns',
        name: 'ProjectJobRuns',
        component: () => import('@/views/project/jobRuns'),
        meta: { title: 'Job Runs', icon: 'tree' }
      }
    ]
  },

  {
    path: '/extension',
    component: Layout,
    redirect: '/extension/reactive',
    name: 'Extension',
    meta: { title: 'Extension', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'reactive',
        name: 'Reactive',
        component: () => import('@/views/extension/reactive'),
        meta: { title: 'Reactive', icon: 'tree' }
      },
      {
        path: 'other',
        name: 'Other',
        component: () => import('@/views/extension/reactive'),
        meta: { title: 'Other', icon: 'tree' }
      }
    ]
  },

  {
    path: '/manage',
    component: Layout,
    redirect: '/manage/alert',
    name: 'Manage Center',
    meta: { title: 'Manage Center', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'alert',
        name: 'Alert Manage',
        component: () => import('@/views/manage/alert'),
        meta: { title: 'Alert Manage', icon: 'tree' }
      },
      {
        path: 'user',
        name: 'User Manage',
        component: () => import('@/views/manage/user'),
        meta: { title: 'User Manage', icon: 'tree' }
      },
      {
        path: 'resource',
        name: 'Resource Manage',
        component: () => import('@/views/manage/resource'),
        meta: { title: 'Resource Manage', icon: 'tree' }
      },
      {
        path: 'resource/:id',
        name: 'Resource Manage',
        component: () => import('@/views/manage/resource'),
        meta: { title: 'Resource Manage', icon: 'tree' },
        hidden: true
      },
      {
        path: 'datasource',
        name: 'DataSource Manage',
        component: () => import('@/views/manage/datasource'),
        meta: { title: 'DataSource Manage', icon: 'tree' }
      },
      {
        path: 'catalog',
        name: 'Catalog Manage',
        component: () => import('@/views/manage/catalog'),
        meta: { title: 'Catalog Manage', icon: 'tree' }
      },
      {
        path: 'worker',
        name: 'Worker Manage',
        component: () => import('@/views/manage/worker'),
        meta: { title: 'Worker Manage', icon: 'tree' }
      },
      {
        path: 'jobParam',
        name: 'JobParam Manage',
        component: () => import('@/views/manage/jobParam'),
        meta: { title: 'JobParam Manage', icon: 'tree' }
      },
      {
        path: 'tag',
        name: 'Tag Manage',
        component: () => import('@/views/manage/tag'),
        meta: { title: 'Tag Manage', icon: 'tree' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
