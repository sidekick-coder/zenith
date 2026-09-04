<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import { $fetch } from '#client/utils/fetcher'
import { Button } from '#client/components/ui/button'
import config from '#client/facades/config.facade.ts'
import FormTextField from '#client/components/FormTextField.vue'
import AuthLayout from '#client/layouts/AuthLayout.vue'
import Icon from '#client/components/Icon.vue'

const router = useRouter()

const isLoading = ref(false)
const loadingOAuth = ref(false)

const enableGoogleAuth = config.get('oauth.google_enabled', false)

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(
        v.object({
            name: v.pipe(v.string(), v.minLength(3)),
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
        data: data,
    }))

    if (error) {
        isLoading.value = false
        return
    }

    toast.success($t('Account created successfully!'))

    await new Promise(resolve => setTimeout(resolve, 500))

    if (config.get('auth.enable_email_verification', false)) {
        return router.push({
            path: '/auth/message',
            query: {
                title: $t('Account Created'),
                message: $t('Your account has been created successfully. Please check your email to verify your account before logging in.'),
            }
        })
    }

    router.push('/auth/login')
})

async function oauthRegister(provider: string) {
    loadingOAuth.value = true

    const [error, response] = await $fetch.try('/api/oauth', {
        method: 'POST',
        data: {
            provider,
            action: 'register',
            error_url: '/auth/message',
            success_url: '/',
        }
    })

    if (error) {
        console.error(error)
        loadingOAuth.value = false
        return
    }

    window.location.href = response.url
}
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
                    name="name"
                    :label="$t('Name')"
                    :placeholder="$t('Enter your name')"
                    autocomplete="name"
                    autofocus
                />

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

                <div class="mt-4 w-full flex flex-col gap-4">
                    <Button
                        type="submit"
                        class="w-full"
                        :disabled="isLoading"
                    >
                        <LoaderCircle
                            v-if="isLoading"
                            class="mr-2 h-4 w-4 animate-spin"
                        />
                        {{ $t('Create Account') }}
                    </Button>
    
                    <Button
                        v-if="enableGoogleAuth"
                        variant="outline"
                        class="w-full"
                        type="button"
                        :loading="loadingOAuth"
                        @click="oauthRegister('google')"
                    >
                        <Icon
                            name="mdi:google"
                            class="mr-2 h-4 w-4"
                        />
    
                        {{ $t('Sign up with Google') }}
                    </Button>
                </div>
            </div>

            <div class="text-center text-sm">
                {{ $t('Already have an account?') }}
                <a 
                    href="/auth/login" 
                    class="underline"
                >
                    {{ $t('Sign in') }}
                </a>
            </div>
        </form>
    </AuthLayout>
</template>
