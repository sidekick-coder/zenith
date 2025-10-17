<script setup lang="ts">
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '#client/components/ui/dialog'

defineProps({
    src: {
        type: String,
        required: true,
    },
    alt: {
        type: String,
        default: null,
    },
})

</script>

<template>
    <Dialog>
        <DialogTrigger as-child>
            <img
                :src="src"
                :alt="alt"
                v-bind="$attrs"
            >
        </DialogTrigger>
            
        <DialogContent 
            class="sm:max-w-auto w-auto p-0 h-auto bg-transparent border-0 shadow-none"
            hide-close
        >
            <img
                :src="src"
                :alt="alt"
                class="block h-[100dvw] max-h-[80dvh] rounded-lg object-contain"
            >
        </DialogContent>
    </Dialog>
</template>
