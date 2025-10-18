<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { $fetch } from '../utils/fetcher'
import { CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
import Button from './Button.vue'
import { Input } from './ui/input'
import { Label } from './ui/label'
import Icon from './Icon.vue'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { $t } from '#shared/lang.ts'
import { $server } from '#client/utils/server.ts'

const props = defineProps<{ 
    id: string
    module?: {
        id: string
        name: string
        enabled: boolean
        description?: string
    }
}>()

const uploading = ref(false)
const selectedFile = ref<File | null>(null)

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

async function handleUpgrade() {
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
    }

    const [error] = await tryCatch(() => 
        $server.reloadAfter({
            href: `/admin/modules/${props.id}`,
            fn: () => $fetch(`/api/modules/${props.id}/upgrade`, payload)
        })
    )

    if (error) {
        uploading.value = false
        return
    }

    toast.success($t('Module upgraded successfully'))
    
    setTimeout(() => {
        uploading.value = false
        selectedFile.value = null
        // Reset file input
        const fileInput = document.getElementById('upgrade-file') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }, 1000)
}
</script>

<template>
    <div>
        <CardHeader class="p-4">
            <CardTitle>
                {{ $t('Upgrade Module') }}
            </CardTitle>
        </CardHeader>

        <CardContent class="p-4 space-y-6">
            <div 
                v-if="props.module?.enabled"
                class="bg-red-50 border border-red-200 rounded-md p-4"
            >
                <div class="flex">
                    <div class="text-red-600">
                        <Icon
                            name="XCircle"
                            class="w-5 h-5"
                        />
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">
                            {{ $t('Module must be disabled') }}
                        </h3>
                        <div class="mt-2 text-sm text-red-700">
                            <p>{{ $t('This module is currently enabled. Please disable it before upgrading to avoid conflicts.') }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div 
                v-if="!props.module?.enabled"
                class="bg-yellow-50 border border-yellow-200 rounded-md p-4"
            >
                <div class="flex">
                    <div class="text-yellow-600">
                        <Icon
                            name="TriangleAlert"
                            class="w-5 h-5"
                        />
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-yellow-800">
                            {{ $t('Warning') }}
                        </h3>
                        <div class="mt-2 text-sm text-yellow-700">
                            <p>{{ $t('This action will replace all module files. Make sure to backup any custom changes.') }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-2">
                <Label for="upgrade-file">{{ $t('ZIP File') }}</Label>
                <Input
                    id="upgrade-file"
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

        <CardFooter class="p-4 flex justify-end">
            <Button
                :loading="uploading"
                :disabled="!selectedFile || props.module?.enabled"
                @click="handleUpgrade"
            >
                {{ $t('Upgrade') }}
            </Button>
        </CardFooter>
    </div>
</template>
