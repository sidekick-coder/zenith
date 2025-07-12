export default [
    {
        path: '/articles',
        component: () => import('./pages/Article/Index.vue'),
    },
    {
        path: '/articles/:id',
        component: () => import('./pages/Article/Show.vue'),
    }
]
