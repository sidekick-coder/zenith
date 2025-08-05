<script setup lang="ts">
import { ref } from 'vue'
import Card from './ui/card/Card.vue'
import FileExplorerBreadcrumb from './FileExplorerBreadcrumb.vue'
import DriveDirectory from '#client/components/DriveDirectory.vue'

interface FileItem {
    name: string
    path: string
    type: 'file' | 'directory'
    metas: {
        mimetype?: string
        size?: number
    }
}

defineProps({
    driveId: {
        type: String,
        required: true
    },
})

const emit = defineEmits<{
    'click:entry': [item: FileItem]
}>()

const path = defineModel('path', {
    type: String,
    default: ''
})

function onDblclick(item: FileItem) {
    if (item.type === 'directory') {
        path.value = item.path
    }
}

const directoryRef = ref<InstanceType<typeof DriveDirectory>>()

function load() {
    directoryRef.value?.load()
}

defineExpose({ load, })
</script>

<template>
    <Card class="py-0 overflow-hidden rounded-md gap-0">
        <div class="border-b py-4 px-4">
            <FileExplorerBreadcrumb
                :path="path"
                @click:path="path = $event"
            />
        </div>
        
        <DriveDirectory
            ref="directoryRef"
            :drive-id="driveId"
            :path="path"
            @click:entry="emit('click:entry', $event)"
            @dblclick:entry="onDblclick"
        />

        <template v-if="$slots.footer">
            <div class="p-4 border-t">
                <slot name="footer" />
            </div>
        </template>
    </Card>
</template>

