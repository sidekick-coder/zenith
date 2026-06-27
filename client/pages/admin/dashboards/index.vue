<script setup lang="ts">
import * as v from 'valibot'
import { toast } from 'vue-sonner'
import { onMounted, ref } from 'vue'
import { useFetchPagination } from '@sidekick-coder/zenith-kit/client'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import DialogForm from '#client/components/DialogForm.vue'
import AlertButton from '#client/components/AlertButton.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import type { DashboardSchema } from '#shared/schemas/index.ts'

const { items, total, loading, load, hydrate, reset } = useFetchPagination<DashboardSchema>('/api/dashboards')

const deletingItems = ref<number[]>([])

const schema = v.object({
    name: v.pipe(v.string(), v.minLength(1, $t('Name is required'))),
    description: v.optional(v.string()),
})

const fields = {
    name: {
        component: 'text-field' as const,
        label: $t('Name'),
    },
    description: {
        component: 'text-field' as const,
        label: $t('Description'),
    },
}

const columns = defineColumns<DashboardSchema>([
    {
        id: 'id',
        label: 'ID',
        field: 'id',
        width: 80,
    },
    {
        id: 'name',
        label: $t('Name'),
        field: 'name',
    },
    {
        id: 'description',
        label: $t('Description'),
        field: 'description',
    },
    { id: 'actions' },
])

async function destroy(id: number) {
    deletingItems.value.push(id)

    const [error] = await tryCatch(() => $fetch(`/api/dashboards/${id}`, { method: 'DELETE' }))

    if (error) {
        deletingItems.value = deletingItems.value.filter(i => i !== id)
        return
    }

    setTimeout(() => {
        toast.success($t('Deleted successfully.'))
        deletingItems.value = deletingItems.value.filter(i => i !== id)
        reset()
    }, 1000)
}

onMounted(hydrate)

</script>

<template>
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-foreground">
            {{ $t('Dashboards') }}
        </h1>

        <div class="flex items-center gap-2">
            <DialogForm
                :schema="schema"
                :fields="fields"
                :title="$t('Add new dashboard')"
                :description="$t('Fill in the details below to create a new dashboard')"
                fetch="/api/dashboards"
                fetch-method="POST"
                :toast-on-success="$t('Dashboard created successfully.')"
                @submit="load"
            >
                <Button>
                    {{ $t('Add new') }}
                </Button>
            </DialogForm>

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
        v-model:rows="items"
        v-model:total="total"
        v-model:loading="loading"
        :columns="columns"
    >
        <template #row-actions="{ row }">
            <div class="flex items-center gap-2 justify-end">
                <DialogForm
                    :schema="schema"
                    :fields="fields"
                    :values="row"
                    :title="$t('Edit dashboard')"
                    :description="$t('Update the dashboard details')"
                    :fetch="`/api/dashboards/${row.id}`"
                    fetch-method="PATCH"
                    :toast-on-success="$t('Dashboard updated successfully.')"
                    @submit="load"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                    >
                        <Icon name="pencil" />
                    </Button>
                </DialogForm>

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
</template>
