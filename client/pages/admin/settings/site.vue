<script lang="ts" setup>
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { $t } from '#shared/lang.ts'
import FormTextField from '#client/components/FormTextField.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import Button from '#client/components/Button.vue'
import { tryCatch } from '#shared/tryCatch.ts'
import Card from '#client/components/ui/card/Card.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'
import settingSiteValidator from '#shared/validators/settingSite.validator.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'

const loading = ref(false)
const saving = ref(false)
const { handleSubmit, setValues } = useForm({ validationSchema: toTypedSchema(settingSiteValidator.create), })

const onSubmit = handleSubmit(async (form) => {
    saving.value = true

    const [error] = await tryCatch(() => {
        return $fetch('/api/settings/site', {
            method: 'PUT',
            data: form,
        })
    })

    if (error) {
        saving.value = false
        return
    }
    
    setTimeout(() => {
        saving.value = false
        toast.success($t('Updated successfully'))
    }, 1000)
})

async function load(){
    loading.value = true

    const [error, response] = await tryCatch(() => $fetch<any>('/api/settings/site'))

    if (error) return

    setValues(response)

    setTimeout(() => {
        loading.value = false
    }, 1000)
}

onMounted(load)
</script>
<template>
    <AppLayout>
        <form
            class="space-y-4 py-2"
            @submit.prevent="onSubmit"
        >
            <Card :loading="loading">
                <CardHeader>
                    <CardTitle>{{ $t('Site') }}</CardTitle>
                    <CardDescription>
                        {{ $t('Configure site') }}
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-6">
                    <FormTextField
                        name="home_route_path"
                        :label="$t('Home route path')"
                    />
                </CardContent>
     
                <CardFooter class="justify-end">
                    <Button
                        type="submit"
                        :loading="saving"
                    >
                        {{ $t('Save') }}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </AppLayout>
</template>