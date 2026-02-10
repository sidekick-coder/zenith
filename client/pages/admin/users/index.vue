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
import User from '#shared/entities/user.entity.ts'
import { useFetchPagination } from '#client/composables/useFetchPagination.ts'

const loading = ref(false)

const { items, total, load, reset } = useFetchPagination<User>('/api/users', {
    limit: 20,
    serialize: row => User.from(row),
})

const deletingItems = ref<number[]>([])
const verifyingItems = ref<number[]>([])

const columns = defineColumns<User>([
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
    {
        id: 'verified_at',
        label: $t('Verified'),
        field: 'verified_at',
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

async function verify(id: number) {
    verifyingItems.value.push(id)
    
    const [error] = await tryCatch(() => $fetch(`/api/users/${id}/retry-email-verification`, { method: 'POST', }))

    if (error) {
        verifyingItems.value = verifyingItems.value.filter(item => item !== id)
        return
    }

    toast.success($t('Verification email sent successfully.'))

    setTimeout(() => {
        verifyingItems.value = verifyingItems.value.filter(item => item !== id)
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
            <template #row-verified_at="{ row }">
                <div
                    v-if="row.verified_at"
                    class="text-sm text-muted-foreground"
                >
                    {{ $dt(row.verified_at) }}
                </div>
                <Button
                    v-if="!row.verified_at"
                    variant="outline"
                    size="sm"
                    :loading="verifyingItems.includes(row.id)"
                    @click="verify(row.id)"
                >
                    {{ $t('Resend Email') }}
                </Button>
            </template>

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
