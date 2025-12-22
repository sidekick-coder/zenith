<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { toast } from 'vue-sonner'
import AppLayout from '#client/layouts/AppLayout.vue'
import Button from '#client/components/Button.vue'
import FormTextField from '#client/components/FormTextField.vue'
import Card from '#client/components/ui/card/Card.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

import type { Drive } from '#client/types.ts'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import type DriveConfig from '#shared/entities/driveConfig.entity.ts'

const route = useRoute()
const router = useRouter()
const driveId = route.params.id as string

const drive = ref<DriveConfig>()
const loading = ref(true)
const saving = ref(false)

const { setValues, handleSubmit } = useForm()

async function loadDrive() {
    loading.value = true
    
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${driveId}`, { method: 'GET' }))

    if (error) {
        console.error('Failed to load drive:', error)
        loading.value = false
        return
    }

    drive.value = response as typeof drive.value
    
    // Set form values
    setValues(response)
    
    loading.value = false
}

function goToExplorer() {
    router.push(`/admin/drives/${driveId}/explorer`)
}

const onSubmit = handleSubmit(async (data) => {
    saving.value = true

    const [error] = await $fetch.try(`/api/drives/${driveId}`, {
        method: 'PUT',
        data
    })

    if (error) {
        saving.value = false
        console.error('Failed to update drive:', error)
        return
    }

    setTimeout(() => {
        toast.success('Drive updated successfully')
        saving.value = false
    }, 500)
})

onMounted(loadDrive)
</script>

<template>
    <AppLayout>
        <form @submit.prevent="onSubmit">
            <Card v-if="!loading">
                <CardHeader>
                    <CardTitle>
                        {{ $t('Drive Details') }}
                    </CardTitle>
                    <CardDescription>
                        {{ $t('Information about the selected drive') }}
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <FormTextField
                        name="id"
                        :label="$t('ID')"
                        :readonly="true"
                    />
                    
                    <FormTextField
                        name="name"
                        :label="$t('Name')"
                    />

                    <div class="pt-4" />
                </CardContent>
                <CardFooter class="flex justify-end gap-4">
                    <Button 
                        :label="$t('Explore Files')"
                        variant="outline"
                        @click="goToExplorer"
                    />

                    <Button 
                        type="submit"
                        :loading="saving"
                        :label="$t('Save')"
                    />
                </CardFooter>
            </Card>
        </form>
    </AppLayout>
</template>