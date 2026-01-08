<script setup lang="ts">
import { ref  } from 'vue'
import type { ComponentExposed } from 'vue-component-type-helpers'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import AppLayout from '#client/layouts/AppLayout.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import AlertButton from '#client/components/AlertButton.vue'
import Switch from '#client/components/ui/switch/Switch.vue'
import DialogForm from '#client/components/DialogForm.vue'
import MailerConfig from '#shared/entities/mailerConfig.entity.ts'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'


const loading = ref(false)
const settingDefault = ref<Record<string, boolean>>({})
const tableRef = ref<ComponentExposed<typeof DataTable>>()

const columns = defineColumns<MailerConfig>([
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

async function load(){
    await tableRef.value?.load()
}

async function setDefault(mailer: MailerConfig) {
    settingDefault.value[mailer.id] = true

    const [error] = await $fetch.try(`/api/mailers/${mailer.id}/set-default`, {
        method: 'POST'
    })

    if (error) {
        settingDefault.value[mailer.id] = false
        return
    }

    settingDefault.value[mailer.id] = false
    
    load()
}
</script>
<template>
    <AppLayout>
        <div class="flex items-center mb-4">
            <div class="flex-1">
                <PageTitle>
                    {{ $t('Mailers') }}
                </PageTitle>
                <PageSubtitle>
                    {{ $t('Manage your mailer gateways') }}
                </PageSubtitle>
            </div>
            <div class="flex items-center gap-2">
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
                            options: MailerConfig.GATEWAYS,
                            labelKey: 'label',
                            valueKey: 'id',
                        },
                    }"
                    fetch="/api/mailers"
                    @submit="load"
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
            ref="tableRef"
            v-model:loading="loading"
            :columns="columns"
            :serialize="row => new MailerConfig(row)"
            fetch="/api/mailers"
            hide-pagination
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
                        :fetch="`/api/mailers/${row.id}`"
                        @fetched="load"
                    >
                        <Icon name="trash" />
                    </AlertButton>

                    <Button
                        variant="ghost"
                        :to="`/admin/mailers/${row.id}`"
                        size="sm"
                    >
                        <Icon name="pen" />
                    </Button>
                </div>
            </template>
        </DataTable>
    </AppLayout>
</template>
