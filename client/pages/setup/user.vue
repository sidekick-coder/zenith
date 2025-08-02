<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/valibot'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import Button from '#app/components/Button.vue'
import Card from '#app/components/ui/card/Card.vue'
import CardDescription from '#app/components/ui/card/CardDescription.vue'
import CardFooter from '#app/components/ui/card/CardFooter.vue'
import CardHeader from '#app/components/ui/card/CardHeader.vue'
import CardTitle from '#app/components/ui/card/CardTitle.vue'
import { tryCatch } from '#common/tryCatch.ts'
import { $fetch } from '#app/utils/fetcher.ts'
import FormTextField from '#app/components/FormTextField.vue'
import CardContent from '#app/components/ui/card/CardContent.vue'
import { $t } from '#common/lang.ts'

const isLoading = ref(false)
const router = useRouter()

const { handleSubmit } = useForm({
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

const onSubmit = handleSubmit(async (payload) => {
    isLoading.value = true

    const [error] = await tryCatch(() => {
        return $fetch('/setup/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(payload),
        })
    })

    if (error) {
        isLoading.value = false
        return
    }

    toast.success('User setup completed successfully!')

    setTimeout(async () => {
        isLoading.value = false
        router.push('/admin/login')
    }, 1000)
})
</script>

<template>
    <form
        class="h-dvh w-dvw flex items-center justify-center"
        @submit.prevent="onSubmit"
    >
        <Card
            class="w-full max-w-md"
        >
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