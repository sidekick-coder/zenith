<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
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
import FormImageUploader from '#client/components/FormImageUploader.vue'
import FormColorPicker from '#client/components/FormColorPicker.vue'

const loading = ref(false)
const saving = ref(false)
const logoUploading = ref(false)
const logoUrl = ref<string | null>(null)

const defaultColors = {
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.141 0.005 285.823)',
    primary: 'oklch(0.21 0.006 285.885)',
    'primary-foreground': 'oklch(0.985 0 0)',
    secondary: 'oklch(0.967 0.001 286.375)',
    'secondary-foreground': 'oklch(0.21 0.006 285.885)',
    accent: 'oklch(0.967 0.001 286.375)',
    'accent-foreground': 'oklch(0.21 0.006 285.885)',
    muted: 'oklch(0.967 0.001 286.375)',
    'muted-foreground': 'oklch(0.552 0.016 285.938)',
    destructive: 'oklch(0.577 0.245 27.325)',
    'destructive-foreground': 'oklch(0.577 0.245 27.325)',
}

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
    
    const cssVars = { ...defaultColors }
    
    if (response.cssVars) {
        Object.keys(response.cssVars).forEach(key => {
            if (response.cssVars[key]) {
                cssVars[key as keyof typeof defaultColors] = response.cssVars[key]
            }
        })
    }
    
    resetForm({
        values: {
            ...response,
            cssVars
        }
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

    const payload = { ...data }
    
    if (payload.cssVars) {
        const filteredCssVars: Record<string, string> = {}
        
        Object.keys(payload.cssVars).forEach(key => {
            const value = payload.cssVars![key]
            const defaultValue = defaultColors[key as keyof typeof defaultColors]
            
            if (value && value !== defaultValue) {
                filteredCssVars[key] = value
            }
        })
        
        payload.cssVars = filteredCssVars
    }

    const [error] = await $fetch.try('/api/branding', {
        method: 'PUT',
        data: payload,
    })

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Updated branding settings successfully!'))

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

            <Card>
                <CardContent class="flex flex-col space-y-4">
                    <FormImageUploader
                        v-model:file-url="logoUrl"
                        v-model:loading="logoUploading"
                        name="logoFileId"
                        :label="$t('Logo')"
                        :disabled="loading || saving"
                        purpose="branding"
                        :public="true"
                    />

                    <h3 class="text-lg font-semibold">
                        {{ $t('Main Theme Colors') }}
                    </h3>

                    <FormColorPicker
                        name="cssVars.background"
                        :label="$t('Background')" 
                        :disabled="loading || saving"
                        placeholder="oklch(1 0 0)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.foreground"
                        :label="$t('Foreground')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.141 0.005 285.823)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.primary"
                        :label="$t('Primary')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.21 0.006 285.885)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.primary-foreground"
                        :label="$t('Primary Foreground')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.985 0 0)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.secondary"
                        :label="$t('Secondary')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.967 0.001 286.375)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.secondary-foreground"
                        :label="$t('Secondary Foreground')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.21 0.006 285.885)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.accent"
                        :label="$t('Accent')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.967 0.001 286.375)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.accent-foreground"
                        :label="$t('Accent Foreground')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.21 0.006 285.885)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.muted"
                        :label="$t('Muted')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.967 0.001 286.375)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.muted-foreground"
                        :label="$t('Muted Foreground')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.552 0.016 285.938)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.destructive"
                        :label="$t('Destructive')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.577 0.245 27.325)"
                    />
                    
                    <FormColorPicker
                        name="cssVars.destructive-foreground"
                        :label="$t('Destructive Foreground')"
                        :disabled="loading || saving"
                        placeholder="oklch(0.577 0.245 27.325)"
                    />
                </CardContent>
            </Card>
        </form>
    </AppLayout>
</template>