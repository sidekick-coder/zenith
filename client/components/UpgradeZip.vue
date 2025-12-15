<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'

import { $fetch } from '#client/utils/fetcher.ts'
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter 
} from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import { Input } from '#client/components/ui/input'
import { Label } from '#client/components/ui/label'
import { $server } from '#client/utils/server.ts'

const props = defineProps({
    module: {
        type: Object,
        required: true
    }
})

const router = useRouter()
const uploading = ref(false)
const selectedFile = ref<File | null>(null)

const { handleSubmit } = useForm({
    name: 'upgrade-zip'
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
}

const onSubmit = handleSubmit(async () => {
    if (!selectedFile.value) {
        toast.error($t('Please select a file'))
        return
    }

    uploading.value = true

    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('id', props.module.id)

    const payload = {
        method: 'POST',
        body: formData,
    }

    const success = await $server.reloadAfter({
        href: '/admin/modules',
        fn: () => $fetch('/api/modules/upgrade/zip', payload)
    })

    if (!success) {
        uploading.value = false
        return
    }

    uploading.value = false
    router.push('/admin/modules')
})
</script>

<template>
    <form @submit.prevent="onSubmit">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('ZIP Module Upgrade') }}</CardTitle>
                <CardDescription>
                    {{ $t('Select an existing module and upload a ZIP file to upgrade it') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-6">
                <div class="p-3 bg-muted rounded-md">
                    <div class="text-sm font-medium">
                        {{ $t('Module to upgrade:') }} {{ props.module.name }}
                    </div>
                    <div class="text-xs text-muted-foreground">
                        {{ $t('ID:') }} {{ props.module.id }}
                    </div>
                </div>
                
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
                        {{ $t('Select a ZIP file containing the updated module') }}
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
                    {{ $t('Upgrade') }}
                </Button>
            </CardFooter>
        </Card>
    </form>
</template>