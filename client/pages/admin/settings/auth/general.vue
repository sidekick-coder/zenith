<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'

import { Card, CardContent } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import SettingLayout from '#client/layouts/SettingLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import schemas from '#shared/validators/index.ts'
import Icon from '#client/components/Icon.vue'
import FormSwitch from '#client/components/FormSwitch.vue'
import FormTextField from '#client/components/FormTextField.vue'

const loading = ref(false)
const saving = ref(false)

const { handleSubmit, resetForm } = useForm({
    name: 'auth-settings',
    validationSchema: toTypedSchema(schemas.auth.update), 
})

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<any>('/api/configs/auth')

    if (error) {
        loading.value = false
        return
    }
    
    resetForm({
        values: response
    })
    
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
    <SettingLayout>
        <form @submit="onSubmit">
            <div class="mb-6 flex">
                <div class="flex-1">
                    <PageTitle>{{ $t('Authentication Settings') }}</PageTitle>
                    <PageSubtitle>
                        {{ $t('Configure your authentication') }}
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
            </div>
        </form>
    </SettingLayout>
</template>
