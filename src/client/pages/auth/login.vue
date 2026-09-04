<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { route } from '@sidekick-coder/zenith-kit/client'
import $fetch from '#client/facades/fetch.facade.ts'
import Button from '#client/components/Button.vue'
import FormTextField from '#client/components/FormTextField.vue'
import AuthLayout from '#client/layouts/AuthLayout.vue'

import config from '#client/facades/config.facade.ts'
import Icon from '#client/components/Icon.vue'

const loading = ref(false)
const loadingOAuth = ref(false)

const enableRegistration = config.get('auth.enable_registration', false)
const enableGoogleAuth = config.get('oauth.google_enabled', false)

let redirectTo = config.get('auth.redirect_to_on_login', '/')

if (route.query.redirect) {
    redirectTo = route.query.redirect as string
}

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(
        v.object({
            uuid: v.pipe(v.string()),
            password: v.pipe(v.string(), v.minLength(6)),
        })),
})

const onSubmit = handleSubmit(async (data) => {
    loading.value = true

    const [error] = await $fetch.try('/api/auth/login', {
        method: 'POST',
        data,
    })

    if (error) {
        console.error(error)
        loading.value = false
        return
    }

    toast.success('Logged in successfully!')

    setTimeout(() => {
        window.location.href = redirectTo
    }, 500)
})

async function oauthLogin(provider: string) {
    loadingOAuth.value = true

    const [error, response] = await $fetch.try('/api/oauth', {
        method: 'POST',
        data: {
            provider,
            action: 'login',
            error_url: '/auth/message',
            success_url: redirectTo,
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
        title="Log in to your account"
        description="Enter your email and password below to log in"
    >
        <Button
            v-if="enableGoogleAuth"
            variant="outline"
            class="w-full"
            type="button"
            :tabindex="5"
            :loading="loadingOAuth"
            @click="oauthLogin('google')"
        >
            <Icon
                name="mdi:google"
                class="mr-2 h-4 w-4"
            />

            {{ $t('Log in with Google') }}
        </Button>

        <form 
            class="flex flex-col gap-6"
            @submit.prevent="onSubmit"
        >
            <div class="grid gap-6">
                <FormTextField
                    name="uuid"
                    :label="$t('Email/Username')"
                    placeholder="me@example.com"
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
                    :disabled="loading"
                    :tabindex="4"
                >
                    <LoaderCircle
                        v-if="loading"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    {{ $t('Log in') }}
                </Button>
            </div>

            <div
                v-if="enableRegistration"
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
