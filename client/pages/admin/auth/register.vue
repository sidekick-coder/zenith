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
import { $t } from '#shared/lang.ts'

const isLoading = ref(false)

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(
        v.object({
            username: v.pipe(v.string(), v.minLength(3)),
            email: v.pipe(v.string(), v.email()),
            password: v.pipe(v.string(), v.minLength(6)),
            confirmPassword: v.pipe(v.string(), v.minLength(6)),
        })),
})

const onSubmit = handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) {
        toast.error($t('Passwords do not match'))
        return
    }

    isLoading.value = true

    const [error] = await tryCatch(() => $fetch('/api/auth/register', {
        method: 'POST',
        data: {
            username: data.username,
            email: data.email,
            password: data.password,
        },
    }))

    if (error) {
        isLoading.value = false
        return
    }

    toast.success($t('Account created successfully!'))

    setTimeout(() => {
        window.location.href = '/admin/auth/login'
    }, 500)
})
</script>

<template>
    <AuthLayout
        :title="$t('Create your account')"
        :description="$t('Enter your details below to create a new account')"
    >
        <form 
            class="flex flex-col gap-6"
            @submit.prevent="onSubmit"
        >
            <div class="grid gap-6">
                <FormTextField
                    name="username"
                    :label="$t('Username')"
                    :placeholder="$t('Enter your username')"
                    autocomplete="username"
                    autofocus
                />

                <FormTextField
                    name="email"
                    type="email"
                    :label="$t('Email')"
                    :placeholder="$t('Enter your email')"
                    autocomplete="email"
                />

                <FormTextField
                    name="password"
                    type="password"
                    :label="$t('Password')"
                    :placeholder="$t('Enter your password')"
                    autocomplete="new-password"
                />

                <FormTextField
                    name="confirmPassword"
                    type="password"
                    :label="$t('Confirm Password')"
                    :placeholder="$t('Confirm your password')"
                    autocomplete="new-password"
                />

                <Button
                    type="submit"
                    class="mt-4 w-full"
                    :disabled="isLoading"
                >
                    <LoaderCircle
                        v-if="isLoading"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    {{ $t('Create Account') }}
                </Button>
            </div>

            <div class="text-center text-sm">
                {{ $t('Already have an account?') }}
                <a 
                    href="/admin/auth/login" 
                    class="underline"
                >
                    {{ $t('Sign in') }}
                </a>
            </div>
        </form>
    </AuthLayout>
</template>