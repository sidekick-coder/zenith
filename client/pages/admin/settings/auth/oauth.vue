<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import AdminLayout from '#client/layouts/AdminLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import schemas from '#shared/validators/index.ts'
import Icon from '#client/components/Icon.vue'
import FormTextField from '#client/components/FormTextField.vue'
import FormSwitch from '#client/components/FormSwitch.vue'

const loading = ref(false)
const saving = ref(false)

const { handleSubmit, resetForm } = useForm({
    name: 'oauth-settings',
    validationSchema: toTypedSchema(schemas.oauth.update), 
})

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<any>('/api/configs/oauth')

    if (error) {
        loading.value = false
        return
    }
    
    resetForm({ values: response })
    
    setTimeout(() => {
        loading.value = false
    }, 500)
}

const onSubmit = handleSubmit(async (data) => {
    saving.value = true

    const [error] = await $fetch.try('/api/configs/oauth', {
        method: 'PATCH',
        data,
    })

    if (error) {
        saving.value = false
        return
    }

    setTimeout(() => {
        saving.value = false
        toast.success($t('OAuth settings saved successfully'))
    }, 500)
})

onMounted(() => {
    load()
})
</script>

<template>
    <AdminLayout>
        <form @submit="onSubmit">
            <div class="mb-6 flex">
                <div class="flex-1">
                    <PageTitle>{{ $t('OAuth Settings') }}</PageTitle>
                    <PageSubtitle>
                        {{ $t('Configure OAuth providers for authentication') }}
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

            <div class="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {{ $t('Google OAuth') }}
                        </CardTitle>
                        <CardDescription>
                            {{ $t('Configure Google OAuth authentication provider') }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <FormSwitch
                            name="google_enabled"
                            :label="$t('Enable Google OAuth')"
                            :hint="$t('Allow users to sign in with their Google accounts')"
                            :disabled="loading || saving"
                        />

                        <FormTextField
                            name="google_client_id"
                            :label="$t('Client ID')"
                            :disabled="loading || saving"
                            placeholder="your-google-client-id.apps.googleusercontent.com"
                        />

                        <FormTextField
                            name="google_client_secret"
                            :label="$t('Client Secret')"
                            :disabled="loading || saving"
                            type="password"
                            placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxx"
                        />
                    </CardContent>
                </Card>
            </div>
        </form>
    </AdminLayout>
</template>
