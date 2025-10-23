<script setup lang="ts">
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'
import FileUploader from '#client/components/FileUploader.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import { $t } from '#shared/lang.ts'

defineProps({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    hint: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    purpose: {
        type: String,
        required: true,
    },
    folder: {
        type: String,
        default: null,
    },
    maxSize: {
        type: Number,
        default: 10 * 1024 * 1024, // 10MB default
    },
})

const loading = defineModel<boolean>('loading', {
    type: Boolean,
    default: false,
})

const fileUrl = defineModel<string | undefined | null>('fileUrl', {
    type: String,
})

function clearImage() {
    fileUrl.value = null
}
</script>

<template>
    <FormField
        v-slot="{ value, setValue }"
        :name
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <div class="flex flex-col items-baseline space-y-4">
                    <!-- Image Preview -->
                    <div
                        v-if="fileUrl"
                        class="relative inline-block border rounded-lg overflow-hidden"
                    >
                        <img
                            :src="fileUrl"
                            :alt="$t('Uploaded image')"
                            class="max-w-xs max-h-48 object-cover"
                        >
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            class="absolute top-2 right-2"
                            :disabled="disabled"
                            @click="clearImage"
                        >
                            <Icon
                                name="X"
                                class="size-4"
                            />
                        </Button>
                    </div>

                    <!-- File Uploader -->
                    <FileUploader
                        v-model:file-url="fileUrl"
                        v-model:loading="loading"
                        :file-id="value"
                        :purpose="purpose"
                        :folder="folder"
                        :max-size="maxSize"
                        :disabled="disabled"
                        mimetypes="image/*"
                        @update:file-id="setValue"
                    >
                        <template #default="{ handle, loading: uploading }">
                            <Button
                                type="button"
                                variant="outline"
                                :loading="uploading"
                                :disabled="disabled"
                                @click="handle"
                            >
                                <Icon
                                    name="ImagePlus"
                                    class="size-4 mr-2"
                                />
                                {{ fileUrl ? $t('Change image') : $t('Upload image') }}
                            </Button>
                        </template>
                    </FileUploader>
                </div>
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>
