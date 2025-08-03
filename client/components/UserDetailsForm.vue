<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/tryCatch.ts'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter 
} from '#client/components/ui/card'
import FormTextField from '#client/components/FormTextField.vue'
import Button from '#client/components/Button.vue'

const props = defineProps<{ userId: string }>()
const router = useRouter()
const loading = ref(false)
const saving = ref(false)

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
    const [error, response] = await tryCatch(() => $fetch(`/api/users/${props.userId}`))

    if (error) {
        loading.value = false
        toast.error($t('Failed to load user details.'))
        router.push('/users')
        return
    }

    setValues(response)

    setTimeout(() => {
        loading.value = false
    }, 800)
}


const onSubmit = handleSubmit(async (form) => {
    saving.value = true

    const [error] = await tryCatch(() => $fetch(`/api/users/${props.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
    }))

    if (error) {
        toast.error($t('Failed to update user details.'))
        saving.value = false
        return
    }

    setTimeout(() => {
        saving.value = false
        toast.success($t('User details updated successfully.'))
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
