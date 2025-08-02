<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { $fetch } from '#client/utils/fetcher'
import { tryCatch } from '#shared/tryCatch.ts'
import { Button } from '#client/components/ui/button'
import FormTextField from '#client/components/FormTextField.vue'
import AuthLayout from '#client/layouts/Auth.vue'

const isLoading = ref(false)

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(
        v.object({
            email: v.pipe(v.string(), v.email()),
            password: v.pipe(v.string(), v.minLength(6)),
        })),
})

const onSubmit = handleSubmit(async (formValues) => {
    isLoading.value = true

    const [error] = await tryCatch(() => {
        return $fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(formValues),
        })
    })

    if (error) {
        isLoading.value = false
        return
    }

    toast.success('Logged in successfully!')

    setTimeout(async () => {
        window.location.href = '/admin'
    }, 1000)
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
                    name="email"
                    type="email"
                    label="Email address"
                    placeholder="email@example.com"
                    autocomplete="email"
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