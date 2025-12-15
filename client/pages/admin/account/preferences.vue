<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import * as v from 'valibot'

import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import SettingLayout from '#client/layouts/SettingLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import Icon from '#client/components/Icon.vue'
import FormSwitch from '#client/components/FormSwitch.vue'
import di from '#client/utils/di.ts'
import { useMenu } from '#client/composables/useMenu.ts'
import CustomMenuItems from '#client/components/CustomMenuItems.vue'
import auth from '#client/facades/auth.facade.ts'

const loading = ref(false)
const saving = ref(false)

const menu = useMenu()
const menuItems = menu.items

const hiddenMenus = ref<string[]>([])
const hiddenMenuGroups = ref<string[]>([])
const menuGroups = computed(() => {
    const groups = menuItems.value.map(i => i.group).filter(Boolean) as string[]

    return Array.from(new Set(groups))
})

// custom menu component manages its own extras

const schema = toTypedSchema(v.object({
    darkMode: v.optional(v.boolean()),
    hideMenus: v.optional(v.string()),
    hideMenuGroups: v.optional(v.string()),
}))

const { handleSubmit, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
        darkMode: false,
        hideMenus: '',
        hideMenuGroups: '',
    },
})

async function load() {
    if (!auth.user) {
        return
    }

    const state = di.get<Record<string, any>>('state') || {}
    const metas = state['user:metas'] || {}

    loading.value = true

    resetForm({
        values: {
            darkMode: metas['admin-ui:dark_mode'],
            hideMenus: metas['admin-ui:hide-menus'] ? metas['admin-ui:hide-menus'].join(',') : '',
            hideMenuGroups: metas['admin-ui:hide-menu-groups'] ? metas['admin-ui:hide-menu-groups'].join(',') : '',
        }
    })

    hiddenMenus.value = metas['admin-ui:hide-menus'] ? metas['admin-ui:hide-menus'] : []
    hiddenMenuGroups.value = metas['admin-ui:hide-menu-groups'] ? metas['admin-ui:hide-menu-groups'] : []
    
    setTimeout(() => {
        loading.value = false
    }, 300)
}

// custom menu persistence is handled in the component

const onSubmit = handleSubmit(async (data) => {
    if (!auth.user) {
        return
    }

    saving.value = true

    const [error] = await $fetch.try(`/api/users/${auth.user.id}/metas`, {
        method: 'PUT',
        data: [
            {
                name: 'admin-ui:dark_mode',
                value: data.darkMode ? 'bool:true' : 'bool:false',
            },
            {
                name: 'admin-ui:hide-menus',
                value: hiddenMenus.value.length ? `json:${JSON.stringify(hiddenMenus.value)}` : 'json:[]',
            },
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

    toast.success($t('Preferences saved successfully!'))

    setTimeout(() => {
        window.location.reload()
    }, 500)
    
})

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
        <form @submit="onSubmit">
            <div class="mb-6 flex">
                <div class="flex-1">
                    <PageTitle>{{ $t('Preferences') }}</PageTitle>
                    <PageSubtitle>
                        {{ $t('Manage your personal preferences') }}
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
                        type="submit"
                        :loading="saving"
                        :disabled="loading"
                    >
                        {{ $t('Save') }}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{{ $t('Appearance') }}</CardTitle>
                    <CardDescription>{{ $t('Customize how the application looks') }}</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <FormSwitch
                        name="darkMode"
                        :label="$t('Dark mode')"
                        :hint="$t('Enable dark theme for the application')"
                        :disabled="loading || saving"
                    />
                </CardContent>
            </Card>
            <div class="flex [&>div]:px-2 flex-wrap md:flex-nowrap gap- -mx-2">
                <div class="w-full md:w-6/12">
                    <Card class="mt-4 ">
                        <CardHeader>
                            <CardTitle>{{ $t('Menus') }}</CardTitle>
                            <CardDescription>{{ $t('Toggle visibility for individual menus') }}</CardDescription>
                        </CardHeader>
                        <CardContent class="h-[500px] overflow-y-auto">
                            <div class="space-y-2">
                                <div
                                    v-if="!menuItems.length"
                                    class="text-sm text-muted-foreground"
                                >
                                    {{ $t('No menus available') }}
                                </div>
                                <div
                                    v-for="item in menuItems"
                                    :key="item.id"
                                    class="flex items-center justify-between py-2 border-b"
                                >
                                    <div class="flex flex-col gap-y-3">
                                        <div class="text-xs text-muted-foreground">
                                            {{ item.id }}
                                        </div>
                                        <div class="font-medium text-sm">
                                            {{ item.label }}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        :variant="hiddenMenus.includes(item.id) ? 'destructive' : 'outline'"
                                        @click.prevent="toggleMenu(item.id)"
                                    >
                                        <span v-if="hiddenMenus.includes(item.id)">{{ $t('Show') }}</span>
                                        <span v-else>{{ $t('Hide') }}</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div class="w-full md:w-6/12">
                    <Card class="mt-4">
                        <CardHeader>
                            <CardTitle>{{ $t('Menu groups') }}</CardTitle>
                            <CardDescription>{{ $t('Toggle visibility for menu groups') }}</CardDescription>
                        </CardHeader>
                        <CardContent class="h-[500px] overflow-y-auto">
                            <div class="space-y-2">
                                <div
                                    v-if="!menuGroups.length"
                                    class="text-sm text-muted-foreground"
                                >
                                    {{ $t('No menu groups available') }}
                                </div>
                                <div
                                    v-for="group in menuGroups"
                                    :key="group"
                                    class="flex items-center justify-between py-2 border-b"
                                >
                                    <div class="flex items-center gap-3">
                                        <div class="font-medium">
                                            {{ group }}
                                        </div>
                                        <div class="text-xs text-muted-foreground">
                                            {{ menuItems.filter(i => i.group === group).length }} {{ $t('items') }}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        :variant="hiddenMenuGroups.includes(group) ? 'destructive' : 'outline'"
                                        @click.prevent="toggleGroup(group)"
                                    >
                                        <span v-if="hiddenMenuGroups.includes(group)">{{ $t('Show') }}</span>
                                        <span v-else>{{ $t('Hide') }}</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <CustomMenuItems />
        </form>
    </SettingLayout>
</template>
