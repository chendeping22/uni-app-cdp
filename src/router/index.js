import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        redirect: { name: 'home' },
        name: 'index',
        component: () =>
            import ('@/pages/Index'),
        children: [{
            path: 'home',
            name: 'home',
            component: () =>
                import ('@/pages/Home')
        }, {
            path: 'school',
            name: 'school',
            component: () =>
                import ('@/pages/School')
        }, {
            path: 'find',
            name: 'find',
            component: () =>
                import ('@/pages/Find')
        }, {
            path: 'mine',
            name: 'mine',
            component: () =>
                import ('@/pages/Mine')
        }]
    }]
})