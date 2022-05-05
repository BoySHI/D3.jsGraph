/*
 * @Author: your name
 * @Date: 2021-05-26 12:30:57
 * @LastEditTime: 2022-02-15 13:56:58
 * @LastEditors: shiby
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vue-d3-graph-main的副本/src/router/index.js
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/2dView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/3dView',
    name: '3dView',
    component: () => import(/* webpackChunkName: "about" */ '../views/3dView.vue')
  },
  {
    path: '/pushNode',
    name: 'pushNode',
    component: () => import('../views/pushNode.vue')
  },
  {
    path: '/cytoscap',
    name: 'cytoscap',
    component: () => import('../components/graphinReact.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
