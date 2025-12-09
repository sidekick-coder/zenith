<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { useRouter } from 'vue-router'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter 
} from '#client/components/ui/card'
import FormTextField from '#client/components/FormTextField.vue'
import FormTextarea from '#client/components/FormTextarea.vue'
import Button from '#client/components/Button.vue'
import { $server } from '#client/utils/server.ts'

const router = useRouter()
const installing = ref(false)

const schema = v.object({
    id: v.pipe(v.string(), v.minLength(1, $t('Module ID is required'))),
    repository: v.pipe(v.string(), v.minLength(1, $t('Repository URL is required'))),
    branch: v.optional(v.string()),
    key: v.optional(v.string()),
})

const { handleSubmit, values, setFieldValue } = useForm({
    name: 'install-git',
    validationSchema: toTypedSchema(schema),
})

const onSubmit = handleSubmit(async (data) => {
    installing.value = true

    const payload = {
        method: 'POST',
        data
    }

    const sucess = await $server.reloadAfter({
        href: '/admin/modules',
        fn: () => $fetch('/api/modules/install/git', payload)
    })

    if (!sucess) {
        installing.value = false
        return
    }

    installing.value = false

    router.push('/admin/modules')
})

watch(() => values.repository, (newVal) => {
    if (!newVal) return

    if (values.id) return
    
    const matched = newVal.match(/\/([^/]+)(\.git)?$/)

    if (!matched || matched.length < 2) return

    let name = matched[1]

    name = name.replace('.git', '')

    // Auto-fill module ID from repo name if ID is empty
    setFieldValue('id', name)
})
</script>

<template>
    <form @submit.prevent="onSubmit">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('Git Module Installation') }}</CardTitle>
                <CardDescription>
                    {{ $t('Provide the git repository details and module information') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <FormTextField
                    name="id"
                    :label="$t('Module ID')"
                    :placeholder="$t('Enter module identifier')"
                    :description="$t('Unique identifier for the module')"
                />
                
                <FormTextField
                    name="repository"
                    :label="$t('Repository URL')"
                    :placeholder="$t('https://github.com/user/repo.git')"
                    :description="$t('Git repository URL (HTTPS or SSH)')"
                />

                <FormTextField
                    name="branch"
                    :label="$t('Branch')"
                    :placeholder="$t('main')"
                    :description="$t('Optional: Specific branch to clone (defaults to repository default)')"
                />

                <FormTextarea
                    name="key"
                    :label="$t('SSH Private Key')"
                    :placeholder="$t('-----BEGIN PRIVATE KEY-----')"
                    :description="$t('Optional: SSH private key for private repositories')"
                    :rows="8"
                />
            </CardContent>
            <CardFooter class="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    :disabled="installing"
                    @click="router.push('/admin/modules')"
                >
                    {{ $t('Cancel') }}
                </Button>
                <Button
                    type="submit"
                    :loading="installing"
                >
                    {{ $t('Install') }}
                </Button>
            </CardFooter>
        </Card>
    </form>
</template>