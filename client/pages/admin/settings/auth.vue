<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import SettingLayout from '#client/layouts/SettingLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import schemas from '#shared/validators/index.ts'
import Icon from '#client/components/Icon.vue'
import Image from '#client/components/Image.vue'
import FormTextField from '#client/components/FormTextField.vue'
import FormTextarea from '#client/components/FormTextarea.vue'
import FormSwitch from '#client/components/FormSwitch.vue'
import FormImageUploader from '#client/components/FormImageUploader.vue'

const loading = ref(false)
const saving = ref(false)

const { handleSubmit, values, resetForm } = useForm({
    name: 'auth-settings',
    validationSchema: toTypedSchema(schemas.auth.update), 
})

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<any>('/api/auth-settings')

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

    const [error] = await $fetch.try('/api/auth-settings', {
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
    <SettingLayout>
        <form @submit="onSubmit">
            <div class="mb-6 flex">
                <div class="flex-1">
                    <PageTitle>{{ $t('Authentication Settings') }}</PageTitle>
                    <PageSubtitle>
                        {{ $t('Configure your authentication and login page settings') }}
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
                            {{ $t('Login Page Content') }}
                        </CardTitle>
                        <CardDescription>
                            {{ $t('Customize the content displayed on the login page') }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <FormImageUploader
                            name="image_id"
                            :label="$t('Image')"
                            purpose="AuthLayoutImage"
                            :file-url="values.image_id ? `/api/files/${values.image_id}/stream` : undefined"
                            :public="true"
                            :disabled="loading || saving"
                        >
                            <!-- <template #default="{ value, handle, setValue }">
                                <div 
                                    v-if="value" 
                                    class="border rounded-lg p-4 bg-muted/50"
                                >
                                    <Image
                                        :src="`/api/files/${value}/stream`"
                                        class="max-h-48 max-w-full object-cover mx-auto rounded-lg"
                                        :alt="$t('Background image preview')"
                                    />

                                    <div class="mt-2">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            @click="setValue(undefined)"
                                        >
                                            {{ $t('Remove') }}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            class="ml-2"
                                            :loading="false"
                                            @click="handle"
                                        >
                                            {{ $t('Change') }}
                                        </Button>
                                    </div>
                                </div>
                                <div 
                                    v-else 
                                    class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center"
                                >
                                    <Icon 
                                        name="ImagePlus" 
                                        class="size-12 mx-auto mb-3 text-muted-foreground" 
                                    />
                                    <p class="text-sm text-muted-foreground">
                                        {{ $t('No background image uploaded') }}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        class="mt-2"
                                        :loading="false"
                                        @click="handle"
                                    >
                                        {{ $t('Upload') }}
                                    </Button>
                                </div>
                            </template> -->
                        </FormImageUploader>

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
                            name="quoteAuthor"
                            :label="$t('Quote Author')"
                            :disabled="loading || saving"
                            placeholder="Sidekick Coder Team"
                        />
                        <FormSwitch
                            name="enableSignUp"
                            :label="$t('Enable Sign Up')"
                            :hint="$t('Allow new users to register accounts')"
                            :disabled="loading || saving"
                        />
                    </CardContent>
                </Card>
            </div>
        </form>
    </SettingLayout>
</template>
