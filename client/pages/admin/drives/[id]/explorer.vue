<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DriveExplorer from '#client/components/DriveExplorer.vue'
import AppLayout from '#client/layouts/AppLayout.vue'

const route = useRoute()
const driveId = computed(() => {
    return route.params.id as string
})

</script>

<template>
    <AppLayout>
        <DriveExplorer :drive-id />
    </AppLayout>
</template>