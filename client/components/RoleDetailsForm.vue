<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter 
} from '#client/components/ui/card'
import FormTextField from '#client/components/FormTextField.vue'
import Button from '#client/components/Button.vue'
import type Role from '#shared/entities/role.entity.ts'
import schemas from '#shared/validators/index.ts'

const loading = ref(false)
const saving = ref(false)

const model = defineModel<Role>({
    type: Object,
    required: true,
})


const { handleSubmit, setValues } = useForm({
    name: 'details',
    validationSchema: toTypedSchema(schemas.role.update), 
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

    const [error] = await tryCatch(() => $fetch(`/api/roles/${model.value.id}`, {
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
                    {{ $t('Edit role details') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <FormTextField
                    name="name"
                    :label="$t('Name')"
                />
                <FormTextField
                    name="description"
                    :label="$t('Description')"
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
