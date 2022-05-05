/*
 * @Description:
 * @Author: shiby
 * @Date: 2021-05-26 12:30:57
 * @LastEditTime: 2022-02-16 10:20:24
 * @LastEditors: shiby
 * @Reference:
 */
import Vue from 'vue'
import { VuePlugin } from 'vuera'

// 导入ElementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'
import router from './router'
import store from './store'
Vue.use(ElementUI)
Vue.use(VuePlugin)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
