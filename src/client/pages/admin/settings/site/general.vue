<script lang="ts" setup>
import {
    onMounted,
    ref
} from 'vue'
import { toast } from 'vue-sonner'

import { useForm, fetcher } from '@sidekick-coder/zenith-kit/client'
import { FormImageUploader, } from '@sidekick-coder/zenith-kit/components'
import FormTextField from '#client/components/FormTextField.vue'
import Button from '#client/components/Button.vue'
import Card from '#client/components/ui/card/Card.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'
import siteSchema from '#shared/schemas/siteSchema.ts'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'

const loading = ref(false)
const saving = ref(false)
const setting = ref<any>({})

const { handleSubmit, setValues } = useForm(siteSchema())

const onSubmit = handleSubmit(async (form) => {
    saving.value = true

    const [error] = await fetcher.try('/api/config/site', {
        method: 'PUT',
        data: form,
    })

    if (error) {
        saving.value = false
        return
    }

    setTimeout(() => {
        saving.value = false
        toast.success($t('Updated successfully'))
    }, 1000)
})

async function load() {
    loading.value = true

    const [error, response] = await fetcher.try('/api/config/site')

    if (error) return

    setValues(response)

    setting.value = response

    await new Promise((resolve) => setTimeout(resolve, 800))

    loading.value = false
}

onMounted(load)
</script>
<template>
    <form
        class="space-y-4 py-2"
        @submit.prevent="onSubmit"
    >
        <div class="flex-1">
            <PageTitle>{{ $t('General') }}</PageTitle>
            <PageSubtitle>
                {{ $t('Configure your general settings') }}
            </PageSubtitle>
        </div>
        <Card :loading="loading">
            <CardContent class="space-y-6">
                <FormTextField
                    name="name"
                    :label="$t('Name')"
                />

                <FormTextField
                    name="support_email"
                    :label="$t('Support Email')"
                />

                <FormImageUploader
                    name="favicon_image_id"
                    :label="$t('Favicon')"
                    purpose="favicon"
                    :public="true"
                    :max-size="1024 * 1024"
                    :file-url="setting.favicon_url || '/favicon'"
                />

                <FormTextField
                    name="home_path"
                    clearable
                    :label="$t('Home path')"
                />

                <FormTextField
                    name="home_redirect_path"
                    clearable
                    :label="$t('Home redirect path')"
                />
            </CardContent>

            <CardFooter class="justify-end">
                <Button
                    type="submit"
                    :loading="saving"
                >
                    {{ $t('Save') }}
                </Button>
            </CardFooter>
        </Card>
    </form>
</template>
