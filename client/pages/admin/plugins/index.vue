<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from '#client/components/Button.vue'
import AdminLayout from '#client/layouts/AdminLayout.vue'
import { $fetch } from '#client/utils/fetcher'
import Icon from '#client/components/Icon.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'

const items = ref<any[]>([])
const loading = ref(false)
const columns = defineColumns<any>([
    {
        id: 'name',
        label: $t('Name'),
        field: 'name',
    },
    {
        id: 'directory',
        label: $t('Directory'),
        field: 'directory',
    },
    {
        id: 'version',
        label: $t('Version'),
        field: 'version',
        width: 120
    },
    { id: 'actions' }
])

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try('/api/plugins')

    if (error) {
        loading.value = false
        return
    }

    items.value = response.items

    setTimeout(() => {
        loading.value = false
    }, 500)
}

onMounted(load)
</script>
<template>
    <AdminLayout>
        <div class="mb-6 flex items-center justify-between">
            <div>
                <PageTitle>
                    {{ $t('Plugins') }}
                </PageTitle>
                <PageSubtitle>
                    {{ $t('View the plugins installed on your system.') }}
                </PageSubtitle>
            </div>
            <div class="flex gap-x-2">
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
            v-model:loading="loading"
            :rows="items"
            :columns="columns"
        >
            <template #row-name="{ row }">
                <div class="flex items-center gap-4">
                    <div class="bg-primary text-primary-foreground flex items-center justify-center size-10 rounded">
                        <Icon
                            :name="row.icon || 'Puzzle'"
                            class="size-5 inline-block"
                        />
                    </div>
                    <div>
                        <div class="font-medium">
                            {{ row.name }}
                        </div>
                        <div>
                            {{ row.description }}
                        </div>
                    </div>
                </div>
            </template>

            <template #row-actions="{ row }">
                <div class="flex justify-end gap-2">
                    <Button
                        :to="`/admin/plugins/${row.id}`"
                        variant="ghost"
                        size="icon"
                    >
                        <Icon name="Edit" />
                    </Button>
                </div>
            </template>
        </DataTable>
    </AdminLayout>
</template>
