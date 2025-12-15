<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import * as v from 'valibot'

import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import FormTextField from '#client/components/FormTextField.vue'
import Button from '#client/components/Button.vue'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '#client/components/ui/card'
import type File from '#shared/entities/file.entity.ts'

const props = defineProps({
    fileId: {
        type: String,
        required: true
    }
})

const file = defineModel<File>()

const loading = ref(false)
const saving = ref(false)

const schema = toTypedSchema(v.object({
    client_name: v.pipe(v.string(), v.minLength(1)),
    drive: v.string(),
    mimetype: v.string(),
}))

const { handleSubmit, setValues } = useForm({
    validationSchema: schema,
})

const onSubmit = handleSubmit(async (payload) => {
    if (!file.value) return

    saving.value = true

    const [error] = await tryCatch(() => $fetch(`/api/files/${props.fileId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json'
        }
    }))

    saving.value = false

    if (error) {
        toast.error($t('Failed to update file details.'))
        return
    }

    Object.assign(file.value, payload)
    toast.success($t('File details updated successfully.'))
})

async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() => $fetch<File>(`/api/files/${props.fileId}`))

    if (error) {
        loading.value = false
        toast.error($t('Failed to load file details.'))
        return
    }

    file.value = response

    setValues({
        client_name: response.client_name,
        drive: response.drive,
        mimetype: response.mimetype,
    })

    setTimeout(() => {
        loading.value = false
    }, 800)
}

onMounted(load)
</script>

<template>
    <form @submit.prevent="onSubmit">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('Details') }}</CardTitle>
                <CardDescription>
                    {{ $t('Edit file details such as name, drive, and mimetype.') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <FormTextField
                    name="client_name"
                    :label="$t('Client Name')"
                    readonly
                />
                <FormTextField
                    name="drive"
                    :label="$t('Drive')"
                    readonly
                />
                <FormTextField
                    name="mimetype"
                    :label="$t('Mimetype')"
                    readonly
                />
            </CardContent>
        </Card>
    </form>
</template>