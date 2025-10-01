<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import File from '#shared/entities/file.entity.ts'
import { createId } from '#client/utils/createId.ts'
import DataTable from '#client/components/DataTable.vue'
import ObjectInspect from '#client/components/ObjectInspect.vue'
import { $auth } from '#client/composables/useAuth.ts'
import { $acl } from '#client/composables/useAcl.ts'
import { $file } from '#client/utils/file.ts'

const loading = ref(false)
const uploading = ref(false)
const tableRef = ref<ComponentExposed<typeof DataTable>>()
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
        id: 'client_name',
        label: $t('Name'),
        field: 'client_name',
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
    {
        id: 'metadata',
        label: $t('Metadata'),
        width: 100,
    },
    { id: 'actions' }
])

async function load() {
    await tableRef.value?.load()
}

async function upload(){
    
    const file = await $file.pick({
        multiple: false
    })
    
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
        load()
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
        load()
    }, 1000)

}
</script>
<template>
    <AppLayout>
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
            ref="tableRef"
            v-model:loading="loading"
            v-model:selected="selected"
            :columns="columns"
            :serialize="File.from"
            fetch="/api/files"
            row-key="id"
        >
            <template #row-metadata="{ row }">
                <ObjectInspect
                    v-if="row.metadata"
                    :model-value="row.metadata"
                >
                    <template #trigger>
                        <Button
                            size="sm"
                            variant="outline"
                        >
                            {{ $t('View') }}
                        </Button>
                    </template>
                </ObjectInspect>
                <div v-else>
                    -
                </div>
            </template>

            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">                    
                    <AlertButton
                        v-if="$acl.can('delete', row)"
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
    </AppLayout>
</template>
