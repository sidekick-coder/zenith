<script setup lang="ts">
import { computed, ref } from 'vue'
import { template } from 'lodash-es'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { $file } from '#client/utils/file.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import type UploadSession from '#shared/entities/fileUploadSession.entity.ts'
import { $acl } from '#client/composables/useAcl.ts'

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    public: {
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
    mimetypes: {
        type: String,
        default: '*/*',
    },
})

const emit = defineEmits<{
    (e: 'uploaded'): void
}>()

const fileId = defineModel<number | undefined | null>('fileId', {
    type: Number,
})

const fileUrl = defineModel<string | undefined | null>('fileUrl', {
    type: String,
})

const loading = defineModel<boolean>('loading', {
    type: Boolean,
    default: false,
})

const hasPermission = computed(() => {
    const data = {
        purpose: props.purpose,
        folder: props.folder,
        max_size: props.maxSize,
        mime_types: props.mimetypes,
    }

    // console.log(data)
    return $acl.can('create', 'FileUploadSession', data)
})

async function createSession(file: File){
    return await $fetch<UploadSession>('/api/file-upload-sessions', {
        method: 'POST',
        data: {
            public: props.public,
            folder: props.folder,
            client_name: file.name,
            purpose: props.purpose,
            mime_types: props.mimetypes,
            max_size: props.maxSize,
        },
    })
}

async function upload(file: File, url: string) {
    // Upload file using session URL
    const form = new FormData()
    
    form.append('file', file)

    return await $fetch(url, {
        method: 'POST',
        body: form,
    })
}

async function createServerFile(url: string) {
    return await $fetch(url, {
        method: 'POST',
    })
}

async function execute() {
    const file = await $file.pick({
        multiple: false,
        accept: props.mimetypes,
    })
    
    if (!file) return false

    const session = await createSession(file)

    await upload(file, session.upload_url!)

    const response = await createServerFile(session.create_file_url!)

    fileId.value = response.id
    fileUrl.value = response.url

    return true
}

async function handle() {
    loading.value = true
    
    const [error, response] = await tryCatch(() => execute())

    if (error || !response) {
        loading.value = false
        return
    }

    setTimeout(() => {
        emit('uploaded')
        loading.value = false
    }, 500)
}
</script>

<template>
    <slot
        v-if="hasPermission"
        :handle="handle"
        :loading="loading"
    >
        <Button
            type="button"
            variant="outline"
            :loading="loading"
            :disabled="disabled"
            @click="handle"
        >
            <Icon 
                name="Upload" 
                class="size-4 mr-2" 
            />
            {{ $t('Upload') }}
        </Button>
    </slot>
    <Button
        v-else
        type="button"
        variant="outline"
        disabled
        class="text-xs text-red-600 mt-1 block"
    >
        {{ $t('Missing permissions for file upload') }}
    </Button>
</template>