<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#client/components/ui/card'
import { Switch } from '#client/components/ui/switch'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import di from '#client/utils/di.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import auth from '#client/facades/auth.facade.ts'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import SettingLayout from '#client/layouts/SettingLayout.vue'

const loading = ref(false)
const saving = ref(false)

const menu = useMenu()
const menuItems = menu.items

const hiddenMenuGroups = ref<string[]>([])
const menuGroups = computed(() => {
    const groups = menuItems.value.map(i => i.group).filter(Boolean) as string[]

    return Array.from(new Set(groups))
})

const columns = defineColumns<any>([
    {
        id: 'visible',
        label: $t('Visible'),
        width: 100,
    },
    {
        id: 'name',
        label: $t('Group'),
        field: 'name',
    },
    {
        id: 'count',
        label: $t('Items'),
        field: 'count',
    },
])

const tableItems = computed(() => {
    return menuGroups.value.map(group => ({
        name: group,
        count: menuItems.value.filter(i => i.group === group).length,
        visible: !hiddenMenuGroups.value.includes(group),
    }))
})

async function load() {
    if (!auth.user) {
        return
    }

    const state = di.get<Record<string, any>>('state') || {}
    const metas = state['user:metas'] || {}

    loading.value = true

    hiddenMenuGroups.value = metas['admin-ui:hide-menu-groups'] ? metas['admin-ui:hide-menu-groups'] : []
    
    setTimeout(() => {
        loading.value = false
    }, 300)
}

async function save() {
    if (!auth.user) {
        return
    }

    saving.value = true

    const [error] = await $fetch.try(`/api/users/${auth.user.id}/metas`, {
        method: 'PUT',
        data: [
            {
                name: 'admin-ui:hide-menu-groups',
                value: hiddenMenuGroups.value.length ? `json:${JSON.stringify(hiddenMenuGroups.value)}` : 'json:[]',
            }
        ],
    })

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Settings saved successfully!'))

    setTimeout(() => {
        window.location.reload()
    }, 500)
}

onMounted(() => {
    load()
})

function toggleGroup(id: string) {
    const i = hiddenMenuGroups.value.indexOf(id)
    if (i === -1) {
        hiddenMenuGroups.value.push(id)
        return
    }
    hiddenMenuGroups.value.splice(i, 1)
}
</script>

<template>
    <SettingLayout>
        <div class="mb-6 flex">
            <div class="flex-1">
                <PageTitle>{{ $t('Menu groups') }}</PageTitle>
                <PageSubtitle>
                    {{ $t('Toggle visibility for menu groups') }}
                </PageSubtitle>
            </div>
            <div class="flex justify-end gap-2">
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
                <Button 
                    :loading="saving"
                    :disabled="loading"
                    @click="save"
                >
                    {{ $t('Save') }}
                </Button>
            </div>
        </div>
        
        <DataTable
            :rows="tableItems"
            :columns="columns"
            item-key="name"
        >
            <template #row-visible="{ row }">
                <div class="flex items-center justify-start">
                    <Switch
                        :model-value="!hiddenMenuGroups.includes(row.name)"
                        @update:model-value="() => toggleGroup(row.name)"
                    />
                </div>
            </template>
        </DataTable>
    </SettingLayout>
</template>
