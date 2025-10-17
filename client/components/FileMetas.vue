<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { Files } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import DialogForm, { defineFormFields } from '#client/components/DialogForm.vue'
import schemas from '#shared/validators/index.ts'
import FileMeta from '#shared/entities/fileMeta.entity.ts'

const props = defineProps({
    fileId: {
        type: String,
        required: true,
    },
})

const loading = ref(false)
const tableRef = ref<ComponentExposed<typeof DataTable>>()
const deletingItems = ref<number[]>([])

const columns = defineColumns<FileMeta>([
    {
        id: 'id',
        label: 'ID',
        field: 'id',
        width: 50,
    },
    {
        id: 'name',
        label: $t('Name'),
        field: 'name',
    },
    {
        id: 'value',
        label: $t('Value'),
        field: 'value',
    },
    { id: 'actions' }
])

const fields = defineFormFields({
    name: {
        component: 'text-field',
        label: $t('Name'),
    },
    value: {
        component: 'textarea',
        label: $t('Value'),
    },
})

function load(){
    tableRef.value?.load()
}

async function destroy(id: FileMeta['id']) {
    deletingItems.value.push(id)

    const [error] = await $fetch.try(`/api/files/${props.fileId}/metas/${id}`, { 
        method: 'DELETE', 
    })

    if (error) {
        toast.error($t('Failed to delete.'))
        deletingItems.value = []
        return
    }

    setTimeout(() => {
        deletingItems.value = deletingItems.value.filter(i => i !== id)
        toast.success($t('Deleted successfully.'))
        load()
    }, 1000)
}
</script>
<template>
    <Card>
        <CardHeader class="flex">
            <div class="flex-1">
                <CardTitle>{{ $t('Metas') }}</CardTitle>
                <CardDescription>{{ $t('Key-value pairs associated with the file') }}</CardDescription>
            </div>

            <div class="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    :disabled="loading"
                    @click="load"
                >
                    <Icon
                        name="RotateCcw"
                        :class="{ 'animate-spin': loading }"
                    />
                </Button>
                <DialogForm 
                    :fetch="`/api/files/${fileId}/metas`"
                    :title="$t('Add new meta')"
                    :description="$t('Fill in the details below to add a new meta')"
                    :schema="schemas.fileMeta.create"
                    :fields="fields"
                    @submit="load"
                >
                    <Button>
                        {{ $t('Add new') }}
                    </Button>
                </DialogForm>
            </div>
        </CardHeader>
        <CardContent>
            <DataTable
                ref="tableRef"
                v-model:loading="loading"
                :columns="columns"
                :serialize="row => FileMeta.from(row)"
                :fetch="`/api/files/${fileId}/metas`"
                row-key="id"
            >
                <template #row-actions="{ row }">
                    <div class="flex items-center gap-2 justify-end">
                        <DialogForm 
                            :fetch="`/api/files/${fileId}/metas/${row.id}`"
                            :title="$t('Edit meta')"
                            :description="$t('Fill in the details below to edit the meta')"
                            :schema="schemas.fileMeta.update"
                            :fields="{
                                name: {
                                    ...fields.name,
                                    disabled: true,
                                },
                                value: fields.value,
                            }"
                            :values="row"
                            method="PUT"
                            @submit="load"
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                            >
                                <Icon name="Edit" />
                            </Button>
                        </DialogForm>

                        <AlertButton
                            variant="ghost"
                            :title="$t('Delete meta')"
                            :description="$t('Are you sure you want to delete this meta?')"
                            :loading="deletingItems.includes(row.id)"
                            @confirm="destroy(row.id)"
                        >
                            <Icon name="Trash" />
                        </AlertButton>
                    </div>
                </template>
            </DataTable>
        </CardContent>
    </Card>
</template>