<script setup lang="ts">
import {
    ref,
    onMounted,
    watch
} from 'vue'
import Icon from '#client/components/Icon.vue'
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

function getBreadcrumbs() {
    if (!props.path) return []
    return props.path.split('/')
}

function navigateToBreadcrumb(index: number) {
    const breadcrumbs = getBreadcrumbs()
    const newPath = breadcrumbs.slice(0, index + 1).join('/')
    emit('click', {
        name: '',
        path: newPath,
        type: 'directory',
        metas: {}
    })
}

function navigateToRoot() {
    emit('click', {
        name: '',
        path: '',
        type: 'directory',
        metas: {}
    })
}

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

    isLoading.value = false
}

function handleClick(item: FileItem) {
    emit('click', item)
}

function handleDoubleClick(item: FileItem) {
    emit('dblclick', item)
}

watch(() => [props.driveId, props.path], load, { immediate: true })
</script>

<template>
    <div class="flex flex-col bg-background h-full">
        <!-- Breadcrumb Navigation -->
        <div class="p-4 border-b border-border">                        
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink
                            as="button"
                            class="flex items-center gap-x-2"
                            @click="navigateToRoot"
                        >
                            <Icon
                                name="folder"
                                class="size-4 mr-1"
                            />
                            <div>Root</div>
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

        <!-- Directory Contents -->
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
                v-else-if="entries.length === 0"
                class="text-sm text-muted-foreground text-center py-8"
            >
                {{ $t('This directory is empty') }}
            </div>

            <div
                v-else
                class="space-y-2"
            >
                <div
                    v-for="item in entries"
                    :key="item.path"
                    class="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    @click="handleClick(item)"
                    @dblclick="handleDoubleClick(item)"
                >
                    <Icon
                        :name="getFileIcon(item)"
                        class="w-5 h-5 flex-shrink-0"
                    />
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate">
                            {{ item.name }}
                        </p>
                        <p class="text-xs text-muted-foreground">
                            {{ item.type === 'directory' ? $t('Directory') : item.metas.mimetype }}
                        </p>
                    </div>
                    <div class="text-xs text-muted-foreground">
                        {{ item.type === 'file' && item.metas.size ? `${Math.round(item.metas.size / 1024)} KB` : '' }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
