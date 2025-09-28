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
import { $t } from '#shared/lang.ts'
import type { Drive } from '#client/types.ts'
import CardFooter from '#client/components/ui/card/CardFooter.vue'

const route = useRoute()
const router = useRouter()
const driveId = route.params.id as string

const drive = ref<Drive & { metas: { name?: string; description?: string; editable?: boolean } }>({
    id: '',
    metas: {}
})
const isLoading = ref(true)

const { setValues, handleSubmit } = useForm({
    validationSchema: toTypedSchema(
        v.object({
            id: v.string(),
            name: v.string(),
            description: v.string(),
        })
    ),
    initialValues: {
        id: '',
        name: '',
        description: ''
    }
})

async function loadDrive() {
    isLoading.value = true
    
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${driveId}`, { method: 'GET' }))

    if (error) {
        console.error('Failed to load drive:', error)
        isLoading.value = false
        return
    }

    drive.value = response as typeof drive.value
    
    // Set form values
    setValues({
        id: drive.value.id,
        name: drive.value.metas.name || '',
        description: drive.value.metas.description || ''
    })
    
    isLoading.value = false
}

function goToExplorer() {
    router.push(`/admin/drives/${driveId}/explorer`)
}

const onSubmit = handleSubmit(async (values) => {
    toast.warning($t('This feature is not implemented yet.'))
    // const [error, response] = await tryCatch(() => $fetch(`/api/drives/${driveId}`, {
    //     method: 'PUT',
    //     body: {
    //         id: values.id,
    //         metas: {
    //             name: values.name,
    //             description: values.description
    //         }
    //     }
    // }))

    // if (error) {
    //     console.error('Failed to update drive:', error)
    //     return
    // }

    // drive.value = response as typeof drive.value
    // $t('Drive updated successfully')
})

onMounted(loadDrive)
</script>

<template>
    <AppLayout>
        <form
            class="container mx-auto"
            @submit.prevent="onSubmit"
        >
            <Card 
                v-if="!isLoading"
            >
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
                        :readonly="!drive.metas.editable"
                    />
                    
                    <FormTextField
                        name="description"
                        :label="$t('Description')"
                        :readonly="!drive.metas.editable"
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
                        v-if="drive.metas.editable"
                        type="submit"
                        :label="$t('Save')"
                    />
                </CardFooter>
            </Card>
            
            <div 
                v-if="isLoading" 
                class="flex justify-center items-center h-64"
            >
                <div class="text-lg">
                    {{ $t('Loading...') }}
                </div>
            </div>
        </form>
    </AppLayout>
</template>