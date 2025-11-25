<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import AppLayout from '#client/layouts/AppLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import schemas from '#shared/validators/index.ts'
import Icon from '#client/components/Icon.vue'
import { $server } from '#client/utils/server.ts'
import FormTextField from '#client/components/FormTextField.vue'
import FormImageUploader from '#client/components/FormImageUploader.vue'
import ColorPicker from '#client/components/ColorPicker.vue'
import FormColorPicker from '#client/components/FormColorPicker.vue'

const loading = ref(false)
const saving = ref(false)
const logoUploading = ref(false)
const logoUrl = ref<string | null>(null)

const { handleSubmit, resetForm, values: _values, setFieldValue: _setFieldValue } = useForm({
    name: 'settings',
    validationSchema: toTypedSchema(schemas.branding.update), 
})

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<any>('/api/branding')

    if (error) {
        loading.value = false
        return
    }
    
    resetForm({
        values: response
    })

    if (response.logoFileId) {
        logoUrl.value = `/api/files/${response.logoFileId}/stream`
    }
    
    setTimeout(() => {
        loading.value = false
    }, 500)
}

const onSubmit = handleSubmit(async (data) => {
    saving.value = true

    await $server.reloadAfter({
        fn: async () => $fetch('/api/branding', {
            method: 'PUT',
            data,
        })
    })
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
                    <PageTitle>{{ $t('Branding') }}</PageTitle>
                    <PageSubtitle>
                        {{ $t('Configure your branding settings') }}
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
                        <FormImageUploader
                            v-model:file-url="logoUrl"
                            v-model:loading="logoUploading"
                            name="logoFileId"
                            :label="$t('Logo')"
                            :disabled="loading || saving"
                            purpose="branding"
                            :public="true"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="space-y-4">
                        <h3 class="text-lg font-semibold mb-4">
                            {{ $t('Main Theme Colors') }}
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <FormColorPicker
                                name="cssVars.background"
                                :label="$t('Background')" 
                                :disabled="loading || saving"
                            />
                            
                            <FormTextField
                                name="cssVars.background"
                                :label="$t('Background')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.foreground"
                                :label="$t('Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.primary"
                                :label="$t('Primary')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.primary-foreground"
                                :label="$t('Primary Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.secondary"
                                :label="$t('Secondary')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.secondary-foreground"
                                :label="$t('Secondary Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.accent"
                                :label="$t('Accent')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.accent-foreground"
                                :label="$t('Accent Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.muted"
                                :label="$t('Muted')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.muted-foreground"
                                :label="$t('Muted Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.destructive"
                                :label="$t('Destructive')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="cssVars.destructive-foreground"
                                :label="$t('Destructive Foreground')"
                                :disabled="loading || saving"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    </AppLayout>
</template>