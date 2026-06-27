<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import FormTextField from '#client/components/FormTextField.vue'
import FormTextarea from '#client/components/FormTextarea.vue'
import FormImageUploader from '#client/components/FormImageUploader.vue'
import schemas from '#shared/validators/index.ts'

const loading = ref(false)
const saving = ref(false)

const { handleSubmit, values, resetForm } = useForm({
    name: 'auth-settings-design',
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
        data,
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
                <CardTitle>{{ $t('Login Page Content') }}</CardTitle>
                <CardDescription>{{ $t('Customize the content displayed on the login page') }}</CardDescription>
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
                <FormImageUploader
                    name="image_id"
                    :label="$t('Image')"
                    purpose="AuthLayoutImage"
                    :file-url="values.image_id ? `/api/files/${values.image_id}/stream` : undefined"
                    :public="true"
                    :disabled="loading || saving"
                />

                <FormTextField
                    name="title"
                    :label="$t('Title')"
                    :disabled="loading || saving"
                    placeholder="Welcome Back"
                />

                <FormTextarea
                    name="quote"
                    :label="$t('Quote Message')"
                    :disabled="loading || saving"
                    placeholder="Build, test, and deploy your applications with ease."
                />

                <FormTextField
                    name="quote_author"
                    :label="$t('Quote Author')"
                    :disabled="loading || saving"
                    placeholder="Zenith Team"
                />
            </CardContent>
        </Card>
    </form>
</template>
