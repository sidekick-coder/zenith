<script setup lang="ts">
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { ref } from 'vue'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter 
} from '#client/components/ui/card'
import FormTextField from '#client/components/FormTextField.vue'
import Button from '#client/components/Button.vue'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/tryCatch.ts'

const props = defineProps<{ userId: string }>()
const saving = ref(false)

const schema = v.pipe(
    v.object({
        currentPassword: v.pipe(v.string(), v.minLength(6, $t('Old password required'))),
        password: v.pipe(v.string(), v.minLength(6, $t('New password required'))),
        confirmPassword: v.pipe(v.string(), v.minLength(6, $t('Confirm password required'))),
    }),
    v.forward(
        v.partialCheck(
            [['password'], ['confirmPassword']],
            (input) => input.password === input.confirmPassword,
            $t('Passwords do not match.')
        ),
        ['confirmPassword']
    )
)

const { handleSubmit } = useForm({
    validationSchema: toTypedSchema(schema),
    initialValues: {
        currentPassword: '',
        password: '',
        confirmPassword: '',
    },
})

const onSubmit = handleSubmit(async (values) => {
    saving.value = true

    const [error] = await tryCatch(() =>$fetch(`/api/users/${props.userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
    }))

    if (error) {
        saving.value = false
        return
    }

    setTimeout(() => {
        saving.value = false
        toast.success($t('Password changed successfully.'))
    }, 800)
})
</script>

<template>
    <form @submit.prevent="onSubmit">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('Password') }}</CardTitle>
                <CardDescription>
                    {{ $t('Change the password for this user account.') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <FormTextField
                    name="currentPassword"
                    :label="$t('Old Password')"
                    type="password"
                />
                <FormTextField
                    name="password"
                    :label="$t('New Password')"
                    type="password"
                />
                <FormTextField
                    name="confirmPassword"
                    :label="$t('Confirm New Password')"
                    type="password"
                />
            </CardContent>
            <CardFooter class="flex justify-end">
                <Button type="submit">
                    {{ $t('Change Password') }}
                </Button>
            </CardFooter>
        </Card>
    </form>
</template>
