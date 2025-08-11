<script setup lang="ts">
import {
    onMounted,
    ref,
    watch
} from 'vue'
import { orderBy } from 'lodash-es'
import FileExplorerDirectory from '#client/components/FileExplorerDirectory.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/tryCatch.ts'

interface FileItem {
    name: string
    path: string
    type: 'file' | 'directory'
    metas: {
        mimetype?: string
        size?: number
    }
}

const props = defineProps<{
    driveId: string
    path: string
}>()

const emit = defineEmits<{
    'click:entry': [item: FileItem]
    'dblclick:entry': [item: FileItem]
}>()

const isLoading = ref(false)

const items = defineModel('items', {
    type: Array as () => FileItem[],
    default: () => []
})

const selected = defineModel('selected', {
    type: Object,
    default: () => ({})
})

async function load() {
    if (!props.driveId) return
    
    isLoading.value = true
    
    const [error, response] = await tryCatch(() => $fetch<FileItem[]>(`/api/drives/${props.driveId}/files`, {
        method: 'GET',
        query: { folder: props.path }
    }))
    
    if (error) {
        console.error('Failed to load directory contents:', error)
        items.value = []
        isLoading.value = false
        return
    }

    items.value = orderBy(response, ['type', 'name'])

    setTimeout(() => {
        isLoading.value = false
    }, 800)

}

watch(() => [props.driveId, props.path], load)
onMounted(load)

defineExpose({ load })
</script>

<template>
    <FileExplorerDirectory
        v-model:selected="selected"
        :items="items"
        :loading="isLoading"
        :icon-key="item => item.type === 'directory' ? 'Folder' : 'FileText'"
        label-key="name"
        class="rounded-none shadow-none border-0"
        @click="emit('click:entry', $event)"
        @dblclick="emit('dblclick:entry', $event)"
    />
</template>
