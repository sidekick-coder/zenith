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
            class="sm:max-w-none w-auto h-auto p-2"
            hide-close
        >
            <img
                :src="src"
                :alt="alt"
                class="block w-[100dvw] max-w-[80dvw] max-h-[80dvh] rounded-lg object-cover"
            >
        </DialogContent>
    </Dialog>
</template>
