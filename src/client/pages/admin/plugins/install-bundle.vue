<script lang="ts" setup>
import { useForm, toast, fetcher, waitForServer } from '@sidekick-coder/zenith-kit/client'
import { ref } from 'vue'

import { FormTextField, FormFilePicker, ZButton } from '@sidekick-coder/zenith-kit/components'

import { validator } from '@sidekick-coder/zenith-kit/shared'
import Card from '#client/components/ui/card/Card.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'

const loading = ref(false)
const saving = ref(false)
const schema = validator.create(v => v.object({
    file: v.any(),
    branch: v.string(),
}))

const { handleSubmit } = useForm(schema)

const onSubmit = handleSubmit(async (payload) => {
    saving.value = true

    const [error] = await fetcher.try('/api/plugins/install-bundle', {
        method: 'POST',
        body: payload.file,
        query: { branch: payload.branch, },
    })

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Installed successfully'))

    await new Promise(resolve => setTimeout(resolve, 800))

    waitForServer({ redirectTo: '/admin/plugins', })
})

</script>
<template>
    <form
        class="space-y-4 py-2"
        @submit.prevent="onSubmit"
    >
        <div class="flex-1">
            <PageTitle>{{ $t('Install plugin') }}</PageTitle>
            <PageSubtitle>
                {{ $t('Instlal a new plugin') }}
            </PageSubtitle>
        </div>
        <Card :loading="loading">
            <CardContent class="flex flex-col gap-4">
                <FormFilePicker
                    name="file"
                    :label="$t('Bundle file')"
                    :hint="$t('The plugin bundle file to install')"
                    class="max-w-md"
                />

                <FormTextField
                    name="branch"
                    :label="$t('Branch')"
                    :hint="$t('The branch of the plugin repository, e.g. stable, beta, etc.')"
                />
            </CardContent>

            <CardFooter class="justify-end">
                <ZButton
                    type="submit"
                    :loading="saving"
                >
                    {{ $t('Install') }}
                </ZButton>
            </CardFooter>
        </Card>
    </form>
</template>
