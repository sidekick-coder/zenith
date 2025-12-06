<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import Permission from '#shared/entities/permission.entity.ts'
import { createId } from '#client/utils/createId.ts'
import DataTable from '#client/components/DataTable.vue'
import PermissionDialog from '#client/components/PermissionDialog.vue'
import ObjectInspect from '#client/components/ObjectInspect.vue'
import { useFetchPagination } from '#client/composables/useFetchPagination.ts'

const TypedDataTable = DataTable as typeof DataTable<Permission>

const { items, total, loading, load, reset } = useFetchPagination<Permission>('/api/permissions', {
    serialize: Permission.from,
    limit: 20,
})

const deletingItems = ref<number[]>([])
const selected = ref<Permission[]>([])

const columns = defineColumns<Permission>([
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
        id: 'origin',
        label: $t('Origin'),
        field: 'origin'
    },
    {
        id: 'action',
        label: $t('Action'),
        field: 'action'
    },
    {
        id: 'subject',
        label: $t('Subject'),
        field: 'subject'
    },
    {
        id: 'conditions',
        label: $t('Conditions'),
        field: 'conditions'
    },
    { id: 'actions' }
])

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
        reset()
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
                    size="icon"
                    :disabled="loading"
                    @click="load"
                >
                    <Icon
                        name="RotateCcw"
                        :class="{ 'animate-spin': loading }"
                    />
                </Button>

                <PermissionDialog @submit="load" />
            </div>
        </div>

        <TypedDataTable
            v-model:rows="items"
            v-model:total="total"
            v-model:loading="loading"
            v-model:selected="selected"
            :columns="columns"
            selection="multiple"
            row-key="id"
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
