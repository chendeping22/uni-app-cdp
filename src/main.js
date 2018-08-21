// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import router from './router'
import App from './App'
import { Flexbox, FlexboxItem, ViewBox, XHeader, Tab, TabItem, Panel, Tabbar, TabbarItem, Group, Cell, XInput, XButton, Rater, XTextarea } from 'vux'
import CSearch from './components/Search.vue'
import CHead from './components/Head.vue'
import Swiper from './components/Swiper.vue'


Vue.component('flexbox', Flexbox)
Vue.component('flexbox-item', FlexboxItem)
Vue.component('view-box', ViewBox)
Vue.component('x-header', XHeader)
Vue.component('c-search', CSearch)
Vue.component('c-head', CHead)
Vue.component('tab', Tab)
Vue.component('tab-item', TabItem)
Vue.component('panel', Panel)
Vue.component('c-swiper', Swiper)
Vue.component('tabbar', Tabbar)
Vue.component('tabbar-item', TabbarItem)
Vue.component('group', Group)
Vue.component('cell', Cell)
Vue.component('x-input', XInput)
Vue.component('x-button', XButton)
Vue.component('rater', Rater)
Vue.component('x-textarea', XTextarea)
    // import Home from './components/HelloFromVux'  

FastClick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    router,
    render: h => h(App)
}).$mount('#app-box')