<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import * as v from 'valibot'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { $auth } from '#client/composables/useAuth.ts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import AppLayout from '#client/layouts/AppLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import Icon from '#client/components/Icon.vue'
import FormSwitch from '#client/components/FormSwitch.vue'

const loading = ref(false)
const saving = ref(false)

const schema = toTypedSchema(v.object({
    darkMode: v.boolean(),
}))

const { handleSubmit, resetForm, setFieldValue } = useForm({
    validationSchema: schema,
    initialValues: {
        darkMode: false,
    },
})

async function load() {
    if (!$auth.user) {
        return
    }

    loading.value = true

    const [error, response] = await $fetch.try<{ items: any[] }>(`/api/users/${$auth.user.id}/metas`)

    if (error) {
        loading.value = false
        return
    }

    console.log(response)

    const darkModeMeta = response.items.find((m: any) => m.name === 'admin:ui:dark_mode')
    
    resetForm({
        values: {
            darkMode: darkModeMeta?.value === 'bool:true',
        }
    })
    
    loading.value = false
}

const onSubmit = handleSubmit(async (data) => {
    if (!$auth.user) {
        return
    }

    saving.value = true

    const [error] = await $fetch.try(`/api/users/${$auth.user.id}/metas`, {
        method: 'PUT',
        data: {
            name: 'admin:ui:dark_mode',
            value: data.darkMode ? 'bool:true' : 'bool:false',
        },
    })

    if (error) {
        saving.value = false
        toast.error($t('Failed to save preferences.'))
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
                </CardContent>
            </Card>
        </form>
    </AppLayout>
</template>
