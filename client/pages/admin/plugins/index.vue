<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from '#client/components/Button.vue'
import AdminLayout from '#client/layouts/AdminLayout.vue'
import Switch from '#client/components/ui/switch/Switch.vue'
import { $fetch } from '#client/utils/fetcher'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '#client/components/ui/alert-dialog'
import Icon from '#client/components/Icon.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'

const items = ref<any[]>([])
const loading = ref(false)
const columns = defineColumns<any>([
    {
        id: 'enabled',
        label: $t('Enabled'),
        field: 'enabled',
        width: 80
    },
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

    items.value.sort((a, b) => {
        return Number(b.enabled) - Number(a.enabled)
    })

    setTimeout(() => {
        loading.value = false
    }, 500)
}

onMounted(load)

const pendingToggle = ref<any>(null)
const showToggleConfirm = ref(false)

function requestToggle(item: any) {
    pendingToggle.value = item
    showToggleConfirm.value = true
}

async function confirmToggle() {
    const item = pendingToggle.value

    showToggleConfirm.value = false
    pendingToggle.value = null

    const [error] = await $fetch.try(`/api/plugins/${item.id}/toggle`, { method: 'POST' })

    if (error) return

    const url = new URL('/api/reloader', window.location.origin)

    url.searchParams.append('redirect_to', window.location.href)
    url.searchParams.append('delay', '3000')

    window.location.href = url.toString()
}
</script>
<template>
    <AdminLayout>
        <AlertDialog
            :open="showToggleConfirm"
            @update:open="showToggleConfirm = $event"
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{{ $t('Toggle plugin') }}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {{ $t('The server will be reloaded after toggling the plugin. Are you sure?') }}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{{ $t('Cancel') }}</AlertDialogCancel>
                    <AlertDialogAction @click="confirmToggle">
                        {{ $t('Confirm') }}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

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
            <template #row-enabled="{ row }">
                <Switch
                    :model-value="row.enabled"
                    @click="requestToggle(row)"
                />
            </template>

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
