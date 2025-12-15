<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import * as v from 'valibot'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import SettingLayout from '#client/layouts/SettingLayout.vue'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import DialogForm, { defineFormFields } from '#client/components/DialogForm.vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import di from '#client/utils/di.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { createId } from '#client/utils/createId.ts'
import auth from '#client/facades/auth.facade.ts'

const menuExtras = ref<Record<string, any>[]>([])

const columns = defineColumns<Record<string, any>>([
    { 
        id: 'id',
        label: $t('ID'),
        field: 'id' 
    },
    { 
        id: 'label',
        label: $t('Label'),
        field: 'label' 
    },
    { 
        id: 'group',
        label: $t('Group'),
        field: 'group' 
    },
    { 
        id: 'to',
        label: $t('URL'),
        field: 'to' 
    },
    { 
        id: 'actions' 
    },
])

const fields = defineFormFields({
    label: {
        component: 'text-field',
        label: $t('Label'),
    },
    icon: {
        component: 'text-field',
        label: $t('Icon'),
    },
    group: {
        component: 'text-field',
        label: $t('Group'),
    },
    to: {
        component: 'text-field',
        label: $t('URL'),
    },
})

const schema = v.object({
    label: v.string(),
    icon: v.optional(v.string()),
    group: v.optional(v.string()),
    to: v.optional(v.string()),
})

async function load() {
    const state = di.get<Record<string, any>>('state') || {}
    const metas = state['user:metas'] || {}
    menuExtras.value = metas['admin-ui:menu-extras'] ? metas['admin-ui:menu-extras'] : []
}

async function persistExtras(extras: Record<string, any>[]) {
    if (!auth.user) {
        throw new Error('no user')
    }

    return $fetch(`/api/users/${auth.user.id}/metas`, {
        method: 'PUT',
        data: [
            {
                name: 'admin-ui:menu-extras',
                value: `json:${JSON.stringify(extras)}`,
            }
        ],
    })
}

async function add(data: Record<string, any>) {
    data.id = createId()
    
    const items = JSON.parse(JSON.stringify(menuExtras.value))
    
    items.push(data)
    
    const [error] = await tryCatch(() => persistExtras(items))
    
    if (error) {
        toast.error($t('Could not add'))
        return
    }

    menuExtras.value = items
    toast.success($t('Added successfully.'))
}

async function update(id: string, data: Record<string, any>) {
    const items = JSON.parse(JSON.stringify(menuExtras.value))
    const item = items.find((i: any) => i.id === id)

    if (!item) {
        toast.error($t('Menu extra not found'))
        return
    }

    Object.assign(item, data)

    const [error] = await tryCatch(() => persistExtras(items))

    if (error) {
        toast.error($t('Could not update'))
        return
    }

    menuExtras.value = items
    toast.success($t('Updated successfully.'))
}

async function remove(id: string) {
    const updated = menuExtras.value.filter(e => e.id !== id)
    const [error] = await tryCatch(() => persistExtras(updated))
    if (error) {
        toast.error($t('Could not delete'))
        return
    }
    menuExtras.value = updated
    toast.success($t('Deleted successfully.'))
}

onMounted(() => {
    load()
})
</script>

<template>
    <SettingLayout>
        <div class="mb-6 flex">
            <div class="flex-1">
                <PageTitle>{{ $t('Custom menu items') }}</PageTitle>
                <PageSubtitle>
                    {{ $t('Create and manage custom menu entries') }}
                </PageSubtitle>
            </div>
            <div class="flex items-center gap-2">
                <DialogForm
                    :fetch="add"
                    :title="$t('Add new')"
                    :description="$t('Create a custom menu entry')"
                    :schema="schema"
                    :fields="fields"
                >
                    <Button>
                        {{ $t('Add new') }}
                    </Button>
                </DialogForm>
            </div>
        </div>
        <DataTable
            v-model:rows="menuExtras"
            :columns="columns"
            item-key="id"
        >
            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">
                    <DialogForm
                        :fetch="data => update(row.id, data)"
                        method="PUT"
                        :title="$t('Edit')"
                        :description="$t('Edit custom menu entry')"
                        :schema="schema"
                        :fields="fields"
                        :values="row"
                    >
                        <Button
                            size="icon"
                            variant="ghost"
                        >
                            <Icon name="Edit" />
                        </Button>
                    </DialogForm>

                    <AlertButton
                        variant="ghost"
                        size="sm"
                        @confirm="() => remove(row.id)"
                    >
                        <Icon name="trash" />
                    </AlertButton>
                </div>
            </template>
        </DataTable>
    </SettingLayout>
</template>
