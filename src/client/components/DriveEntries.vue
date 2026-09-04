<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import Icon from '#client/components/Icon.vue'
import Button from '#client/components/Button.vue'
import AlertButton from '#client/components/AlertButton.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { $file } from '#client/utils/file.ts'
import type DriveConfig from '#shared/entities/driveConfig.entity.ts'
import type UploadSession from '#shared/entities/fileUploadSession.entity.ts'

interface DriveEntry {
    name: string
    path: string
    type: 'file' | 'directory'
    metas: {
        mimetype?: string
        size?: number
    }
}

const props = defineProps({
    drive: {
        type: Object as () => DriveConfig,
        required: true
    }
})

const items = ref<DriveEntry[]>([])
const loading = ref(false)
const uploading = ref(false)
const deleting = ref<string | null>(null)
const folder = ref('')

const columns = defineColumns<DriveEntry>([
    {
        id: 'name',
        label: $t('Name'),
        field: 'name'
    },
    {
        id: 'size',
        label: $t('Size'),
        width: 120
    },
    {
        id: 'mimetype',
        label: $t('Type'),
        width: 200
    },
    {
        id: 'actions',
        label: $t('Actions'),
        width: 150
    }
])

async function load() {
    if (!props.drive?.id) {
        return
    }

    loading.value = true

    const [error, response] = await $fetch.try<DriveEntry[]>(`/api/drives/${props.drive.id}/entries`, { query: { folder: folder.value } })

    if (error) {
        loading.value = false
        return
    }

    items.value = response

    setTimeout(() => {
        loading.value = false
    }, 500)
}

function onRowClick(entry: DriveEntry) {
    if (entry.type === 'directory') {
        folder.value = entry.path
        load()
        return
    }
    
    if (entry.type === 'file') {
        openFile(entry)
    }
}

function viewFolder(entry: DriveEntry) {
    if (entry.type === 'directory') {
        folder.value = entry.path
        load()
    }
}

function openFile(entry: DriveEntry) {
    const url = `/api/drives/${props.drive.id}/open/${entry.path.replace(/^\//, '')}`
    window.open(url, '_blank')
}

function goBack() {
    if (!folder.value) {
        return
    }
    
    const parts = folder.value.split('/').filter(Boolean)
    parts.pop()
    folder.value = parts.join('/')
    load()
}

function formatSize(bytes?: number) {
    if (!bytes) {
        return ''
    }

    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

async function uploadFile() {
    const file = await $file.pick({ accept: '*/*' })

    if (!file) {
        return
    }

    uploading.value = true

    const [sessionError, session] = await $fetch.try<UploadSession>(`/api/drives/${props.drive.id}/entries/upload-sessions`, {
        method: 'POST',
        data: {
            client_name: file.name,
            folder: folder.value || undefined,
            mime_types: '*/*',
            max_size: 500 * 1024 * 1024,
        },
    })

    if (sessionError || !session?.upload_url) {
        uploading.value = false
        return
    }

    const [uploadError] = await tryCatch(() => $fetch(session.upload_url!, {
        method: 'PUT',
        body: file,
    }))

    uploading.value = false

    if (uploadError) {
        return
    }

    toast.success($t('File uploaded successfully'))
    load()
}

async function deleteEntry(entry: DriveEntry) {
    deleting.value = entry.path

    const path = entry.path.replace(/^\//, '')

    const [error] = await $fetch.try(`/api/drives/${props.drive.id}/entries/${path}`, { method: 'DELETE', })

    deleting.value = null

    if (error) {
        return
    }

    toast.success($t('Entry deleted successfully'))
    load()
}

watch(() => props.drive, () => {
    folder.value = ''
    load()
})

onMounted(() => {
    load()
})
</script>

<template>
    <Card>
        <CardHeader>
            <div class="flex items-center gap-x-2">
                <div class="flex-1">
                    <CardTitle>
                        {{ $t('Files') }}
                    </CardTitle>
                    <CardDescription>
                        {{ $t('Browse and manage files in this drive') }}
                    </CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    @click="load"
                >
                    <Icon
                        name="RotateCcw"
                        :class="{ 'animate-spin': loading }"
                    />
                </Button>
                <Button
                    variant="outline"
                    :loading="uploading"
                    @click="uploadFile"
                >
                    <Icon
                        name="Upload"
                        class="w-4 h-4 mr-2"
                    />
                    {{ $t('Upload') }}
                </Button>
            </div>
            <div
                v-if="folder"
                class="flex items-center gap-2 mt-4"
            >
                <Button
                    variant="outline"
                    size="sm"
                    @click="goBack"
                >
                    <Icon
                        name="ArrowLeft"
                        class="w-4 h-4 mr-2"
                    />
                    {{ $t('Back') }}
                </Button>
                <div class="text-sm text-muted-foreground">
                    {{ $t('Current path') }}: <span class="font-mono">{{ folder || '/' }}</span>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <DataTable
                v-model:rows="items"
                v-model:loading="loading"
                :columns="columns"
                :total="items.length"
                @row-click="onRowClick"
            >
                <template #row-name="{ row }">
                    <div class="flex items-center">
                        <Icon
                            :name="row.type === 'directory' ? 'Folder' : 'FileText'"
                            class="w-4 h-4"
                        />

                        <span class="ml-2">
                            {{ row.name }}
                        </span>
                    </div>
                </template>

                <template #row-size="{ row }">
                    <div class="text-muted-foreground text-sm">
                        {{ formatSize(row.metas?.size) || '-' }}
                    </div>
                </template>

                <template #row-mimetype="{ row }">
                    <div class="text-muted-foreground text-sm">
                        {{ row.metas?.mimetype || '-' }}
                    </div>
                </template>

                <template #row-actions="{ row }">
                    <div class="flex items-center gap-1">
                        <Button
                            v-if="row.type === 'directory'"
                            variant="ghost"
                            size="sm"
                            @click.stop="viewFolder(row)"
                        >
                            <Icon
                                name="FolderOpen"
                                class="w-4 h-4"
                            />
                        </Button>
                        <Button
                            v-if="row.type === 'file'"
                            variant="ghost"
                            size="sm"
                            @click.stop="openFile(row)"
                        >
                            <Icon
                                name="ExternalLink"
                                class="w-4 h-4"
                            />
                        </Button>
                        <AlertButton
                            variant="ghost"
                            size="sm"
                            :loading="deleting === row.path"
                            :description="$t('This will permanently delete :0.', [row.name])"
                            @click.stop
                            @confirm="deleteEntry(row)"
                        >
                            <Icon
                                name="Trash"
                                class="w-4 h-4"
                            />
                        </AlertButton>
                    </div>
                </template>
            </DataTable>
        </CardContent>
    </Card>
</template>
