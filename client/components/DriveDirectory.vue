<script setup lang="ts">
import {
    ref,
    watch
} from 'vue'
import FileExplorerDirectory from '#client/components/FileExplorerDirectory.vue'
import FileExplorerBreadcrumb from '#client/components/FileExplorerBreadcrumb.vue'
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
    click: [item: FileItem]
    dblclick: [item: FileItem]
}>()

const entries = ref<FileItem[]>([])
const isLoading = ref(false)

async function load() {
    if (!props.driveId) return
    
    isLoading.value = true
    
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${props.driveId}/files`, {
        method: 'GET',
        query: { folder: props.path }
    }))
    
    if (error) {
        console.error('Failed to load directory contents:', error)
        entries.value = []
        isLoading.value = false
        return
    }
    
    entries.value = (response as FileItem[]) || []

    entries.value.sort((a, b) => {
        if (a.type === 'directory' && b.type === 'file') return -1
        if (a.type === 'file' && b.type === 'directory') return 1
        return a.name.localeCompare(b.name)
    })

    setTimeout(() => {
        isLoading.value = false
    }, 800)

}

function handleClick(item: FileItem) {
    emit('click', item)
}

function handleDoubleClick(item: FileItem) {
    emit('dblclick', item)
}

function handleBreadcrumbClick(path: string) {
    emit('click', {
        name: '',
        path,
        type: 'directory',
        metas: {}
    })
}

watch(() => [props.driveId, props.path], load, { immediate: true })
</script>

<template>
    <div class="flex flex-col bg-background h-full">
        <!-- Breadcrumb Navigation -->
        <FileExplorerBreadcrumb
            :path="path"
            @click-path="handleBreadcrumbClick"
        />

        <FileExplorerDirectory
            :items="entries"
            :loading="isLoading"
            :icon-key="item => item.type === 'directory' ? 'Folder' : 'FileText'"
            label-key="name"
            class="rounded-none shadow-none"
            @click="handleClick"
            @dblclick="handleDoubleClick"
        />
    </div>
</template>
