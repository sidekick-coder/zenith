<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Button from '#client/components/Button.vue'
import AppLayout from '#client/layouts/AppLayout.vue'

import Card from '#client/components/ui/card/Card.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'
import Switch from '#client/components/ui/switch/Switch.vue'

import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher'
import { tryCatch } from '#shared/utils/tryCatch.ts'
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
    const [error, response] = await $fetch.try('/api/modules')

    if (error) {
        return
    }

    items.value = response 

    // sort by enabled 
    items.value.sort((a, b) => {
        return Number(b.enabled) - Number(a.enabled)
    })
}

onMounted(load)

const toggling = ref(false)

async function toggle(item: any) {
    toggling.value = true

    await $server.reloadAfter({
        fn: async () => $fetch(`/api/modules/${item.id}/toggle`, { method: 'POST', })
    })
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
    <AppLayout>
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
            <div>
                <Button
                    :to="'/admin/modules/install'"
                    class="mt-4"
                >
                    {{ $t('Add new') }}
                </Button>
            </div>
        </div>

        <DataTable
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
                    <Button :to="`/admin/modules/${row.id}`">
                        {{ $t('Configure') }}
                    </Button>
                    <DialogForm
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
    </AppLayout>
</template>
