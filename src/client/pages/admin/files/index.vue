<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { defineColumns } from '#client/components/DataTable.vue'

import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import File from '#shared/entities/file.entity.ts'
import DataTable from '#client/components/DataTable.vue'
import { $file } from '#client/utils/file.ts'
import Image from '#client/components/Image.vue'
import acl from '#client/facades/acl.facade.ts'

const query = ref({ include: ['metas', 'url'], })

const tableRef = ref<ComponentExposed<typeof DataTable>>()

const loading = ref(false)
const uploading = ref(false)
const deletingItems = ref<number[]>([])
const selected = ref<File[]>([])

const columns = defineColumns<File>([
    {
        id: 'id',
        label: 'ID',
        field: 'id',
        width: 50,
    },
    {
        id: 'preview',
        label: $t('Preview'),
    },
    {
        id: 'filename',
        label: $t('Filename'),
        field: 'filename',
    },
    {
        id: 'purpose',
        label: $t('Purpose'),
        field: 'purpose',
    },
    {
        id: 'mimetype',
        label: $t('MIME Type'),
        field: 'mimetype'
    },
    {
        id: 'drive',
        label: $t('Drive'),
        field: 'drive'
    },
    { id: 'actions' }
])

async function load(){
    await tableRef.value?.load()
}

function reset(){
    selected.value = []
    load()
}

async function upload(){
    
    const file = await $file.pick({ multiple: false })
    
    if (!file) {
        return
    }

    uploading.value = true

    const form = new FormData()

    form.append('file', file)

    const [error] = await tryCatch(() => $fetch('/api/files/upload', {
        method: 'POST',
        body: form,
    }))

    if (error) {
        uploading.value = false
        return
    }

    setTimeout(() => {
        toast.success($t('Uploaded successfully.'))
        uploading.value = false
        reset()
    }, 500)
}

async function destroy(id: number) {
    deletingItems.value.push(id)

    const [error] = await tryCatch(() => $fetch(`/api/files/${id}`, { method: 'DELETE', }))

    if (error) {
        deletingItems.value = []
        return
    }

    
    setTimeout(() => {
        toast.success($t('Deleted successfully.'))
        deletingItems.value = []
        reset()
    }, 1000)

}
</script>
<template>
    <div class="flex">
        <h1 class="text-2xl font-bold mb-4 text-foreground flex-1">
            {{ $t('Files') }}
        </h1>
        <div class="flex items-center gap-2">
            <Button
                variant="outline"
                :disabled="loading"
                @click="load"
            >
                {{ $t('Reload') }}
            </Button>
            <Button
                :disabled="loading"
                @click="upload"
            >
                {{ $t('Add new') }}
            </Button>
        </div>
    </div>

    <DataTable
        v-model:loading="loading"
        :columns="columns"
        :serialize="row => File.from(row)"
        :fetch-query="query"
        fetch="/api/files"
        row-key="id"
    >
        <template #row-filename="{ row }">
            <div>{{ row.client_name }}</div>
            <div class="text-xs text-muted-foreground">
                {{ row.filename }}
            </div>
        </template>

        <template #row-preview="{ row }">
            <Image
                v-if="row.isImage() && row.url"
                :src="row.url"
                class="size-16 object-cover rounded border border-muted-foreground/50"
            />
            <div
                v-else
                class="size-16 flex items-center justify-center bg-muted rounded border border-muted-foreground/50"
            >
                <Icon
                    name="File"
                    class="size-6 text-muted-foreground"
                />
            </div>
        </template>

        <template #row-actions="{ row }">
            <div class="flex items-center gap-2 justify-end">                    
                <Button
                    variant="ghost"
                    size="sm"
                    :to="`/admin/files/${row.id}`"
                >
                    <Icon name="Edit" />
                </Button>
                <AlertButton
                    v-if="acl.can('delete', row)"
                    variant="ghost"
                    size="sm"
                    :loading="deletingItems.includes(row.id)"
                    @confirm="destroy(row.id)"
                >
                    <Icon name="trash" />
                </AlertButton>
            </div>
        </template>
    </DataTable>
</template>
