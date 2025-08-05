<script setup lang="ts">
import {
    ref,
    watch
} from 'vue'
import Icon from '#client/components/Icon.vue'
import FileExplorerDirectory from '#client/components/FileExplorerDirectory.vue'
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
        <div
            v-if="isLoading"
            class="flex items-center justify-center py-8"
        >
            <div class="text-muted-foreground">
                {{ $t('Loading...') }}
            </div>
        </div>

        <FileExplorerDirectory
            v-else
            :items="entries"
            :icon-key="item => item.type === 'directory' ? 'Folder' : 'FileText'"
            label-key="name"
            class="rounded-none shadow-none"
            @click="handleClick"
            @dblclick="handleDoubleClick"
        />
    </div>
</template>
