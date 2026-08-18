<script lang="ts" setup>
import { useForm, toast, fetcher } from '@sidekick-coder/zenith-kit/client'
import { ref } from 'vue'

import { FormTextField, FormTextarea, ZButton } from '@sidekick-coder/zenith-kit/components'

import { validator } from '@sidekick-coder/zenith-kit/shared'
import Card from '#client/components/ui/card/Card.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'

const loading = ref(false)
const saving = ref(false)
const schema = validator.create(v => v.object({
    repository: v.string(),
    ssh_key_file: v.optional(v.string()),
    ssh_key: v.optional(v.string()),
}))
const { handleSubmit } = useForm(schema)

const onSubmit = handleSubmit(async (payload) => {
    saving.value = true

    const [error] = await fetcher.try('/api/plugins/install', {
        method: 'POST',
        data: payload,
    })

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Installed successfully'))

    await new Promise(resolve => setTimeout(resolve, 800))

    const url = new URL('/api/reloader', window.location.origin)

    url.searchParams.append('redirect_to', '/admin/plugins')
    url.searchParams.append('delay', '3000')

    window.location.href = url.toString()
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
            <CardContent class="space-y-6">
                <FormTextField
                    name="repository"
                    :label="$t('Repository')"
                    :hint="$t('The git repository URL of the plugin')"
                />
                <FormTextField
                    name="ssh_key_file"
                    :hint="$t('Path to the SSH key file inside the machine')"
                    :label="$t('SSH Key File')"
                />

                <FormTextarea
                    name="ssh_key"
                    :label="$t('SSH Key')"
                    :hint="$t('Paste the SSH key content here')"
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
