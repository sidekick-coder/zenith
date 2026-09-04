<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import { $fetch } from '#client/utils/fetcher'
import { Button } from '#client/components/ui/button'
import FormTextField from '#client/components/FormTextField.vue'
import AuthLayout from '#client/layouts/AuthLayout.vue'

const isLoading = ref(false)
const token = ref('')

onMounted(() => {
    const urlParams = new URLSearchParams(window.location.search)
    token.value = urlParams.get('token') || ''
})

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(
        v.object({
            password: v.pipe(v.string(), v.minLength(6)),
            confirmPassword: v.pipe(v.string(), v.minLength(6)),
        })),
})

const onSubmit = handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) {
        toast.error($t('Passwords do not match'))
        return
    }

    if (!token.value) {
        toast.error($t('Invalid or missing token'))
        return
    }

    isLoading.value = true

    const [error] = await tryCatch(() => $fetch('/api/auth/reset-password', {
        method: 'POST',
        data: {
            token: token.value,
            password: data.password,
        },
    }))

    if (error) {
        isLoading.value = false
        return
    }

    toast.success($t('Password reset successful!'))

    setTimeout(() => {
        window.location.href = '/auth/login'
    }, 500)
})
</script>

<template>
    <AuthLayout
        :title="$t('Reset your password')"
        :description="$t('Enter your new password below')"
    >
        <form 
            class="flex flex-col gap-6"
            @submit.prevent="onSubmit"
        >
            <div class="grid gap-6">
                <FormTextField
                    name="password"
                    type="password"
                    :label="$t('New Password')"
                    :placeholder="$t('Enter new password')"
                    autocomplete="new-password"
                    autofocus
                />

                <FormTextField
                    name="confirmPassword"
                    type="password"
                    :label="$t('Confirm Password')"
                    :placeholder="$t('Confirm new password')"
                    autocomplete="new-password"
                />

                <Button
                    type="submit"
                    class="w-full"
                    :disabled="isLoading"
                >
                    <LoaderCircle
                        v-if="isLoading"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    {{ $t('Reset Password') }}
                </Button>
            </div>

            <div class="text-center text-sm">
                {{ $t('Remember your password?') }}
                <a 
                    href="/auth/login" 
                    class="underline"
                >
                    {{ $t('Log in') }}
                </a>
            </div>
        </form>
    </AuthLayout>
</template>
