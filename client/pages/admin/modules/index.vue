<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from '#client/components/Button.vue'
import AdminLayout from '#client/layouts/AdminLayout.vue'

import Switch from '#client/components/ui/switch/Switch.vue'


import { $fetch } from '#client/utils/fetcher'
import Dialog from '#client/components/ui/dialog/Dialog.vue'
import DialogContent from '#client/components/ui/dialog/DialogContent.vue'
import DialogHeader from '#client/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '#client/components/ui/dialog/DialogTitle.vue'
import DialogDescription from '#client/components/ui/dialog/DialogDescription.vue'
import Icon from '#client/components/Icon.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import DialogForm from '#client/components/DialogForm.vue'
import schemas from '#shared/validators/index.ts'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $server } from '#client/utils/server.ts'

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
    { id: 'actions' }
])

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try('/api/modules')

    if (error) {
        loading.value = false
        return
    }

    items.value = response

    // sort by enabled 
    items.value.sort((a, b) => {
        return Number(b.enabled) - Number(a.enabled)
    })

    setTimeout(() => {
        loading.value = false
    }, 500)
}

onMounted(load)

const toggling = ref(false)

async function toggle(item: any) {
    toggling.value = true

    await $fetch.try(`/api/modules/${item.id}/toggle`, { method: 'POST', })

    await new Promise(resolve => setTimeout(resolve, 5000))

    // await server restart
    await $server.online({
        timeout: 60000,
    })

    await new Promise(resolve => setTimeout(resolve, 5000))

    setTimeout(() => {
        window.location.reload()
    }, 800)
}

async function uninstall(id: string, data: any) {
    await $server.reloadAfter({
        fn: async () => $fetch(`/api/modules/${id}/uninstall`, { 
            method: 'POST',
            data
        })
    })
}
</script>
<template>
    <AdminLayout>
        <Dialog :open="toggling">
            <DialogContent
                class="sm:max-w-[425px]"
                hide-close
            >
                <DialogHeader>
                    <DialogTitle>{{ $t('Updating module status') }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('Please wait while the module status is being updated.') }}
                    </DialogDescription>
                </DialogHeader>
                <div class="flex items-center justify-center">
                    <Icon
                        name="LoaderCircle"
                        class="size-10 animate-spin text-gray-500"
                    />
                </div>
            </DialogContent>
        </Dialog>

        <div class="mb-6 flex items-center justify-between">
            <div>
                <PageTitle>
                    {{ $t('Modules') }}
                </PageTitle>
                <PageSubtitle>
                    {{ $t('Manage the modules installed on your system.') }}
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

                <Button
                    :to="'/admin/modules/install'"
                >
                    {{ $t('Add new') }}
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
                    @click="toggle(row)"
                />
            </template>
            
            <template #row-name="{ row }">
                <div class="flex items-center gap-4">
                    <div class="bg-primary text-primary-foreground flex items-center justify-center size-10 rounded">
                        <Icon
                            :name="row.icon || 'Box'"
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
                        :to="`/admin/modules/${row.id}`"
                        variant="ghost"
                        size="icon"
                    >
                        <Icon name="Eye" />
                    </Button>
                    <DialogForm
                        v-if="!row.enabled"
                        :title="$t('Uninstall Module')"
                        :description="$t('Are you sure you want to uninstall the module {module}? This action cannot be undone.', { module: row.name })"
                        :submit-text="$t('Uninstall')"
                        :fetch="data => uninstall(row.id, data)"
                        :schema="schemas.modules.uninstall"
                        :fields="{
                            rollback: {
                                component: 'switch',
                                label: $t('Rollback migrations'),
                                hint: $t('If enabled, any database migrations applied by this module will be rolled back.'),
                            }
                        }"
                        @submit="load"
                    >
                        <Button
                            variant="destructive"
                        >
                            {{ $t('Uninstall') }}
                        </Button>
                    </DialogForm>
                </div>
            </template>
        </DataTable>
    </AdminLayout>
</template>
