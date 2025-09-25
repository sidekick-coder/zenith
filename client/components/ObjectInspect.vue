<script setup lang="ts">
import { ref } from 'vue'
import Button from '#client/components/Button.vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '#client/components/ui/dialog'
import Icon from '#client/components/Icon.vue'
import { $t } from '#shared/lang'

defineProps({
    title: {
        type: String,
        default: $t('Object Inspect')
    },
    description: {
        type: String,
        default: $t('Inspect the object data structure')
    }
})

const dialog = ref(false)

const model = defineModel({
    type: Object as () => Record<string, any>,
    required: true
})
</script>

<template>
    <Dialog v-model:open="dialog">
        <DialogTrigger as-child>
            <slot name="trigger">
                <Button
                    size="sm"
                    variant="outline"
                >
                    <Icon name="eye" />
                </Button>
            </slot>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[500px] overflow-auto max-h-[80vh]">
            <DialogHeader>
                <DialogTitle>
                    {{ title }}
                </DialogTitle>
                <DialogDescription>
                    {{ description }}
                </DialogDescription>
            </DialogHeader>

            <code class="block whitespace-pre-wrap bg-muted px-4 py-2 rounded-md">
                <pre>{{ model }}</pre>
            </code>
        </DialogContent>
    </Dialog>
</template>