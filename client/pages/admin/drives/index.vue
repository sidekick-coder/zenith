<script setup lang="ts">
import { ref  } from 'vue'
import { toast } from 'vue-sonner'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'

import AdminLayout from '#client/layouts/AdminLayout.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import type { Drive } from '#client/types.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import AlertButton from '#client/components/AlertButton.vue'
import Switch from '#client/components/ui/switch/Switch.vue'
import { useFetchPagination } from '#client/composables/useFetchPagination.ts'
import DialogForm from '#client/components/DialogForm.vue'
import DriveConfig from '#shared/entities/driveConfig.entity.ts'

const { items, total, loading, load, reset } = useFetchPagination<Drive>('/api/drives', { limit: 20, })

const generating = ref(false)
const settingDefault = ref<Record<string, boolean>>({})

const columns = defineColumns<Drive>([
    {
        id: 'default',
        label: 'Default',
        width: 120,
    },
    {
        id: 'id',
        label: 'ID',
        field: 'id',
        width: 120,
    },
    {
        id: 'name',
        label: $t('Name'),
        field: 'name'
    },
    { id: 'actions' }
])

async function generateDefaults(){
    generating.value = true

    const [error] = await $fetch.try('/api/drives/generate-defaults', { method: 'POST' })

    if (error) {
        generating.value = false
        return
    }

    setTimeout(() => {
        generating.value = false
        toast.success($t('Default drives created'))    
        reset()
    }, 1000)

}

async function setDefault(drive: Drive) {
    settingDefault.value[drive.id] = true

    const [error] = await $fetch.try(`/api/drives/${drive.id}/set-default`, { method: 'POST' })

    if (error) {
        settingDefault.value[drive.id] = false
        return
    }

    settingDefault.value[drive.id] = false
    reset()
}
</script>
<template>
    <AdminLayout>
        <div class="flex">
            <h1 class="text-2xl font-bold mb-4 text-foreground flex-1">
                {{ $t('Drives') }}
            </h1>
            <div class="flex items-center gap-2">
                <AlertButton
                    variant="outline"
                    :loading="generating"
                    @confirm="generateDefaults"
                >
                    {{ $t('Generate Default Drives') }}
                </AlertButton>

                <DialogForm
                    :title="$t('Add New')"
                    :description="$t('Create a new drive by filling out the form below')"
                    :fields="{
                        id: {
                            component: 'text-field',
                            label: 'ID'
                        },
                        name: {
                            component: 'text-field',
                            label: $t('Name')
                        },
                        type: {
                            component: 'select',
                            label: $t('Type'),
                            options: DriveConfig.TYPES,
                            labelKey: 'label',
                            valueKey: 'id',
                        },
                    }"
                    fetch="/api/drives"
                    @submit="reset"
                >
                    <Button>
                        {{ $t('Add new') }}
                    </Button>
                </DialogForm>

                <Button
                    variant="outline"
                    size="icon"
                    @click="load"
                >
                    <Icon
                        name="RotateCcw"
                        :class="{ 'animate-spin': loading }"
                    />
                </Button>
            </div>
        </div>

        <DataTable 
            v-model:rows="items"
            v-model:total="total"
            v-model:loading="loading"
            :columns="columns"
        >
            <template #row-default="{ row }">
                <div class="flex items-center justify-start h-full">
                    <Switch
                        :model-value="!!row.is_default"
                        :disabled="settingDefault[row.id]"
                        @update:model-value="setDefault(row)"
                    />
                </div>
            </template>

            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">
                    <AlertButton
                        variant="ghost"
                        size="sm"
                        :fetch="`/api/drives/${row.id}`"
                        @fetched="load"
                    >
                        <Icon name="trash" />
                    </AlertButton>

                    <Button
                        variant="ghost"
                        :to="`/admin/drives/${row.id}`"
                        size="sm"
                    >
                        <Icon name="pen" />
                    </Button>
                </div>
            </template>
        </DataTable>
    </AdminLayout>
</template>
