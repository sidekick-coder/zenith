<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import type { Token } from '@sidekick-coder/zenith-kit/shared'
import { AlertCircleIcon } from 'lucide-vue-next'
import AdminLayout from '#client/layouts/AdminLayout.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '#client/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '#client/components/ui/alert'
import FormTextField from '#client/components/FormTextField.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import PermissionAssignments from '#client/components/PermissionAssignments.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

const route = useRoute()
const router = useRouter()
const tokenId = route.params.id as string

const loading = ref(false)
const saving = ref(false)
const token = ref<Token>()
const tokenFromState = ref<string | null>(null)
const copied = ref(false)

const { handleSubmit, resetForm } = useForm({ validationSchema: toTypedSchema(v.object({ name: v.pipe(v.string(), v.minLength(1, $t('Name is required'))), })), })

async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() => $fetch<Token>(`/api/tokens/${tokenId}`))

    if (error) {
        loading.value = false
        toast.error($t('Failed to load token.'))
        router.replace('/admin/tokens')
        return
    }

    token.value = response
    resetForm({ values: { name: response.name ?? '' } })

    setTimeout(() => { loading.value = false }, 800)
}

const onSubmit = handleSubmit(async (form) => {
    saving.value = true

    const [error, response] = await tryCatch(() => $fetch<Token>(`/api/tokens/${tokenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
    }))

    if (error) {
        toast.error($t('Failed to update token.'))
        saving.value = false
        return
    }

    token.value = response
    toast.success($t('Token updated.'))
    saving.value = false
})

async function copyToken() {
    if (!tokenFromState.value) return
    await navigator.clipboard.writeText(tokenFromState.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
}

onMounted(() => {
    tokenFromState.value = window.history.state?.token ?? null
    load()
})
</script>
<template>
    <AdminLayout
        :breadcrumbs="[
            { label: $t('Tokens'), to: '/admin/tokens' },
            { label: token?.name || $t('Loading...') }
        ]"
    >
        <div
            v-if="tokenFromState"
            class="mb-4 space-y-2"
        >
            <Alert variant="warning">
                <AlertCircleIcon />
                <AlertTitle>{{ $t('Save your token') }}</AlertTitle>
                <AlertDescription>
                    {{ $t('This token will not be shown again. Please store it in a safe place.') }}
                </AlertDescription>
            </Alert>
            <Card>
                <CardContent class="pt-4">
                    <div class="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                        <code class="flex-1 break-all text-sm text-muted-foreground">
                            {{ tokenFromState }}
                        </code>
                        <Button
                            variant="ghost"
                            size="icon"
                            :tooltip="copied ? $t('Copied!') : $t('Copy')"
                            @click="copyToken"
                        >
                            <Icon :name="copied ? 'check' : 'copy'" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>{{ $t('Token Details') }}</CardTitle>
                    <CardDescription>
                        {{ $t('Update the token information.') }}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        class="space-y-4"
                        @submit.prevent="onSubmit"
                    >
                        <FormTextField
                            name="name"
                            :label="$t('Name')"
                            :placeholder="$t('e.g. My CI token')"
                        />
                    </form>
                </CardContent>
                <CardFooter class="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        to="/admin/tokens"
                    >
                        {{ $t('Back') }}
                    </Button>
                    <Button
                        :loading="saving"
                        @click="onSubmit"
                    >
                        {{ $t('Save') }}
                    </Button>
                </CardFooter>
            </Card>

            <PermissionAssignments
                v-if="token"
                assign-type="token"
                :assign-id="tokenId"
            />
        </div>
    </AdminLayout>
</template>
