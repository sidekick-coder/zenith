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

const hiddenMenus = ref<string[]>([])

const columns = defineColumns<any>([
    {
        id: 'visible',
        label: $t('Visible'),
        width: 100,
    },
    {
        id: 'id',
        label: $t('ID'),
        field: 'id',
    },
    {
        id: 'label',
        label: $t('Label'),
        field: 'label',
    },
    {
        id: 'group',
        label: $t('Group'),
        field: 'group',
    },
])

const tableItems = computed(() => {
    return menuItems.value.map(item => ({
        ...item,
        visible: !hiddenMenus.value.includes(item.id),
    }))
})

async function load() {
    if (!auth.user) {
        return
    }

    const state = di.get<Record<string, any>>('state') || {}
    const metas = state['user:metas'] || {}

    loading.value = true

    hiddenMenus.value = metas['admin-ui:hide-menus'] ? metas['admin-ui:hide-menus'] : []
    
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
                name: 'admin-ui:hide-menus',
                value: hiddenMenus.value.length ? `json:${JSON.stringify(hiddenMenus.value)}` : 'json:[]',
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

function toggleMenu(id: string) {
    const i = hiddenMenus.value.indexOf(id)
    if (i === -1) {
        hiddenMenus.value.push(id)
        return
    }
    hiddenMenus.value.splice(i, 1)
}
</script>

<template>
    <SettingLayout>
        <div class="mb-6 flex">
            <div class="flex-1">
                <PageTitle>{{ $t('Menu items') }}</PageTitle>
                <PageSubtitle>
                    {{ $t('Toggle visibility for individual menu items') }}
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
            item-key="id"
        >
            <template #row-visible="{ row }">
                <div class="flex items-center justify-start">
                    <Switch
                        :model-value="!hiddenMenus.includes(row.id)"
                        @update:model-value="() => toggleMenu(row.id)"
                    />
                </div>
            </template>
        </DataTable>
    </SettingLayout>
</template>
