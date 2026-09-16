<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { Card, CardContent, Icon, ZButton as Button, FormField, FormImageUploader, FormItem, FormLabel, FormMessage, FormSelect } from '@sidekick-coder/zenith-kit/components'
import { cn, useForm } from '@sidekick-coder/zenith-kit/client'

import { $fetch } from '#client/utils/fetcher.ts'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import ThemePreview from '#client/components/ThemePreview.vue'
import schemas from '#shared/validators/index.ts'
import { themeToCss } from '#client/composables/defineTheme.ts'
import { useFonts } from '#client/composables/useFonts.ts'
import { useRadii } from '#client/composables/useRadii.ts'
import { useThemes } from '#client/composables/useThemes.ts'

const loading = ref(false)
const saving = ref(false)
const logoUploading = ref(false)
const logoUrl = ref<string | null>(null)
const themes = useThemes()
const fonts = useFonts()
const radii = useRadii()
const fontOptions = fonts.map(font => ({
    label: font.name,
    value: font.id,
}))
const radiusOptions = radii.map(radius => ({
    label: radius.id,
    value: radius.id,
}))
const styleRef = ref<HTMLStyleElement>()

const { handleSubmit, values, resetForm } = useForm(schemas.branding.update)

function setPreview() {
    if (!styleRef.value) return

    const theme = themes.find(theme => theme.id === values.theme) || themes.find(theme => theme.id === 'default')!
    const font = fonts.find(font => font.id === values.fontFamily) || fonts.find(font => font.id === 'inter')!
    const radius = radii.find(radius => radius.id === values.radius) || radii.find(radius => radius.id === 'md')!

    styleRef.value.innerHTML = `${themeToCss(theme)}\n:root { --radius: ${radius.value}; --font-sans: ${font.family}; }`
}

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<any>('/api/branding')

    if (error) {
        loading.value = false
        return
    }

    resetForm({
        values: {
            ...response,
            theme: response.theme || 'default',
            radius: radii.find(radius => radius.id === response.radius || radius.value === response.radius)?.id || 'md',
            fontFamily: response.fontFamily || 'inter',
        },
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

    const [error] = await $fetch.try('/api/branding', {
        method: 'PUT',
        data,
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

watch([() => values.theme, () => values.radius, () => values.fontFamily], setPreview)

onMounted(() => {
    styleRef.value = document.createElement('style')
    styleRef.value.id = 'theme-preview'
    document.head.appendChild(styleRef.value)
    setPreview()
})

onUnmounted(() => {
    styleRef.value?.remove()
})

onMounted(load)
</script>

<template>
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


                <FormSelect
                    name="radius"
                    :label="$t('Border radius')"
                    :disabled="loading || saving"
                    :options="radiusOptions"
                />

                <FormSelect
                    name="fontFamily"
                    :label="$t('Font family')"
                    :disabled="loading || saving"
                    :options="fontOptions"
                />

                <FormField
                    v-slot="{ value, setValue }"
                    name="theme"
                >
                    <FormItem>
                        <FormLabel>{{ $t('Theme') }}</FormLabel>
                        <div
                            class="grid grid-cols-1 gap-4 sm:grid-cols-4"
                            :disabled="loading || saving"
                        >
                            <button
                                v-for="theme in themes"
                                :key="theme.id"
                                type="button"
                                :disabled="loading || saving"
                                :class="cn(
                                    'group cursor-pointer overflow-hidden rounded-lg border-2 bg-card text-left transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50',
                                    value === theme.id
                                        ? 'border-primary'
                                        : 'border-border'

                                )"
                                @click="setValue(theme.id)"
                            >
                                <ThemePreview
                                    :colors="theme.light"
                                    class="aspect-video w-full"
                                />
                                <span class="block border-t px-4 py-4 text-sm font-medium font-bold">
                                    {{ theme.id }}
                                </span>
                            </button>
                        </div>
                        <FormMessage />
                    </FormItem>
                </FormField>
            </CardContent>
        </Card>
    </form>
</template>
