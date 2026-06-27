<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import schemas from '#shared/validators/index.ts'
import Icon from '#client/components/Icon.vue'
import FormSelect from '#client/components/FormSelect.vue'
import translator from '#client/facades/translator.facade.ts'

const loading = ref(false)
const saving = ref(false)

const { handleSubmit, resetForm } = useForm({ validationSchema: toTypedSchema(schemas.translator.update), })

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<any>('/api/translator-settings')

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

    const [error] = await $fetch.try('/api/translator-settings', {
        method: 'PUT',
        data,
    })

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Translator settings saved successfully'))
    setTimeout(() => {
        saving.value = false
        window.location.reload()
    }, 500)
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
            name="defaultLocale"
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
