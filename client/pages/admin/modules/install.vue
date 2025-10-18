<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter 
} from '#client/components/ui/card'
import FormTextField from '#client/components/FormTextField.vue'
import Button from '#client/components/Button.vue'
import { Input } from '#client/components/ui/input'
import { Label } from '#client/components/ui/label'
import AppLayout from '#client/layouts/AppLayout.vue'

const router = useRouter()
const uploading = ref(false)
const selectedFile = ref<File | null>(null)

const schema = v.object({
    id: v.pipe(v.string(), v.minLength(1, $t('Module ID is required'))),
})

const { handleSubmit, setFieldValue } = useForm({
    name: 'install',
    validationSchema: toTypedSchema(schema),
})

function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    
    if (!file) {
        selectedFile.value = null
        return
    }

    if (!file.name.endsWith('.zip') && !file.type.includes('zip')) {
        toast.error($t('Please select a ZIP file'))
        selectedFile.value = null
        return
    }

    selectedFile.value = file
    
    // Extract client name from filename and set as ID
    const clientName = file.name.replace('.zip', '')
    setFieldValue('id', clientName)
}

const onSubmit = handleSubmit(async (_form) => {
    if (!selectedFile.value) {
        toast.error($t('Please select a file'))
        return
    }

    uploading.value = true

    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const [error] = await tryCatch(() => $fetch('/api/modules/install/zip', {
        method: 'POST',
        query: {
            id: _form.id,
        },
        body: formData,
    }))

    if (error) {
        toast.error($t('Failed to install module: :0', [error.message || 'Unknown error']))
        uploading.value = false
        return
    }

    setTimeout(() => {
        uploading.value = false
        toast.success($t('Module installed successfully'))
        router.push('/admin/modules')
    }, 800)
})
</script>

<template>
    <AppLayout>
        <div class="space-y-6">
            <div>
                <h1 class="text-2xl font-bold">
                    {{ $t('Install Module') }}
                </h1>
                <p class="text-muted-foreground">
                    {{ $t('Upload a ZIP file containing a module to install it') }}
                </p>
            </div>
    
            <form @submit.prevent="onSubmit">
                <Card>
                    <CardHeader>
                        <CardTitle>{{ $t('Module Installation') }}</CardTitle>
                        <CardDescription>
                            {{ $t('Select a ZIP file containing the module files and provide a module ID') }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-6">
                        <FormTextField
                            name="id"
                            :label="$t('Module ID')"
                            :placeholder="$t('Enter module identifier')"
                        />
                        
                        <div class="space-y-2">
                            <Label for="file">{{ $t('ZIP File') }}</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".zip,application/zip"
                                :disabled="uploading"
                                @change="handleFileSelect"
                            />
                            <p class="text-sm text-muted-foreground">
                                {{ $t('Select a ZIP file containing the module') }}
                            </p>
                        </div>
    
                        <div 
                            v-if="selectedFile" 
                            class="p-3 bg-muted rounded-md"
                        >
                            <div class="flex items-center space-x-2">
                                <div class="text-sm font-medium">
                                    {{ $t('Selected file:') }}
                                </div>
                                <div class="text-sm">
                                    {{ selectedFile.name }}
                                </div>
                                <div class="text-xs text-muted-foreground">
                                    ({{ Math.round(selectedFile.size / 1024) }} KB)
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter class="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            :disabled="uploading"
                            @click="router.push('/admin/modules')"
                        >
                            {{ $t('Cancel') }}
                        </Button>
                        <Button
                            type="submit"
                            :loading="uploading"
                            :disabled="!selectedFile"
                        >
                            {{ $t('Install') }}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    </AppLayout>
</template>
