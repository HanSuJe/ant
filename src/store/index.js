import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    user,
    permission
  },
  state: {
    historyData: [],
    key: 0
  },
  mutations: {
    addHistory(state, data){
      state.historyData.push({key: state.key++, component: data.historyComponent, id: data.historyId, nodedata: data.historyNodedata})
    },
    delHistory(state){
      state.historyData.pop();
    }
  },
  actions: {
    addFun(context, data){
      context.commit("addHistory", data);
    },
    delFun(context){
      context.commit("delHistory");
    }
  },
  getters
})
export default store