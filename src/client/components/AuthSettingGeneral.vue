<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import FormSwitch from '#client/components/FormSwitch.vue'
import FormTextField from '#client/components/FormTextField.vue'
import schemas from '#shared/validators/index.ts'

const loading = ref(false)
const saving = ref(false)

const { handleSubmit, resetForm } = useForm({
    name: 'auth-settings-general',
    validationSchema: toTypedSchema(schemas.auth.update),
})

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<any>('/api/configs/auth')

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

    const [error] = await $fetch.try('/api/configs/auth', {
        method: 'PUT',
        data: data,
    })

    if (error) {
        saving.value = false
        return
    }

    setTimeout(() => {
        saving.value = false
        toast.success($t('Auth settings saved successfully'))
    }, 500)
})

onMounted(() => {
    load()
})
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
