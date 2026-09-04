<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/valibot'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { kebabCase } from 'lodash-es'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import Button from '#client/components/Button.vue'
import Card from '#client/components/ui/card/Card.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import FormTextField from '#client/components/FormTextField.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'


const isLoading = ref(false)

const { handleSubmit, values, setFieldValue } = useForm({
    validationSchema: toTypedSchema(
        v.pipe(
            v.object({
                name: v.string(),
                username: v.string(),
                email: v.pipe(v.string(), v.email($t('Email'))),
                password: v.pipe(v.string(), v.minLength(6, $t('Password must be at least 6 characters'))),
                confirmPassword: v.pipe(v.string(), v.minLength(6, $t('Confirm Password must be at least 6 characters'))),
            }),
            v.forward(
                v.partialCheck(
                    [['password'], ['confirmPassword']],
                    (input) => input.password === input.confirmPassword,
                    'The two passwords do not match.'
                ),
                ['confirmPassword']
            )
        ),
    )
})

const onSubmit = handleSubmit(async (data) => {
    isLoading.value = true

    const [error] = await $fetch.try('/api/setup/user', {
        method: 'POST',
        data
    })

    if (error) {
        isLoading.value = false
        return
    }

    toast.success('User setup completed successfully!')

    await new Promise(resolve => setTimeout(resolve, 500))

    const url = new URL('/api/reloader', window.location.origin)

    url.searchParams.append('redirect_to', '/auth/login')
    url.searchParams.append('delay', '3000')

    window.location.href = url.toString()
})

watch(() => values.name, (name) => {
    setFieldValue('username', kebabCase(name))
})
</script>

<template>
    <form
        class="h-dvh w-dvw flex items-center justify-center"
        @submit.prevent="onSubmit"
    >
        <Card class="w-full max-w-md">
            <CardHeader>
                <CardTitle>
                    {{ $t('Admin') }}
                </CardTitle>
                <CardDescription>
                    {{ $t('Create your admin account') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-6">
                <FormTextField
                    name="name"
                    type="text"
                    :label="$t('Name')"
                    placeholder="John Doe"
                    :tabindex="1"
                />

                <FormTextField
                    name="username"
                    type="text"
                    :label="$t('Username')"
                    placeholder="johndoe"
                    :tabindex="1"
                />

                <FormTextField
                    name="email"
                    type="email"
                    :label="$t('Email')"
                    placeholder="john.doe@example.com"
                />

                <FormTextField
                    name="password"
                    type="password"
                    :label="$t('Password')"
                    placeholder="********"
                    :tabindex="2"
                />
                <FormTextField
                    name="confirmPassword"
                    type="password"
                    :label="$t('Confirm Password')"
                    placeholder="********"
                    :tabindex="3"
                />
            </CardContent>
            <CardFooter class="flex justify-center">
                <Button
                    type="submit"
                    class="mt-4 w-full"
                    :disabled="isLoading"
                    :loading="isLoading"
                    :tabindex="4"
                >
                    {{ $t('Submit') }}
                </Button>
            </CardFooter>
        </Card>
    </form>
</template>
