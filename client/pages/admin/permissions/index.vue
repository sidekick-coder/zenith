<script setup lang="ts">
import { watch, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import Permission from '#shared/entities/permission.entity.ts'
import { createId } from '#client/utils/createId.ts'
import DataTableServer from '#client/components/DataTableServer.vue'
import PermissionDialog from '#client/components/PermissionDialog.vue'
import ObjectInspect from '#client/components/ObjectInspect.vue'

const TypedDataTable = DataTableServer as typeof DataTableServer<Permission>

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const tableRef = ref<ComponentExposed<typeof DataTableServer>>()
const deletingItems = ref<number[]>([])

const columns = defineColumns<Permission>([
    {
        id: 'id',
        header: 'ID',
        accessorKey: 'id',
        size: 50,
        minSize: 50,
        maxSize: 100,
    },
    {
        id: 'name',
        header: $t('Name'),
        accessorKey: 'name',
    },
    {
        id: 'origin',
        header: $t('Origin'),
        accessorKey: 'origin'
    },
    {
        id: 'action',
        header: $t('Action'),
        accessorKey: 'action'
    },
    {
        id: 'subject',
        header: $t('Subject'),
        accessorKey: 'subject'
    },
    {
        id: 'conditions',
        header: $t('Conditions'),
        accessorKey: 'conditions'
    },
    { id: 'actions' }
])

async function load() {
    await tableRef.value?.load()
}

async function destroy(id: number) {
    deletingItems.value.push(id)

    const [error] = await tryCatch(() => $fetch(`/api/permissions/${id}`, { method: 'DELETE', }))

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
                {{ $t('Permissions') }}
            </h1>
            <div class="flex items-center gap-2">
                <Button
                    variant="outline"
                    :disabled="loading"
                    @click="load"
                >
                    {{ $t('Reload') }}
                </Button>

                <PermissionDialog @submit="load" />
            </div>
        </div>

        <TypedDataTable
            ref="tableRef"
            v-model:loading="loading"
            :columns="columns"
            :serialize="Permission.from"
            fetch="/api/permissions"
        >
            <template #row-name="{ row }">
                <div class="font-medium">
                    {{ row.name }}
                </div>
                <small
                    v-if="row.description"
                    class="text-xs text-muted-foreground"
                >
                    {{ row.description || '-' }}
                </small>
            </template>

            <template #row-conditions="{ row }">
                <ObjectInspect
                    v-if="row.conditions"
                    :model-value="row.conditions"
                >
                    <template #trigger>
                        <Button
                            :key="`inspect-conditions-${createId()}`"
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
                <div
                    v-if="row.editable"
                    class="flex items-center gap-2 justify-end"
                >
                    <PermissionDialog
                        :permission="row"
                        @submit="load"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                        >
                            <Icon name="pencil" />
                        </Button>
                    </PermissionDialog>
                    <AlertButton
                        variant="ghost"
                        size="sm"
                        :loading="deletingItems.includes(row.id)"
                        @confirm="destroy(row.id)"
                    >
                        <Icon name="trash" />
                    </AlertButton>
                </div>
            </template>
        </TypedDataTable>
    </AppLayout>
</template>
