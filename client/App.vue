<script setup lang="ts">
import { useRouter } from 'vue-router'
import logger from './facades/logger.facade.ts'
import { Toaster } from '#client/components/ui/sonner'
import 'vue-sonner/style.css'

const router = useRouter()

const all = router.getRoutes()

const keepAliveInclude = all
    .filter(route => route.meta.keepAlive)
    .map(r => Array.isArray(r.meta.keepAlive) ? r.meta.keepAlive : [r.meta.keepAlive])
    .flat()
</script>
<template>
    <Toaster />
    <suspense>
        <router-view v-slot="{ Component }">
            <keep-alive :include="keepAliveInclude">
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </suspense>
</template>
