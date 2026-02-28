<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { useRouter } from 'vue-router'

import { $fetch } from '#client/utils/fetcher.ts'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter 
} from '#client/components/ui/card'
import FormTextField from '#client/components/FormTextField.vue'
import FormTextarea from '#client/components/FormTextarea.vue'
import Button from '#client/components/Button.vue'
import { $server } from '#client/utils/server.ts'

const props = defineProps({
    module: {
        type: Object,
        required: true
    }
})

const router = useRouter()
const upgrading = ref(false)

const schema = v.object({
    repository: v.pipe(v.string(), v.minLength(1, $t('Repository URL is required'))),
    branch: v.optional(v.string()),
    key: v.optional(v.string()),
})

const { handleSubmit, values } = useForm({
    name: 'upgrade-git',
    validationSchema: toTypedSchema(schema),
    initialValues: {
        repository: props.module.upgrade_info?.repository || '',
        branch: props.module.upgrade_info?.branch || '',
        key: props.module.upgrade_info?.key || ''
    }
})

const onSubmit = handleSubmit(async (data) => {
    upgrading.value = true

    const payload = {
        method: 'POST',
        data: {
            ...data,
            id: props.module.id
        }
    }

    const [error] = await $fetch.try('/api/modules/upgrade/git', payload)

    if (error) {
        upgrading.value = false
        return
    }

    await new Promise(resolve => setTimeout(resolve, 5000))

    // await server restart
    await $server.online({
        timeout: 60000,
    })

    await new Promise(resolve => setTimeout(resolve, 5000))

    upgrading.value = false
})
</script>

<template>
    <form @submit.prevent="onSubmit">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('Git Module Upgrade') }}</CardTitle>
                <CardDescription>
                    {{ $t('Select an existing module and provide git repository details to upgrade it') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="p-3 bg-muted rounded-md">
                    <div class="text-sm font-medium">
                        {{ $t('Module to upgrade:') }} {{ props.module.name }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                        {{ $t('ID:') }} {{ props.module.id }}
                    </div>
                </div>
                
                <FormTextField
                    name="repository"
                    :label="$t('Repository URL')"
                    placeholder="https://github.com/user/repo.git"
                    :description="$t('Git repository URL (HTTPS or SSH)')"
                />

                <FormTextField
                    name="branch"
                    :label="$t('Branch')"
                    :placeholder="$t('main')"
                    :description="$t('Optional: Specific branch to pull (defaults to repository default)')"
                />

                <FormTextarea
                    name="key"
                    :label="$t('SSH Private Key')"
                    placeholder="-----BEGIN PRIVATE KEY-----"
                    :description="$t('Optional: SSH private key for private repositories')"
                    :rows="8"
                />
            </CardContent>
            <CardFooter class="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    :disabled="upgrading"
                    @click="router.push('/admin/modules')"
                >
                    {{ $t('Cancel') }}
                </Button>
                <Button
                    type="submit"
                    :loading="upgrading"
                >
                    {{ $t('Upgrade') }}
                </Button>
            </CardFooter>
        </Card>
    </form>
</template>