<script setup lang="ts">
import { useRouter } from 'vue-router'
import logger from './facades/logger.facade.ts'
import { Toaster } from '#client/components/ui/sonner'
import 'vue-sonner/style.css'

const router = useRouter()

const all = router.getRoutes()

const keepAliveRoutes = all.filter(route => route.meta.keepAlive)

const keepAliveComponents = keepAliveRoutes
    .filter(route => route.components && route.components.default)
    .map(route => {
        const c = route.components?.default

        if (!c) return null

        if (typeof c === 'object' && 'name' in c && typeof c.name === 'string') {
            return c.name
        }

        logger.warn('A keep-alive route component is missing a name that is required for keep-alive functionality.', { route: c })

        return null
    })
    .filter(name => name !== null) as string[]

</script>
<template>
    <Toaster />
    <suspense>
        <router-view v-slot="{ Component }">
            <keep-alive :include="keepAliveComponents">
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </suspense>
</template>
