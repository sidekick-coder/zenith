<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter 
} from '#client/components/ui/card'
import FormTextField from '#client/components/FormTextField.vue'
import Button from '#client/components/Button.vue'
import type User from '#shared/entities/user.entity.ts'

const loading = ref(false)
const saving = ref(false)

const model = defineModel<User>({
    type: Object,
    required: true,
})

const schema = v.object({
    name: v.pipe(v.string(), v.minLength(2, $t('Name is required'))),
    username: v.pipe(v.string(), v.minLength(2, $t('Username is required'))),
    email: v.pipe(v.string(), v.email($t('Invalid email'))),
})

const { handleSubmit, setValues } = useForm({
    name: 'details',
    validationSchema: toTypedSchema(schema), 
})

async function load(){
    loading.value = true

    setValues(model.value)

    setTimeout(() => {
        loading.value = false
    }, 800)
}


const onSubmit = handleSubmit(async (form) => {
    saving.value = true

    const [error] = await tryCatch(() => $fetch(`/api/users/${model.value.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
    }))

    if (error) {
        toast.error($t('Failed to update.'))
        saving.value = false
        return
    }

    model.value = {
        ...model.value,
        ...form 
    }

    setTimeout(() => {
        saving.value = false
        toast.success($t('Updated successfully.'))
    }, 800)
})

onMounted(load)
</script>

<template>
    <form @submit.prevent="onSubmit">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('Details') }}</CardTitle>
                <CardDescription>
                    {{ $t('Edit user details such as name, username, and email.') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <FormTextField
                    name="name"
                    :label="$t('Name')"
                />
                <FormTextField
                    name="username"
                    :label="$t('Username')"
                />
                <FormTextField
                    name="email"
                    :label="$t('Email')"
                />
            </CardContent>
            <CardFooter class="flex justify-end">
                <Button
                    type="submit"
                    :loading="saving"
                >
                    {{ $t('Update') }}
                </Button>
            </CardFooter>
        </Card>
    </form>
</template>
