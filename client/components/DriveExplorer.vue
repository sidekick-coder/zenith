<script setup lang="ts">
import { ref, watch } from 'vue'
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

const props = defineProps<{
    driveId: string
    pwd?: string
}>()

const emit = defineEmits<{
    'click:entry': [item: FileItem]
}>()

const currentPath = ref(props.pwd || '')

function onDblclick(item: FileItem) {
    console.log('Double clicked:', item)
    if (item.type === 'directory') {
        currentPath.value = item.path
    }
}

watch(() => props.pwd, (newPwd) => {
    currentPath.value = newPwd || ''
})
</script>

<template>
    <FileExplorerBreadcrumb
        :path="currentPath"
        class="mb-4"
        @click:path="currentPath = $event"
    />
    <Card class="py-0 overflow-hidden rounded-md gap-0">
        <DriveDirectory
            :drive-id="driveId"
            :path="currentPath"
            @click:entry="emit('click:entry', $event)"
            @dblclick:entry="onDblclick"
        />
    </Card>
</template>

