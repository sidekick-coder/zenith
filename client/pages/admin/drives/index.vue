<script setup lang="ts">
import { watch, ref } from 'vue'
import { toast } from 'vue-sonner'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '#client/components/ui/alert-dialog'
import UserDialog from '#client/components/UserDialog.vue'
import ClientOnly from '#client/components/ClientOnly.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import type { Drive } from '#client/types.ts'

const items = ref<Drive[]>([])
const page = ref(1)
const deletingItems = ref<string[]>([])

const columns = defineColumns<Drive>([
    {
        id: 'id',
        header: 'ID',
        accessorKey: 'id',
        size: 50,
    },
    {
        id: 'name',
        header: $t('Name'),
        accessorFn: row => row.metas?.name || row.id
    },
    {
        id: 'description',
        header: $t('Description'),
        accessorKey: 'metas.description',
    },
    { id: 'actions' }
])

async function load(){
    const [error, response] = await tryCatch(() => $fetch('/api/drives', {
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
                {{ $t('Drives') }}
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
                        :to="`/admin/drives/${row.id}`"
                        size="sm"
                    >
                        <Icon name="eye" />
                    </Button>

                    <AlertDialog v-if="row.metas.editable">
                        <AlertDialogTrigger>
                            <Button
                                variant="ghost"
                                size="sm"
                                :loading="deletingItems.includes(row.id)"
                            >
                                <Icon name="trash" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{{ $t('Delete User') }}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {{ $t('Are you sure you want to delete this user? This action cannot be undone.') }}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{{ $t('Cancel') }}</AlertDialogCancel>
                                <AlertDialogAction @click="destroy(row.id)">
                                    {{ $t('Confirm') }}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </template>
        </DataTable>
    </AppLayout>
</template>
