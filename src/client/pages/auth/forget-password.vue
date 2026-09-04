<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import { $fetch } from '#client/utils/fetcher'
import { Button } from '#client/components/ui/button'
import FormTextField from '#client/components/FormTextField.vue'
import AuthLayout from '#client/layouts/AuthLayout.vue'

const isLoading = ref(false)
const emailSent = ref(false)

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(
        v.object({ email: v.pipe(v.string(), v.email()), })),
})

const onSubmit = handleSubmit(async (data) => {
    isLoading.value = true

    const [error] = await tryCatch(() => $fetch('/api/auth/forget-password', {
        method: 'POST',
        data,
    }))

    isLoading.value = false

    if (error) {
        return
    }

    emailSent.value = true
    toast.success($t('Password reset email sent!'))
})
</script>

<template>
    <AuthLayout
        :title="$t('Forgot your password?')"
        :description="emailSent ? $t('Check your email for reset instructions') : $t('Enter your email to receive a password reset link')"
    >
        <form 
            v-if="!emailSent"
            class="flex flex-col gap-6"
            @submit.prevent="onSubmit"
        >
            <div class="grid gap-6">
                <FormTextField
                    name="email"
                    type="email"
                    :label="$t('Email')"
                    :placeholder="$t('Enter your email')"
                    autocomplete="email"
                    autofocus
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
                    {{ $t('Send Reset Link') }}
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

        <div
            v-else
            class="flex flex-col gap-6"
        >
            <div class="text-center space-y-4">
                <p class="text-sm text-muted-foreground">
                    {{ $t('We have sent a password reset link to your email address. Please check your inbox and follow the instructions.') }}
                </p>
                
                <Button
                    class="w-full"
                    @click="emailSent = false"
                >
                    {{ $t('Send Another Email') }}
                </Button>
            </div>

            <div class="text-center text-sm">
                <a 
                    href="/auth/login" 
                    class="underline"
                >
                    {{ $t('Back to login') }}
                </a>
            </div>
        </div>
    </AuthLayout>
</template>
