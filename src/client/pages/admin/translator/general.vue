<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sidekick-coder/zenith-kit/components'
import { fetcher, useForm, translator } from '@sidekick-coder/zenith-kit/client'
import Button from '#client/components/Button.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import Icon from '#client/components/Icon.vue'
import FormSelect from '#client/components/FormSelect.vue'
import { translatorSchema } from '#shared/schemas/translatorSchema.ts'

const loading = ref(false)
const saving = ref(false)

const { handleSubmit, resetForm } = useForm(translatorSchema())

async function load() {
    loading.value = true

    const [error, response] = await fetcher.try<any>('/api/translator/config')

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

    const [error] = await fetcher.try('/api/translator/config', {
        method: 'PUT',
        data,
    })

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Updated successfully'))

    await new Promise(resolve => setTimeout(resolve, 500))

    saving.value = false

    window.location.reload()
})

onMounted(() => {
    load()
})
</script>

<template>
    <form @submit="onSubmit">
        <div class="mb-6 flex">
            <div class="flex-1">
                <PageTitle>{{ $t('Translator Settings') }}</PageTitle>
                <PageSubtitle>
                    {{ $t('Configure your default locale and translation settings') }}
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
                        {{ $t('Locale Configuration') }}
                    </CardTitle>
                    <CardDescription>
                        {{ $t('Set the default language for your application') }}
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <FormSelect
                        name="default_locale"
                        label-key="label"
                        value-key="value"
                        :label="$t('Default Locale')"
                        :disabled="loading || saving"
                        :options="translator.locales.map(l => ({
                            label: l,
                            value: l
                        }))"
                    />
                </CardContent>
            </Card>
        </div>
    </form>
</template>
