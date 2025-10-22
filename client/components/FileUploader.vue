<script setup lang="ts">
import { ref } from 'vue'
import { template } from 'lodash-es'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { $file } from '#client/utils/file.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import type UploadSession from '#shared/entities/fileUploadSession.entity.ts'

const props = defineProps({
    label: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    accept: {
        type: String,
        default: '*/*',
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
    filename: {
        type: String,
        required: true,
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

async function createSession(file: File){
    let filename = props.filename

    const templateFn = template(filename, {
        interpolate: /\{([\s\S]+?)\}/g,
    })
    
    const ext = file.name.split('.').pop() || ''

    filename = templateFn({ 
        ext: ext
    })

    return await $fetch<UploadSession>('/api/upload-sessions', {
        method: 'POST',
        data: {
            filename: filename,
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
        accept: props.accept,
    })
    
    if (!file) return

    const session = await createSession(file)

    await upload(file, session.upload_url!)

    const response = await createServerFile(session.create_file_url!)

    fileId.value = response.id
    fileUrl.value = response.url
}

async function handle() {
    loading.value = true
    
    const [error] = await tryCatch(() => execute())

    if (error) {
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
</template>