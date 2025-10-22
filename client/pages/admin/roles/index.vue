<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import type { ComponentExposed } from 'vue-component-type-helpers'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import type Role from '#shared/entities/role.entity.ts'
import { createId } from '#client/utils/createId.ts'

const router = useRouter()

const items = ref<Role[]>([])
const loading = ref(false)
const saving = ref(false)
const tableRef = ref<ComponentExposed<typeof DataTable>>()
const deletingItems = ref<number[]>([])

const columns = defineColumns([
    {
        id: 'id',
        label: 'ID',
        field: 'id',
        width: 50,
    },
    {
        id: 'name',
        label: $t('Name'),
        field: 'name'
    },
    {
        id: 'description',
        label: $t('Description'),
        field: 'description'
    },
    { id: 'actions' }
])

async function load() {
    await tableRef.value?.load()
}
async function create() {
    saving.value = true

    const [error, response] = await tryCatch(() => $fetch<Role>('/api/roles', {
        method: 'POST',
        data: { name: 'New Role' + createId(), } 
    }))

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Created successfully.'))
    
    setTimeout(() => {
        saving.value = false
        router.push(`/admin/roles/${response.id}`)
    }, 1000)
}

async function destroy(id: number) {
    deletingItems.value.push(id)

    const [error] = await tryCatch(() => $fetch(`/api/roles/${id}`, { method: 'DELETE', }))

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
                {{ $t('Roles') }}
            </h1>
            <div>
                <Button
                    :loading="saving"
                    @click="create"
                >
                    {{ $t('Add new') }}
                </Button>
            </div>
        </div>

        <DataTable 
            ref="tableRef"
            v-model:loading="loading"
            :columns="columns"
            fetch="/api/roles"
        >
            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">
                    <Button
                        variant="ghost"
                        :to="`/admin/roles/${row.id}`"
                        size="sm"
                    >
                        <Icon name="pencil" />
                    </Button>
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
        </DataTable>
    </AppLayout>
</template>
