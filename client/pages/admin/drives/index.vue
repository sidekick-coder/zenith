<script setup lang="ts">
import { ref  } from 'vue'
import type { ComponentExposed } from 'vue-component-type-helpers'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import type { Drive } from '#client/types.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { toast } from 'vue-sonner'
import AlertButton from '#client/components/AlertButton.vue'
import Switch from '#client/components/ui/switch/Switch.vue'

const items = ref<Drive[]>([])
const loading = ref(false)
const generating = ref(false)

const tableRef = ref<ComponentExposed<typeof DataTable<Drive>>>()

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
    {
        id: 'description',
        label: $t('Description'),
        field: 'description',
    },
    { id: 'actions' }
])

async function load(){
    await tableRef.value?.load()
}

async function generateDefaults(){
    generating.value = true

    const [error] = await $fetch.try('/api/drives/generate-defaults', {
        method: 'POST'
    })

    if (error) {
        generating.value = false
        return
    }

    setTimeout(() => {
        generating.value = false
        toast.success($t('Default drives created'))    
        load()
    }, 1000)

}
</script>
<template>
    <AppLayout>
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
            </div>
        </div>

        <DataTable 
            ref="tableRef"
            v-model:rows="items"
            v-model:loading="loading"
            :columns="columns"
            fetch="/api/drives"
        >

            <template #row-default="{ row }">
                <div class="flex items-center justify-start h-full">
                    <Switch
                        :model-value="!!row.default"
                    />
                </div>
            </template>

            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">
                    <Button
                        variant="ghost"
                        :to="`/admin/drives/${row.id}/explorer`"
                        size="sm"
                    >
                        <Icon name="folder" />
                    </Button>
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
    </AppLayout>
</template>
