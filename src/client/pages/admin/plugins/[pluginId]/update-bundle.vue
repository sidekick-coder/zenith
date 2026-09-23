<script lang="ts" setup>
import { useForm, toast, fetcher, waitForServer } from '@sidekick-coder/zenith-kit/client'
import { ref } from 'vue'

import { FormTextField, FormFilePicker, ZButton } from '@sidekick-coder/zenith-kit/components'

import { validator } from '@sidekick-coder/zenith-kit/shared'
import { useRoute, useRouter } from 'vue-router'
import Card from '#client/components/ui/card/Card.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'

const route = useRoute()
const router = useRouter()
const pluginId = route.params.pluginId as string

const loading = ref(false)
const saving = ref(false)
const schema = validator.create(v => v.object({ file: v.any(), }))

const { handleSubmit } = useForm(schema)

const onSubmit = handleSubmit(async (payload) => {
    saving.value = true

    const [error] = await fetcher.try(`/api/plugins/${pluginId}/update-bundle`, {
        method: 'POST',
        body: payload.file,
    })

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Installed successfully'))

    await new Promise(resolve => setTimeout(resolve, 800))

    router.push(`/admin/plugins/${pluginId}?tab=versions`)
})

</script>
<template>
    <form
        class="space-y-4 py-2"
        @submit.prevent="onSubmit"
    >
        <div class="flex-1">
            <PageTitle>{{ $t('Update plugin') }}</PageTitle>
            <PageSubtitle>
                {{ $t('Update plugin via bundle file') }}
            </PageSubtitle>
        </div>
        <Card :loading="loading">
            <CardContent class="flex flex-col gap-4">
                <FormFilePicker
                    name="file"
                    class="max-w-md"
                    accept=".bundle"
                    :label="$t('Bundle file')"
                />
            </CardContent>

            <CardFooter class="justify-end">
                <ZButton
                    type="submit"
                    :loading="saving"
                >
                    {{ $t('Update') }}
                </ZButton>
            </CardFooter>
        </Card>
    </form>
</template>
