export default [
    {
        path: '/blog/posts',
        component: () => import('./pages/Post/Index.vue'),
    },
    {
        path: '/blog/posts/:id',
        component: () => import('./pages/Post/Show.vue'),
    }
]
