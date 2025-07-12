// router.js
import { createRouter as createVueRouter, createMemoryHistory, createWebHistory } from 'vue-router'

export function createRouter() {
    const ssr = import.meta.env.SSR

    const files = import.meta.glob('./routes/**/*.ts', { eager: true })

    console.log('Loaded route files:', files)

    return createVueRouter({
        history: ssr ? createMemoryHistory() : createWebHistory(),
        routes: [],
    })
}

