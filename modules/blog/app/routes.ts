export default [
    {
        path: '/blog/posts',
        component: () => import('#app/components/PageTable.vue'),
        props: { url: '/api/blog/posts', }
    },
    {
        path: '/blog/posts/:id',
        component: () => import('./pages/Post/Show.vue'),
    }
]
