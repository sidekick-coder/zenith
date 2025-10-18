<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { Card, CardContent } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import AppLayout from '#client/layouts/AppLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import schemas from '#shared/validators/index.ts'
import Icon from '#client/components/Icon.vue'
import Image from '#client/components/Image.vue'
import { $server } from '#client/utils/server.ts'
import { $file } from '#client/utils/file.ts'
import FormTextField from '#client/components/FormTextField.vue'

const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)

const { handleSubmit, resetForm, values, setFieldValue } = useForm({
    name: 'settings',
    validationSchema: toTypedSchema(schemas.branding.update), 
})

const logoImageUrl = computed(() => {
    if (values.logoFileId) {
        return `/api/files/${values.logoFileId}/stream`
    }
    return null
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

async function uploadLogo() {
    const file = await $file.pick({
        multiple: false
    })
    
    if (!file) {
        return
    }

    uploading.value = true

    const form = new FormData()
    form.append('file', file)

    const [error, response] = await tryCatch(() => $fetch('/api/files/upload', {
        method: 'POST',
        body: form,
        query: {
            public: true,
        },
    }))

    if (error) {
        uploading.value = false
        return
    }

    await $fetch.try('/api/branding', {
        method: 'PUT',
        data: {
            ...values,
            logoFileId: String(response.id),
        },
    })
    
    
    setTimeout(() => {
        setFieldValue('logoFileId', response.id)
        toast.success($t('Logo uploaded successfully.'))
        uploading.value = false
    }, 500)
}

async function removeLogo() {
    setFieldValue('logoFileId', '')
    toast.success($t('Logo removed successfully.'))
}

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
                        <div class="space-y-3">
                            <h3 class="text-sm font-medium">
                                {{ $t('Logo') }}
                            </h3>
                            
                            <div 
                                v-if="logoImageUrl" 
                                class="space-y-3"
                            >
                                <div class="border rounded-lg p-4 bg-muted/50">
                                    <Image
                                        :src="logoImageUrl"
                                        class="max-h-32 max-w-full object-contain mx-auto"
                                        :alt="$t('Logo preview')"
                                    />
                                </div>
                                <div class="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        :loading="uploading"
                                        :disabled="loading || saving"
                                        @click="uploadLogo"
                                    >
                                        <Icon 
                                            name="Upload" 
                                            class="size-4 mr-2" 
                                        />
                                        {{ $t('Replace') }}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        :disabled="loading || saving || uploading"
                                        @click="removeLogo"
                                    >
                                        <Icon 
                                            name="Trash2" 
                                            class="size-4 mr-2" 
                                        />
                                        {{ $t('Remove') }}
                                    </Button>
                                </div>
                            </div>
                            
                            <div 
                                v-else 
                                class="space-y-3"
                            >
                                <div class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                    <Icon 
                                        name="ImagePlus" 
                                        class="size-12 mx-auto mb-3 text-muted-foreground" 
                                    />
                                    <p class="text-sm text-muted-foreground mb-4">
                                        {{ $t('No logo uploaded') }}
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        :loading="uploading"
                                        :disabled="loading || saving"
                                        @click="uploadLogo"
                                    >
                                        <Icon 
                                            name="Upload" 
                                            class="size-4 mr-2" 
                                        />
                                        {{ $t('Upload Logo') }}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="space-y-4">
                        <h3 class="text-lg font-semibold mb-4">
                            {{ $t('Main Theme Colors') }}
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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