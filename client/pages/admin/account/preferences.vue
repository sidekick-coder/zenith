<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import * as v from 'valibot'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { $auth } from '#client/composables/useAuth.ts'
import FormTextarea from '#client/components/FormTextarea.vue'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import AppLayout from '#client/layouts/AppLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import Icon from '#client/components/Icon.vue'
import FormSwitch from '#client/components/FormSwitch.vue'
import di from '#client/utils/di.ts'

const loading = ref(false)
const saving = ref(false)

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
    if (!$auth.user) {
        return
    }

    const metas = di.get<Record<string, any>>('user:metas')

    console.log('metas', metas)

    loading.value = true

    resetForm({
        values: {
            darkMode: metas['admin-ui:dark_mode'],
            hideMenus: metas['admin-ui:hide-menus'] ? metas['admin-ui:hide-menus'].join(',') : '',
            hideMenuGroups: metas['admin-ui:hide-menu-groups'] ? metas['admin-ui:hide-menu-groups'].join(',') : '',
        }
    })
    
    setTimeout(() => {
        loading.value = false
    }, 300)
}

const onSubmit = handleSubmit(async (data) => {
    if (!$auth.user) {
        return
    }

    saving.value = true

    const [error] = await $fetch.try(`/api/users/${$auth.user.id}/metas`, {
        method: 'PUT',
        data: [
            {
                name: 'admin-ui:dark_mode',
                value: data.darkMode ? 'bool:true' : 'bool:false',
            },
            {
                name: 'admin-ui:hide-menus',
                value: data.hideMenus ? `json:${JSON.stringify(data.hideMenus.split(',').map(s => s.trim()))}` : 'json:[]',
            },
            {
                name: 'admin-ui:hide-menu-groups',
                value: data.hideMenuGroups ? `json:${JSON.stringify(data.hideMenuGroups.split(',').map(s => s.trim()))}` : 'json:[]',
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
</script>

<template>
    <AppLayout>
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
                    
                    <FormTextarea
                        name="hideMenus"
                        :label="$t('Hidden menu ids')"
                        :hint="$t('Comma-separated list of menu IDs you want to hide from your admin UI')"
                        :rows="3"
                    />

                    <FormTextarea
                        name="hideMenuGroups"
                        :label="$t('Hidden menu group ids')"
                        :hint="$t('Comma-separated list of menu group IDs you want to hide from your admin UI')"
                        :rows="3"
                    />
                </CardContent>
            </Card>
        </form>
    </AppLayout>
</template>
