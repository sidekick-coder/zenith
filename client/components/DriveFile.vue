<script setup lang="ts">
import {
    ref,
    onMounted,
    watch
} from 'vue'
import Icon from '#client/components/Icon.vue'
import FileExplorerBreadcrumb from '#client/components/FileExplorerBreadcrumb.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'


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
    navigate: [path: string]
}>()

const fileData = ref<FileItem | null>(null)
const isLoading = ref(false)

function getFileIcon(file: FileItem) {
    if (file.type === 'directory') return 'folder'

    const mimetype = file.metas.mimetype || ''

    if (mimetype.startsWith('image/')) return 'Image'
    if (mimetype.startsWith('video/')) return 'Video'
    if (mimetype.startsWith('audio/')) return 'Music'
    if (mimetype.includes('pdf')) return 'FileText'
    if (mimetype.includes('text')) return 'FileText'
    
    return 'file'
}

function handleBreadcrumbClick(path: string) {
    emit('navigate', path)
}

async function loadFileData() {
    if (!props.driveId || !props.path) return
    
    isLoading.value = true
    
    // For now, we'll construct the file data from the path
    // In a real implementation, you might need a specific API endpoint for file details
    const pathParts = props.path.split('/')
    const fileName = pathParts[pathParts.length - 1]
    
    // Try to get file info from the parent directory
    const parentPath = pathParts.slice(0, -1).join('/')
    
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${props.driveId}/files`, {
        method: 'GET',
        query: { folder: parentPath }
    }))
    
    if (error) {
        console.error('Failed to load file data:', error)
        fileData.value = null
        isLoading.value = false
        return
    }
    
    const files = (response as FileItem[]) || []
    const file = files.find(f => f.path === props.path)
    
    if (file) {
        fileData.value = file
    } else {
        // Fallback: create basic file info from path
        fileData.value = {
            name: fileName,
            path: props.path,
            type: 'file',
            metas: {}
        }
    }
    
    isLoading.value = false
}

function formatFileSize(size?: number): string {
    if (!size) return ''
    
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
    if (size < 1024 * 1024 * 1024) return `${Math.round(size / (1024 * 1024))} MB`
    
    return `${Math.round(size / (1024 * 1024 * 1024))} GB`
}

watch(() => [props.driveId, props.path], loadFileData, { immediate: true })

onMounted(() => {
    loadFileData()
})
</script>

<template>
    <div class="flex flex-col bg-background h-full">
        <!-- Breadcrumb Navigation -->
        <div class="border-b border-border">
            <FileExplorerBreadcrumb
                :path="path"
                root-label="Root"
                root-icon="folder"
                @navigate="handleBreadcrumbClick"
            />
        </div>

        <!-- File Details -->
        <div class="flex-1 p-4 overflow-auto">
            <div
                v-if="isLoading"
                class="flex items-center justify-center py-8"
            >
                <div class="text-muted-foreground">
                    {{ $t('Loading...') }}
                </div>
            </div>

            <div
                v-else-if="!fileData"
                class="flex items-center justify-center py-8"
            >
                <div class="text-muted-foreground">
                    {{ $t('File not found') }}
                </div>
            </div>

            <div
                v-else
                class="space-y-4"
            >
                <!-- File Info Card -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <div class="flex items-center gap-3 mb-3">
                        <Icon
                            :name="getFileIcon(fileData)"
                            class="w-8 h-8"
                        />
                        <div>
                            <h4 class="font-medium text-lg">
                                {{ fileData.name }}
                            </h4>
                            <p class="text-sm text-muted-foreground">
                                {{ fileData.metas.mimetype || $t('Unknown file type') }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- File Details Card -->
                <div class="bg-card border border-border rounded-lg p-4">
                    <h5 class="font-medium mb-3">
                        {{ $t('File Details') }}
                    </h5>
                    <div class="space-y-3 text-sm">
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">
                                {{ $t('Name:') }}
                            </span>
                            <span class="font-medium">
                                {{ fileData.name }}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">
                                {{ $t('Path:') }}
                            </span>
                            <span class="font-mono text-xs">
                                {{ fileData.path }}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-muted-foreground">
                                {{ $t('Type:') }}
                            </span>
                            <span>
                                {{ fileData.metas.mimetype || $t('Unknown') }}
                            </span>
                        </div>
                        <div
                            v-if="fileData.metas.size"
                            class="flex justify-between"
                        >
                            <span class="text-muted-foreground">
                                {{ $t('Size:') }}
                            </span>
                            <span>
                                {{ formatFileSize(fileData.metas.size) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
