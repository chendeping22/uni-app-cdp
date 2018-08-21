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
                redirect: { name: 'schoolChild' },
                component: () =>
                    import ('@/pages/School'),
                children: [{
                    path: 'child',
                    name: 'schoolChild',
                    component: () =>
                        import ('@/components/SchoolChild')
                }, {
                    path: 'schoolClub',
                    name: 'schoolClub',
                    component: () =>
                        import ('@/components/SchoolClub')
                }, {
                    path: 'schoolInstitute',
                    name: 'schoolInstitute',
                    component: () =>
                        import ('@/components/SchoolInstitute')
                }]
            }, {
                path: 'mine',
                name: 'mine',
                component: () =>
                    import ('@/pages/Mine'),

            }]
        },
        {
            path: '/home/location',
            name: 'location',
            component: () =>
                import ('@/pages/Location')
        },
        {
            path: '/home/location/search',
            name: 'locationSearch',
            component: () =>
                import ('@/pages/LocationSearch')
        },
        {
            path: '/home/popular',
            name: 'popular',
            component: () =>
                import ('@/pages/Popular')
        },
        {
            path: '/home/fine',
            name: 'fine',
            component: () =>
                import ('@/pages/Fine')
        },
        {
            path: '/home/login',
            name: 'login',
            component: () =>
                import ('@/pages/Login')
        },
        {
            path: '/home/activity',
            name: 'homeActivity',
            component: () =>
                import ('@/pages/HomeActivity')
        },
        {
            path: '/home/activity/search',
            name: 'activitySearch',
            component: () =>
                import ('@/pages/HomeActivitySearch')
        },
        {
            path: '/home/activity/detail',
            name: 'activityDetail',
            redirect: { name: 'actintro' },
            component: () =>
                import ('@/pages/HomeActivityDetail'),
            children: [{
                path: 'actintro',
                name: 'actintro',
                component: () =>
                    import ('@/components/ActIntro')
            }, {
                path: 'record',
                name: 'Record',
                component: () =>
                    import ('@/components/ActRecord'),

            }, {
                path: 'comment',
                name: 'actComment',
                component: () =>
                    import ('@/components/ActComment')
            }]
        }, {
            path: '/home/activity/userComment',
            name: 'userComment',
            component: () =>
                import ('@/pages/UserComment'),
            redirect: { name: 'commentAll' },
            children: [{
                path: 'commentAll',
                name: 'commentAll',
                component: () =>
                    import ('@/components/CommentAll')
            }, {
                path: 'commentMap',
                name: 'commentMap',
                component: () =>
                    import ('@/components/CommentMap'),

            }]
        }, {
            path: '/home/activity/userCommentDetail',
            name: 'userCommentDetail',
            component: () =>
                import ('@/pages/UserCommentDetail')
        },
        {
            path: '/school/search',
            name: 'schoolSearch',
            component: () =>
                import ('@/pages/SchoolSearch')
        },
        {
            path: '/school/in',
            name: 'schoolIn',
            component: () =>
                import ('@/pages/SchoolIn')
        },
        {
            path: '/school/screen',
            name: 'schoolScreen',
            component: () =>
                import ('@/pages/SchoolScreen')
        },
        {
            path: '/school/screenAfter',
            name: 'schoolScreenAfter',
            component: () =>
                import ('@/pages/SchoolScreenAfter')
        },
        {
            path: '/school/commentDetails',
            name: 'schoolCommentDetails',
            component: () =>
                import ('@/pages/SchoolCommentDetails')
        },
        {
            path: '/school/intro',
            name: 'schoolIntro',
            component: () =>
                import ('@/pages/SchoolIntro')
        },
        {
            path: '/school/scenery',
            name: 'schoolScenery',
            component: () =>
                import ('@/pages/SchoolScenery')
        },
        {
            path: '/find',
            name: 'find',
            component: () =>
                import ('@/pages/Find')
        },
        {
            path: '/find/release',
            name: 'findRelease',
            component: () =>
                import ('@/pages/FindRelease')
        }, {
            path: '/mine/user',
            name: 'userMes',
            component: () =>
                import ('@/pages/UserMes')
        }, {
            path: '/mine/school',
            name: 'attentionSchool',
            component: () =>
                import ('@/pages/AttentionSchool')
        }, {
            path: '/mine/set',
            name: 'setUp',
            component: () =>
                import ('@/pages/SetUp')
        }, {
            path: '/mine/act',
            name: 'activity',
            component: () =>
                import ('@/pages/Activity')
        }

    ]
})