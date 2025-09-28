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
        window.location.href = '/admin'
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

                <FormTextField
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="Password"
                    autocomplete="current-password"
                />

                <Button
                    type="submit"
                    class="mt-4 w-full"
                    :disabled="isLoading"
                    :tabindex="4"
                >
                    <LoaderCircle
                        v-if="isLoading"
                        class="mr-2 h-4 w-4 animate-spin"
                    />
                    Log in
                </Button>
            </div>
        </form>
    </AuthLayout>
</template>