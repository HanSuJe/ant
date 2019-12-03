// ie polyfill
import '@babel/polyfill'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import { VueAxios } from './utils/request'
// mock
import './mock'
import bootstrap from './core/bootstrap'
import './core/use'
// import './permission' // permission control
import './utils/filter' // global filter
Vue.config.productionTip = false
const requireComponents = require.context('@/views/viewer',true,/\.vue$/);
let componentArr = [];
requireComponents.keys().forEach(fileName => {
  const reqCom = requireComponents(fileName)
  const reqComName = reqCom.default.name
  componentArr.push(reqComName)
  Vue.component(reqComName, reqCom.default || reqCom)
})
Vue.prototype.componentArr = componentArr;
Vue.use(VueAxios);
new Vue({
  router,
  store,
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')
