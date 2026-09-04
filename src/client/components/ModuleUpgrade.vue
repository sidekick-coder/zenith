<script setup lang="ts">
import { ref, computed } from 'vue'
import UpgradeZip from '#client/components/ModuleUpgradeZip.vue'
import UpgradeGit from '#client/components/ModuleUpgradeGit.vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '#client/components/ui/dialog'

const props = defineProps({
    module: {
        type: Object,
        required: true
    }
})

const upgrading = ref(false)
</script>

<template>
    <div class="space-y-6">
        <UpgradeZip
            v-model:upgrading="upgrading"
            :module="props.module"
        />
        <UpgradeGit
            v-model:upgrading="upgrading"
            :module="props.module"
        />
    </div>

    <Dialog :open="upgrading">
        <DialogContent :hide-close="true">
            <DialogHeader>
                <DialogTitle>{{ $t('Upgrading module') }}</DialogTitle>
                <DialogDescription>
                    {{ $t('Please wait while the module is being upgraded...') }}
                </DialogDescription>
            </DialogHeader>
        </DialogContent>
    </Dialog>
</template>
