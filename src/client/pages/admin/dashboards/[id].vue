<script setup lang="ts">
import { DashboardPage } from '@sidekick-coder/zenith-kit/components'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = route.params.id as string
</script>

<template>
    <DashboardPage :dashboard-id="id" />
</template>
