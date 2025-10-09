<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import type { ComponentExposed } from 'vue-component-type-helpers'
import Card from './ui/card/Card.vue'
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import PermissionAssignmentDialog from './PermissionAssignmentDialog.vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '#client/components/ui/dialog'
import { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import PermissionAssignment from '#shared/entities/permissionAssignment.entity'
import { createId } from '#client/utils/createId.ts'
import DataTable from '#client/components/DataTable.vue'
import PermissionDialog from '#client/components/PermissionDialog.vue'
import ObjectInspect from '#client/components/ObjectInspect.vue'
import Permission from '#shared/entities/permission.entity.ts'

const TypedDataTable = DataTable as typeof DataTable<PermissionAssignment>

const props = defineProps({ 
    assignType: {
        type: String,
        required: true,
    },
    assignId: {
        type: [String, Number],
        required: true,
    },
})



const loading = ref(false)
const saving = ref(false)
const tableRef = ref<ComponentExposed<typeof DataTable>>()
const deletingItems = ref<number[]>([])

const url = computed(() => `/api/permission-assignments?assign_type=${props.assignType}&assign_id=${props.assignId}`)
const rows = ref<PermissionAssignment[]>([])
const columns = defineColumns<PermissionAssignment>([
    {
        id: 'id',
        label: 'ID',
        field: 'id',
        width: 50,
    },
    {
        id: 'name',
        label: $t('Name'),
        field: row => row.permission?.name,
    },
    {
        id: 'origin',
        label: $t('Origin'),
        field: row => row.permission?.origin
    },
    {
        id: 'action',
        label: $t('Action'),
        field: row => row.permission?.action
    },
    {
        id: 'subject',
        label: $t('Subject'),
        field: row => row.permission?.subject
    },
    {
        id: 'conditions',
        label: $t('Conditions'),
        field: row => row.permission?.conditions
    },
    { id: 'actions' }
])

async function load() {
    await tableRef.value?.load()
}

async function attach(permission: Permission) {
    loading.value = true

    const [error, response] = await tryCatch(() => $fetch<PermissionAssignment>('/api/permission-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            assign_type: props.assignType,
            assign_id: props.assignId,
            permission_id: permission.id,
        }),
    }))

    if (error) {
        loading.value = false
        return
    }

    const assignment = new PermissionAssignment(response)

    assignment.permission = new Permission(permission)

    rows.value.unshift(assignment)

    setTimeout(() => {
        toast.success($t('Attached successfully.'))
        loading.value = false
    }, 800)
}

async function detach(item: PermissionAssignment) {
    deletingItems.value.push(item.id)

    const [error] = await tryCatch(() => $fetch(`/api/permission-assignments/${item.id}`, { method: 'DELETE', }))

    if (error) {
        deletingItems.value = []
        return
    }

    
    setTimeout(() => {
        toast.success($t('Permission detached successfully.'))
        deletingItems.value = []
        load()
    }, 1000)
}

async function detachAndDelete(item: PermissionAssignment, permission: Permission) {
    deletingItems.value.push(item.id)

    const [error] = await tryCatch(async () => {
        await $fetch(`/api/permission-assignments/${item.id}`, { method: 'DELETE', })
        await $fetch(`/api/permissions/${permission.id}`, { method: 'DELETE', })
    })

    if (error) {
        deletingItems.value = []
        return
    }

    
    setTimeout(() => {
        toast.success($t('Permission detached and deleted successfully.'))
        deletingItems.value = []
        load()
    }, 1000)
}
</script>
<template>
    <Card>
        <CardHeader class="flex flex-col md:flex-row items-center justify-between">
            <div>
                <CardTitle>{{ $t('Permissions') }}</CardTitle>
                <CardDescription>
                    {{ $t('Manage permissions and access levels.') }}
                </CardDescription>
            </div>
            <div class="flex  items-center gap-2">
                <Button
                    variant="outline"
                    :disabled="loading"
                    @click="load"
                >
                    {{ $t('Reload') }}
                </Button>
                
                <PermissionAssignmentDialog
                    :assign-type="props.assignType"
                    :assign-id="String(props.assignId)"
                    @submit="load"
                />
        
                <PermissionDialog @submit="attach" />
            </div>
        </CardHeader>
        <CardContent>
            <TypedDataTable
                ref="tableRef"
                v-model:loading="loading"
                v-model:rows="rows"
                :columns="columns"
                :serialize="PermissionAssignment.from"
                :fetch="url"
            >
                <template #row-name="{ row }">
                    <div class="font-medium truncate">
                        {{ row.permission?.name }}
                    </div>
                    <small
                        v-if="row.permission?.description"
                        class="text-xs text-muted-foreground "
                    >
                        {{ row.permission?.description || '-' }}
                    </small>
                </template>
        
                <template #row-conditions="{ row }">
                    <ObjectInspect
                        v-if="row.permission?.conditions"
                        :model-value="row.permission?.conditions"
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
                    <div class="flex items-center gap-2 justify-end">
                        <PermissionDialog
                            v-if="row.permission?.editable"
                            :permission="row.permission"
                            @submit="load"
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                            >
                                <Icon name="pencil" />
                            </Button>
                        </PermissionDialog>

                        <Dialog>
                            <DialogTrigger as-child>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    :loading="deletingItems.includes(row.id)"
                                >
                                    <Icon name="trash" />
                                </Button>
                            </DialogTrigger>

                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{{ $t('Detach Permission') }}</DialogTitle>
                                    <DialogDescription>
                                        {{ $t('Choose whether to detach the permission or detach and delete it permanently. If the permission is used elsewhere, deleting it may affect other assignments.') }}
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter class="flex sm:flex-col justify-end space-x-2 pt-4">
                                    <DialogClose>
                                        <Button
                                            variant="outline"
                                            class="w-full"
                                            @click="detach(row)"
                                        >
                                            {{ $t('Detach') }}
                                        </Button>
                                    </DialogClose>
                                    <DialogClose>
                                        <Button
                                            v-if="row.permission?.editable"
                                            variant="destructive"
                                            class="w-full"
                                            @click="detachAndDelete(row, row.permission)"
                                        >
                                            {{ $t('Detach & Delete') }}
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </template>
            </TypedDataTable>
        </CardContent>
    </Card>
</template>
