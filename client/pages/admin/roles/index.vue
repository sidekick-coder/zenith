<script setup lang="ts">
import { watch, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import type Role from '#shared/entities/role.entity.ts'
import { createId } from '#client/utils/createId.ts'

const router = useRouter()

const items = ref<Role[]>([])
const loading = ref(false)
const saving = ref(false)
const page = ref(1)
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

async function load(){
    loading.value = true 

    const [error, response] = await tryCatch(() => $fetch<{ data: Role[] }>('/api/roles', {
        method: 'GET',
        query: {
            page: page.value,
            limit: 20,
        },
    }))

    if (error) {
        loading.value = false
        return
    }

    items.value = response.data || []

    setTimeout(() => {
        loading.value = false
    }, 500)
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
        items.value = items.value.filter(i => i.id !== id)
    }, 1000)

}

watch(page, load, { immediate: true })
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
            :rows="items"
            :page="page"
            :columns="columns"
            :loading="loading"
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
