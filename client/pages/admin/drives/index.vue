<script setup lang="ts">
import { ref  } from 'vue'
import type { ComponentExposed } from 'vue-component-type-helpers'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import type { Drive } from '#client/types.ts'

const items = ref<Drive[]>([])
const loading = ref(false)

const tableRef = ref<ComponentExposed<typeof DataTable<Drive>>>()

const columns = defineColumns<Drive>([
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
        field: 'description',
    },
    { id: 'actions' }
])

async function load(){
    await tableRef.value?.load()
}

function reset() {
    return tableRef.value?.reset()
}
</script>
<template>
    <AppLayout>
        <div class="flex">
            <h1 class="text-2xl font-bold mb-4 text-foreground flex-1">
                {{ $t('Drives') }}
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
            </div>
        </div>

        <DataTable 
            ref="tableRef"
            v-model:rows="items"
            v-model:loading="loading"
            :columns="columns"
            fetch="/api/drives"
        >
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
