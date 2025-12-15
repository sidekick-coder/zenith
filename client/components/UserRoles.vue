<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'

import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import type Role from '#shared/entities/role.entity.ts'


const props = defineProps({
    userId: {
        type: String,
        required: true,
    },
})

const tableRef = ref<ComponentExposed<typeof DataTable>>()
const url = computed(() => `/api/users/${props.userId}/roles`)

const items = ref<Role[]>([])
const loading = ref(false)

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
    tableRef.value?.load()
}

</script>
<template>
    <Card>
        <CardHeader class="flex items-center justify-between">
            <div>
                <CardTitle>{{ $t('Roles') }}</CardTitle>
                <CardDescription>
                    {{ $t('Roles attachable to users') }}
                </CardDescription>
            </div>
            <div class="flex items-center gap-2">
                <Button
                    variant="outline"
                    :disabled="loading"
                    @click="load"
                >
                    {{ $t('Reload') }}
                </Button>
            </div>
        </CardHeader>

        <CardContent>
            <DataTable 
                ref="tableRef"
                v-model:rows="items"
                v-model:loading="loading"
                :columns="columns"
                :fetch="url"
            >
                <template #row-actions="{ row }">
                    <div class="flex items-center gap-2 justify-end">
                        <Button
                            variant="ghost"
                            :to="`/admin/roles/${row.id}`"
                            size="sm"
                        >
                            <Icon name="eye" />
                        </Button>
                    </div>
                </template>
            </DataTable>
        </CardContent>
    </Card>
</template>
