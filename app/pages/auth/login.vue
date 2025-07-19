<script setup lang="ts">
import AuthLayout from '#app/layouts/Auth.vue'
import FormTextField from '#app/components/FormTextField.vue'
import { Button } from '#app/components/ui/button'
import { LoaderCircle } from 'lucide-vue-next'
import {useForm} from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { $fetch } from '#app/utils/fetcher'
import { ref } from 'vue'
import { tryCatch } from '#common/tryCatch'
import { toast } from 'vue-sonner'

const isLoading = ref(false)

const { handleSubmit } = useForm({
    initialValues: {
        email: 'henrique@sidekick-coder.com',
        password: 'rick-1232',
    },
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
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(formValues),
        })
    })

    if (error) {
        isLoading.value = false
        return
    }

    toast.success('Logged in successfully!')

    setTimeout(async () => {
        // isLoading.value = false
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