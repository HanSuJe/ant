// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView, BlankLayout, PageView } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

export const asyncRouterMap = [

  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: '首页' },
    redirect:{
      path:'/test/tree'
    },
    children: [
      {
        path: '/test/tree',
        name: 'TreeList',
        component: () => import('@/views/other/TreeList'),
        meta: { title: '数据树', icon: 'deployment-unit', keepAlive: true }
      },
      {
        path: '/test/projects',
        name: 'Project',
        component: () => import('@/views/other/TableInnerEditList'),
        meta: { title: '项目', icon: 'project', keepAlive: true }
      },
      {
        path: '/test',
        name: 'Setting',
        redirect: '/test/objdef',
        component: PageView,
        meta: { title: '设置', icon: 'setting' },
        children: [
          {
            path: '/test/objdef',
            name: 'Objdef',
            component: () => import('@/views/other/TableObjdef'),
            meta: { title: '对象定义', keepAlive: true}
          },
          {
            path: '/test/nodetypes',
            name: 'Nodetypes',
            component: () => import('@/views/other/TableNodetypes'),
            meta: { title: '节点定义', keepAlive: true }
          },
          {
            path: '/test/viewer',
            name: 'Viewer',
            component: () => import('@/views/other/TableViewer'),
            meta: { title: '视图定义', keepAlive: true }
          },
          {
            path:'/test/:pathUrl',
            name: 'AdvanceForm',
            hidden: true,
            component: () => import('@/views/form/advancedForm/AdvancedForm'),
            meta: { title: '详情', keepAlive: true }
          }
        ]
      }
    ]
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  // {
  //   path: '/user',
  //   component: UserLayout,
  //   redirect: '/user/login',
  //   hidden: true,
  //   children: [
  //     {
  //       path: 'login',
  //       name: 'login',
  //       component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
  //     },
  //     {
  //       path: 'register',
  //       name: 'register',
  //       component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
  //     },
  //     {
  //       path: 'register-result',
  //       name: 'registerResult',
  //       component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
  //     }
  //   ]
  // },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
