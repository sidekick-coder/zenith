<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'

import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import UserDialog from '#client/components/UserDialog.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import ClientOnly from '#client/components/ClientOnly.vue'
import type User from '#shared/entities/user.entity.ts'
import { useFetchPagination } from '#client/composables/useFetchPagination.ts'

const loading = ref(false)

const { items, total, load, reset } = useFetchPagination<User>('/api/users', {
    limit: 20,
})

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
        field: 'name',
    },
    {
        id: 'username',
        label: $t('Username'),
        field: 'username',
    },
    {
        id: 'email',
        label: 'Email',
        field: 'email',
    },
    { id: 'actions' }
])

async function destroy(id: number) {
    deletingItems.value.push(id)
    
    const [error] = await tryCatch(() => $fetch(`/api/users/${id}`, { method: 'DELETE', }))

    if (error) {
        toast.error($t('Failed to delete user.'))
        deletingItems.value = []
        return
    }

    setTimeout(() => {
        toast.success($t('User deleted successfully.'))
        reset()
    }, 1000)
}
</script>
<template>
    <AppLayout>
        <div class="flex">
            <h1 class="text-2xl font-bold mb-4 text-foreground flex-1">
                {{ $t('Users') }}
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

                <ClientOnly>
                    <UserDialog @submit="reset" />
                </ClientOnly>
            </div>
        </div>
        <DataTable
            ref="tableRef"
            v-model:rows="items"
            v-model:total="total"
            v-model:loading="loading"
            :columns="columns"
        >
            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">
                    <Button
                        variant="ghost"
                        :to="`/admin/users/${row.id}`"
                        size="sm"
                    >
                        <Icon name="edit" />
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
