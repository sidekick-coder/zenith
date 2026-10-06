<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm, toast, fetcher, config, waitForServer } from '@sidekick-coder/zenith-kit/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@sidekick-coder/zenith-kit/components'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import FormSwitch from '#client/components/FormSwitch.vue'
import FormTextField from '#client/components/FormTextField.vue'
import { authSchema } from '#shared/schemas/authSchema.ts'

const loading = ref(false)
const saving = ref(false)

const { handleSubmit, resetForm } = useForm(authSchema.update, { name: 'auth-settings-general', })

async function load() {
    loading.value = true

    const [error, response] = await fetcher.try<any>('/api/config/auth')

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

    const [error] = await fetcher.try('/api/config/auth', {
        method: 'PUT',
        data: data,
    })

    if (error) {
        saving.value = false
        return
    }

    const needReload = data.disabled !== config.get('auth.disabled')

    if (needReload) {
        waitForServer({ redirectTo: '/', })
    }

    setTimeout(() => {
        saving.value = false
        toast.success($t('Auth settings saved successfully'))
    }, 500)
})

onMounted(load)
</script>

<template>
    <form @submit="onSubmit">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('General') }}</CardTitle>
                <CardDescription>{{ $t('Basic authentication settings') }}</CardDescription>
                <CardAction>
                    <div class="flex items-center gap-2">
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
                </CardAction>
            </CardHeader>
            <CardContent class="space-y-4">
                <FormSwitch
                    name="disabled"
                    :label="$t('Disable Authentication (experimental)')"
                    :hint="$t('Allow access to the application without login, use with extreme caution')"
                    :disabled="loading || saving"
                />
                <FormSwitch
                    name="enable_registration"
                    :label="$t('Enable Sign Up')"
                    :hint="$t('Allow new users to register accounts')"
                    :disabled="loading || saving"
                />

                <FormSwitch
                    name="enable_email_verification"
                    :label="$t('Enable Email Verification')"
                    :hint="$t('Require users to verify their email addresses during registration')"
                    :disabled="loading || saving"
                />

                <FormTextField
                    name="redirect_to_on_login"
                    :label="$t('Redirect To On Login')"
                    :hint="$t('URL to redirect users to after successful login')"
                    placeholder="/"
                    :disabled="loading || saving"
                />
            </CardContent>
        </Card>
    </form>
</template>
