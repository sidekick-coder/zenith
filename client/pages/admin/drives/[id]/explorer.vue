<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { useRouteQuery } from '@vueuse/router'
import DriveExplorer from '#client/components/DriveExplorer.vue'
import AppLayout from '#client/layouts/AppLayout.vue'
import Button from '#client/components/Button.vue'
import { $file } from '#client/utils/file.ts'

const route = useRoute()
const path = useRouteQuery('path', '')
const explorerRef = ref<InstanceType<typeof DriveExplorer>>()
const driveId = computed(() => {
    return route.params.id as string
})

async function upload() {
    const files = await $file.pick({
        accept: '*/*',
        multiple: true,
    })

    if (!files.length) return

    for await (const file of files) {
        await $file.upload({
            driveId: driveId.value,
            file,
            directory: path.value
        })
    }

    toast.success('Files uploaded successfully!')

    explorerRef.value?.load() // Reload the explorer to reflect new files
}

</script>

<template>
    <AppLayout>
        <DriveExplorer
            ref="explorerRef"
            v-model:path="path"
            :drive-id
        >
            <template #footer>
                <div class="flex items-center justify-end">
                    <Button @click="upload">
                        {{ $t('Upload') }}
                    </Button>
                </div>
            </template>
        </DriveExplorer>
    </AppLayout>
</template>