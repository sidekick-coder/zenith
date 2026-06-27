<script setup lang="ts">
import { ref } from 'vue'
import * as v from 'valibot'
import { toast } from 'vue-sonner'
import type { Token } from '@sidekick-coder/zenith-kit/shared'
import { useRouter } from 'vue-router'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'

import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import { useFetchPagination } from '#client/composables/useFetchPagination.ts'
import DialogForm from '#client/components/DialogForm.vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '#client/components/ui/dialog'
import { Checkbox } from '#client/components/ui/checkbox'
import { Label } from '#client/components/ui/label'

interface TokenWithUser extends Token {
    user: {
        id: number
        name: string
        email: string
    } | null
}

const loading = ref(false)
const router = useRouter()

const schema = v.object({ name: v.pipe(v.string(), v.minLength(1, $t('Name is required'))), })

const fields = {
    name: {
        component: 'text-field' as const,
        label: $t('Name'),
        placeholder: $t('e.g. My CI token')
    },
}

function onCreated(response: any) {
    router.push({
        path: `/admin/tokens/${response.id}`,
        state: { token: response.token }
    })
}

const { items, total, load, reset } = useFetchPagination<TokenWithUser>('/api/tokens', {
    limit: 20,
    query: { with: 'user', }
})

const deletingItems = ref<number[]>([])
const deleteDialogOpen = ref(false)
const deleteTargetId = ref<number | null>(null)
const deletePermissions = ref(false)

function openDeleteDialog(id: number) {
    deleteTargetId.value = id
    deletePermissions.value = false
    deleteDialogOpen.value = true
}

async function confirmDelete() {
    if (!deleteTargetId.value) return

    const id = deleteTargetId.value
    deleteDialogOpen.value = false
    deletingItems.value.push(id)

    const [error] = await tryCatch(() => $fetch(`/api/tokens/${id}`, {
        method: 'DELETE',
        query: { delete_permissions: deletePermissions.value }
    }))

    if (error) {
        toast.error($t('Failed to delete token.'))
        deletingItems.value = deletingItems.value.filter(i => i !== id)
        return
    }

    setTimeout(() => {
        toast.success($t('Token deleted successfully.'))
        deletingItems.value = deletingItems.value.filter(i => i !== id)
        reset()
    }, 1000)
}

const columns = defineColumns<TokenWithUser>([
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
        id: 'type',
        label: $t('Type'),
        field: 'type',
    },
    {
        id: 'user',
        label: $t('User'),
        field: 'user_id',
    },
    {
        id: 'created_at',
        label: $t('Created At'),
        field: row => $dt(row.created_at),
    },
    {
        id: 'expires_at',
        label: $t('Expires At'),
        field: row => $dt(row.expires_at),
    },
    { id: 'actions' }
])
</script>
<template>

    <div class="flex">
        <h1 class="text-2xl font-bold mb-4 text-foreground flex-1">
            {{ $t('Tokens') }}
        </h1>
        <div class="flex items-center gap-2">
            <Button variant="outline" size="icon" :disabled="loading" @click="load">
                <Icon name="RotateCcw" :class="{ 'animate-spin': loading }" />
            </Button>

            <DialogForm :schema="schema" :fields="fields" :title="$t('New Token')"
                :description="$t('Create a new API token.')" :submit-text="$t('Create Token')" fetch="/api/tokens"
                @submit="onCreated">
                <Button>
                    {{ $t('Add new') }}
                </Button>
            </DialogForm>
        </div>
    </div>
    <DataTable ref="tableRef" v-model:rows="items" v-model:total="total" v-model:loading="loading" :columns="columns">
        <template #row-name="{ row }">
            <span v-if="row.name" class="font-medium">
                {{ row.name }}
            </span>
            <span v-else class="text-sm text-muted-foreground">
                {{ $t('No name') }}
            </span>
        </template>

        <template #row-user="{ row }">
            <div v-if="row.user" class="flex flex-col gap-1">
                <div>{{ row.user.name }}</div>
                <div class="text-muted-foreground text-xs">
                    {{ row.user.email }}
                </div>
            </div>
            <div v-else>
                {{ `#${row.user_id}` }}
            </div>
        </template>

        <template #row-actions="{ row }">
            <div class="flex items-center gap-2 justify-end">
                <Button variant="ghost" size="sm" :to="`/admin/tokens/${row.id}`">
                    <Icon name="pencil" />
                </Button>
                <Button variant="ghost" size="sm" :loading="deletingItems.includes(row.id)"
                    @click="openDeleteDialog(row.id)">
                    <Icon name="trash" />
                </Button>
            </div>
        </template>
    </DataTable>

    <Dialog v-model:open="deleteDialogOpen">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{{ $t('Delete Token') }}</DialogTitle>
                <DialogDescription>
                    {{ $t('This action cannot be undone.') }}
                </DialogDescription>
            </DialogHeader>
            <div class="flex items-center gap-3 py-2">
                <Checkbox id="delete-permissions" v-model="deletePermissions" />
                <Label for="delete-permissions" class="cursor-pointer">
                    {{ $t('Also delete related permissions') }}
                </Label>
            </div>
            <DialogFooter>
                <Button variant="outline" @click="deleteDialogOpen = false">
                    {{ $t('Cancel') }}
                </Button>
                <Button variant="destructive" @click="confirmDelete">
                    {{ $t('Delete') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

</template>
