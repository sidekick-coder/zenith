<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent, CardHeader, CardTitle } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import SettingLayout from '#client/layouts/SettingLayout.vue'
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

const defaultLightColors = {
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

const defaultDarkColors = {
    background: 'oklch(0.141 0.005 285.823)',
    foreground: 'oklch(0.985 0 0)',
    primary: 'oklch(0.985 0 0)',
    'primary-foreground': 'oklch(0.21 0.006 285.885)',
    secondary: 'oklch(0.197 0.011 285.884)',
    'secondary-foreground': 'oklch(0.985 0 0)',
    accent: 'oklch(0.197 0.011 285.884)',
    'accent-foreground': 'oklch(0.985 0 0)',
    muted: 'oklch(0.197 0.011 285.884)',
    'muted-foreground': 'oklch(0.651 0.013 285.883)',
    destructive: 'oklch(0.701 0.201 28.013)',
    'destructive-foreground': 'oklch(0.985 0 0)',
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
    
    const lightTheme = { ...defaultLightColors }
    const darkTheme = { ...defaultDarkColors }
    
    if (response.theme?.light) {
        Object.keys(response.theme.light).forEach(key => {
            if (response.theme.light[key]) {
                lightTheme[key as keyof typeof defaultLightColors] = response.theme.light[key]
            }
        })
    }
    
    if (response.theme?.dark) {
        Object.keys(response.theme.dark).forEach(key => {
            if (response.theme.dark[key]) {
                darkTheme[key as keyof typeof defaultDarkColors] = response.theme.dark[key]
            }
        })
    }
    
    resetForm({
        values: {
            ...response,
            theme: {
                light: lightTheme,
                dark: darkTheme,
            }
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
    
    if (payload.theme) {
        const filteredLight: Record<string, string> = {}
        const filteredDark: Record<string, string> = {}
        
        if (payload.theme.light) {
            Object.keys(payload.theme.light).forEach(key => {
                const value = payload.theme!.light![key]
                const defaultValue = defaultLightColors[key as keyof typeof defaultLightColors]
                
                if (value && value !== defaultValue) {
                    filteredLight[key] = value
                }
            })
        }
        
        if (payload.theme.dark) {
            Object.keys(payload.theme.dark).forEach(key => {
                const value = payload.theme!.dark![key]
                const defaultValue = defaultDarkColors[key as keyof typeof defaultDarkColors]
                
                if (value && value !== defaultValue) {
                    filteredDark[key] = value
                }
            })
        }
        
        payload.theme = {
            light: filteredLight,
            dark: filteredDark,
        }
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
    <SettingLayout>
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

                    <div class="flex flex-wrap [&>div]:p-2 -mx-4">
                        <div class="w-full md:w-6/12">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {{ $t('Light Theme Colors') }}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent class="flex flex-col space-y-4">
                                    <FormColorPicker
                                        name="theme.light.background"
                                        :label="$t('Background')" 
                                        :disabled="loading || saving"
                                        placeholder="oklch(1 0 0)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.foreground"
                                        :label="$t('Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.141 0.005 285.823)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.primary"
                                        :label="$t('Primary')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.21 0.006 285.885)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.primary-foreground"
                                        :label="$t('Primary Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.985 0 0)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.secondary"
                                        :label="$t('Secondary')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.967 0.001 286.375)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.secondary-foreground"
                                        :label="$t('Secondary Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.21 0.006 285.885)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.accent"
                                        :label="$t('Accent')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.967 0.001 286.375)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.accent-foreground"
                                        :label="$t('Accent Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.21 0.006 285.885)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.muted"
                                        :label="$t('Muted')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.967 0.001 286.375)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.muted-foreground"
                                        :label="$t('Muted Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.552 0.016 285.938)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.destructive"
                                        :label="$t('Destructive')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.577 0.245 27.325)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.light.destructive-foreground"
                                        :label="$t('Destructive Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.577 0.245 27.325)"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                        <div class="w-full md:w-6/12">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {{ $t('Dark Theme Colors') }}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent class="flex flex-col space-y-4">
                                    <FormColorPicker
                                        name="theme.dark.background"
                                        :label="$t('Background')" 
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.141 0.005 285.823)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.foreground"
                                        :label="$t('Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.985 0 0)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.primary"
                                        :label="$t('Primary')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.985 0 0)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.primary-foreground"
                                        :label="$t('Primary Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.21 0.006 285.885)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.secondary"
                                        :label="$t('Secondary')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.197 0.011 285.884)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.secondary-foreground"
                                        :label="$t('Secondary Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.985 0 0)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.accent"
                                        :label="$t('Accent')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.197 0.011 285.884)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.accent-foreground"
                                        :label="$t('Accent Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.985 0 0)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.muted"
                                        :label="$t('Muted')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.197 0.011 285.884)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.muted-foreground"
                                        :label="$t('Muted Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.651 0.013 285.883)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.destructive"
                                        :label="$t('Destructive')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.701 0.201 28.013)"
                                    />
                    
                                    <FormColorPicker
                                        name="theme.dark.destructive-foreground"
                                        :label="$t('Destructive Foreground')"
                                        :disabled="loading || saving"
                                        placeholder="oklch(0.985 0 0)"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </form>
    </SettingLayout>
</template>