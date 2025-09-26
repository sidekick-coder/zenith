<script setup lang="ts">
import { watch, ref } from 'vue'
import { toast } from 'vue-sonner'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import UserDialog from '#client/components/UserDialog.vue'
import ClientOnly from '#client/components/ClientOnly.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'

const items = ref([])
const page = ref(1)
const deletingItems = ref<string[]>([])

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

async function load(){
    const [error, response] = await tryCatch(() => $fetch<any>('/api/users', {
        method: 'GET',
        query: {
            page: page.value,
            limit: 20,
        },
    }))

    if (error) {
        console.error('Failed to load users:', error)
        return
    }

    items.value = response.data || []
}

function reset() {
    page.value = 1
    return load()
}

async function destroy(id: string) {
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

watch(page, load, { immediate: true })
</script>
<template>
    <AppLayout>
        <div class="flex">
            <h1 class="text-2xl font-bold mb-4 text-foreground flex-1">
                {{ $t('Users') }}
            </h1>
            <div>
                <ClientOnly>
                    <UserDialog @submit="reset" />
                </ClientOnly>
            </div>
        </div>

        <DataTable 
            :rows="items"
            :page="page"
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
