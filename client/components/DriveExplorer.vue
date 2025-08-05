<script setup lang="ts">
import {
    ref,
    onMounted,
    watch
} from 'vue'
import Icon from '#client/components/Icon.vue'
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle
} from '#client/components/ui/resizable'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '#client/components/ui/breadcrumb'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import { $t } from '#shared/lang.ts'

interface FileItem {
    name: string
    path: string
    type: 'file' | 'directory'
    metas: {
        mimetype?: string
        size?: number
    }
}

interface DriveData {
    id: string
    metas: {
        name?: string
        description?: string
    }
}

const props = defineProps<{
    driveId: string
    pwd?: string
}>()

const currentPath = ref(props.pwd || '')
const driveData = ref<DriveData | null>(null)
const files = ref<FileItem[]>([])
const selectedFile = ref<FileItem | null>(null)
const isLoading = ref(false)

async function loadDrive() {
    if (!props.driveId) return
    
    isLoading.value = true
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${props.driveId}`, { method: 'GET' }))
    
    if (error) {
        console.error('Failed to load drive:', error)
        isLoading.value = false
        return
    }
    
    driveData.value = response as DriveData
    isLoading.value = false
}

async function loadFiles() {
    if (!props.driveId) return
    
    isLoading.value = true
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${props.driveId}/files`, {
        method: 'GET',
        query: { folder: currentPath.value }
    }))
    
    if (error) {
        console.error('Failed to load files:', error)
        isLoading.value = false
        return
    }
    
    files.value = (response as FileItem[]) || []
    isLoading.value = false
}

function selectFile(file: FileItem) {
    selectedFile.value = file
}

function navigateToFolder(newPath: string) {
    currentPath.value = newPath
    loadFiles()
}

function goBack() {
    if (!currentPath.value) return
    
    const parts = currentPath.value.split('/')
    parts.pop()
    currentPath.value = parts.join('/')
    loadFiles()
}

function getFileIcon(file: FileItem) {
    if (file.type === 'directory') return 'folder'

    const mimetype = file.metas.mimetype || ''

    if (mimetype.startsWith('image/')) return 'image'
    
    if (mimetype.startsWith('image/')) return 'image'
    if (mimetype.startsWith('video/')) return 'video'
    if (mimetype.startsWith('audio/')) return 'music'
    if (mimetype.includes('pdf')) return 'file-text'
    if (mimetype.includes('text')) return 'file-text'
    
    return 'file'
}

function getBreadcrumbs() {
    if (!currentPath.value) return []
    return currentPath.value.split('/')
}

function navigateToBreadcrumb(index: number) {
    const breadcrumbs = getBreadcrumbs()
    const newPath = breadcrumbs.slice(0, index + 1).join('/')
    currentPath.value = newPath
    loadFiles()
}

watch(() => props.driveId, loadDrive, { immediate: true })
watch(() => props.pwd, (newPwd) => {
    currentPath.value = newPwd || ''
    loadFiles()
})

onMounted(() => {
    loadFiles()
})
</script>

<template>
    <div class="h-full border-2 rounded overflow-hidden border-muted bg-background">
        <ResizablePanelGroup
            direction="horizontal"
            class="h-full"
        >
            <!-- Left Sidebar - File Tree -->
            <ResizablePanel
                :default-size="25"
                :min-size="15"
                :max-size="50"
            >
                <div class="bg-sidebar border-r border-sidebar-border flex flex-col h-full">
                    <!-- File List -->
                    <div class="flex-1 overflow-auto p-2">
                        <div
                            v-if="isLoading"
                            class="flex items-center justify-center py-8"
                        >
                            <div class="text-sidebar-foreground/70">
                                {{ $t('Loading...') }}
                            </div>
                        </div>

                        <div
                            v-else
                            class="space-y-1"
                        >
                            <button
                                v-for="file in files"
                                :key="file.path"
                                :class="[
                                    'w-full flex items-center gap-2 p-2 rounded text-left transition-colors',
                                    selectedFile?.path === file.path 
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                                        : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground text-sidebar-foreground'
                                ]"
                                @click="file.type === 'directory' ? navigateToFolder(file.path) : selectFile(file)"
                            >
                                <Icon
                                    :name="getFileIcon(file)"
                                    class="w-4 h-4 flex-shrink-0"
                                />
                                <span class="truncate text-sm">{{ file.path }}</span>
                                <Icon
                                    v-if="file.type === 'directory'"
                                    name="chevron-right"
                                    class="w-3 h-3 flex-shrink-0 ml-auto"
                                />
                            </button>
                        </div>

                        <div
                            v-if="!isLoading && files.length === 0"
                            class="text-center py-8 text-sidebar-foreground/70"
                        >
                            {{ $t('No files found') }}
                        </div>
                    </div>
                </div>
            </ResizablePanel>

            <ResizableHandle with-handle />

            <!-- Right Panel - Preview -->
            <ResizablePanel :default-size="75">
                <div class="flex flex-col bg-background h-full">
                    <!-- Breadcrumb Navigation -->
                    <div class="p-4 border-b border-border">                        
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        as="button"
                                        class="flex items-center gap-x-2"
                                        @click="currentPath = ''; loadFiles()"
                                    >
                                        <Icon
                                            name="folder"
                                            class="w-4 h-4 mr-1"
                                        />
                                        /
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                
                                <template
                                    v-for="(part, index) in getBreadcrumbs()"
                                    :key="index"
                                >
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink
                                            v-if="index < getBreadcrumbs().length - 1"
                                            as="button"
                                            @click="navigateToBreadcrumb(index)"
                                        >
                                            {{ part }}
                                        </BreadcrumbLink>
                                        <BreadcrumbPage v-else>
                                            {{ part }}
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </template>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <!-- Preview Content -->
                    <div class="flex-1 p-4 overflow-auto">
                        <div
                            v-if="!selectedFile"
                            class="flex items-center justify-center h-full text-muted-foreground"
                        >
                            <div class="text-center">
                                <Icon
                                    name="file"
                                    class="w-12 h-12 mx-auto mb-4 opacity-50"
                                />
                                <p>{{ $t('Select a file or folder to see its preview') }}</p>
                            </div>
                        </div>

                        <div
                            v-else
                            class="space-y-4"
                        >
                            <!-- File Info -->
                            <div class="bg-card border border-border rounded-lg p-4">
                                <div class="flex items-center gap-3 mb-3">
                                    <Icon
                                        :name="getFileIcon(selectedFile)"
                                        class="w-6 h-6"
                                    />
                                    <div>
                                        <h4 class="font-medium">
                                            {{ selectedFile.path }}
                                        </h4>
                                        <p class="text-sm text-muted-foreground">
                                            {{ selectedFile.metas.mimetype }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Directory Contents Preview -->
                            <div
                                v-if="selectedFile.type === 'directory'"
                                class="bg-card border border-border rounded-lg p-4"
                            >
                                <h5 class="font-medium mb-3">
                                    {{ $t('Directory Contents') }}
                                </h5>
                                <p class="text-sm text-muted-foreground">
                                    {{ $t('Click to navigate into this directory') }}
                                </p>
                            </div>

                            <!-- File Preview Placeholder -->
                            <div
                                v-else
                                class="bg-card border border-border rounded-lg p-4"
                            >
                                <h5 class="font-medium mb-3">
                                    {{ $t('File Details') }}
                                </h5>
                                <div class="space-y-2 text-sm">
                                    <div class="flex justify-between">
                                        <span class="text-muted-foreground">{{ $t('Type:') }}</span>
                                        <span>{{ selectedFile.metas.mimetype }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-muted-foreground">{{ $t('Name:') }}</span>
                                        <span>{{ selectedFile.path }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
</template>

