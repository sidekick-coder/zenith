<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import Icon from '#client/components/Icon.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { $t } from '#shared/lang'
import type DriveConfig from '#shared/entities/driveConfig.entity.ts'

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
const folder = ref('')

const columns = defineColumns<DriveEntry>([
    {
        id: 'type',
        label: $t('Type'),
        width: 80
    },
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
    }
])

async function load() {
    if (!props.drive?.id) {
        return
    }

    loading.value = true

    const [error, response] = await $fetch.try<DriveEntry[]>(`/api/drives/${props.drive.id}/entries`, {
        query: {
            folder: folder.value
        }
    })

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
    }
}

function formatSize(bytes?: number) {
    if (!bytes) {
        return ''
    }

    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
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
            <CardTitle>
                {{ $t('Files') }}
            </CardTitle>
            <CardDescription>
                {{ $t('Browse and manage files in this drive') }}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable
                v-model:rows="items"
                v-model:loading="loading"
                :columns="columns"
                :total="items.length"
                @row-click="onRowClick"
            >
                <template #row-type="{ row }">
                    <div class="flex items-center justify-center">
                        <Icon
                            :name="row.type === 'directory' ? 'Folder' : 'FileText'"
                            class="w-4 h-4"
                        />
                    </div>
                </template>

                <template #row-size="{ row }">
                    <div class="text-muted-foreground text-sm">
                        {{ formatSize(row.metas?.size) }}
                    </div>
                </template>

                <template #row-mimetype="{ row }">
                    <div class="text-muted-foreground text-sm">
                        {{ row.metas?.mimetype || '-' }}
                    </div>
                </template>
            </DataTable>
        </CardContent>
    </Card>
</template>
