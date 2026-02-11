<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { $fetch } from '#client/utils/fetcher'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { Button } from '#client/components/ui/button'
import FormTextField from '#client/components/FormTextField.vue'
import AuthLayout from '#client/layouts/AuthLayout.vue'

import config from '#client/facades/config.facade.ts'

const isLoading = ref(false)

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(
        v.object({
            uuid: v.pipe(v.string()),
            password: v.pipe(v.string(), v.minLength(6)),
        })),
})

const onSubmit = handleSubmit(async (data) => {
    isLoading.value = true

    const [error] = await tryCatch(() => $fetch('/api/auth/login', {
        method: 'POST',
        data,
    })
    )

    if (error) {
        isLoading.value = false
        return
    }

    toast.success('Logged in successfully!')

    setTimeout(() => {
        window.location.href = '/'
    }, 500)
})
</script>

<template>
    <AuthLayout
        title="Log in to your account"
        description="Enter your email and password below to log in"
    >
        <form 
            class="flex flex-col gap-6"
            @submit.prevent="onSubmit"
        >
            <div class="grid gap-6">
                <FormTextField
                    name="uuid"
                    :label="$t('Email/Username')"
                    placeholder="admin"
                    autocomplete="email"
                    autofocus
                />

                <div class="space-y-2">
                    <FormTextField
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Password"
                        autocomplete="current-password"
                    />
                    <div class="text-right">
                        <router-link
                            to="/auth/forget-password" 
                            class="text-sm underline"
                        >
                            {{ $t('Forgot password?') }}
                        </router-link>
                    </div>
                </div>

                <Button
                    type="submit"
                    class="w-full"
                    :disabled="isLoading"
                    :tabindex="4"
                >
                    <LoaderCircle
                        v-if="isLoading"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    {{ $t('Log in') }}
                </Button>
            </div>

            <div
                v-if="config.get('auth.enable_registration', false)"
                class="text-center text-sm"
            >
                {{ $t("Don't have an account?") }}
                <a 
                    href="/auth/register" 
                    class="underline"
                >
                    {{ $t('Sign up') }}
                </a>
            </div>
        </form>
    </AuthLayout>
</template>