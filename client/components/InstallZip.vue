<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter 
} from '#client/components/ui/card'
import FormTextField from '#client/components/FormTextField.vue'
import Button from '#client/components/Button.vue'
import { Input } from '#client/components/ui/input'
import { Label } from '#client/components/ui/label'
import { $server } from '#client/utils/server.ts'

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

    const payload = {
        method: 'POST',
        body: formData,
        query: {
            id: _form.id,
        },
    }

    await $server.reloadAfter({
        href: '/admin/modules',
        fn: () => $fetch('/api/modules/install/zip', payload)
    })

    uploading.value = false

    router.push('/admin/modules')
})
</script>

<template>
    <form @submit.prevent="onSubmit">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('ZIP Module Installation') }}</CardTitle>
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
</template>
