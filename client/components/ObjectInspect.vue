<script setup lang="ts">
import { ref  } from 'vue'
import type { PropType } from 'vue'
import { computed } from 'vue'
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
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { cn } from '#client/lib/utils.ts'

defineProps({
    title: {
        type: String,
        default: $t('Object Inspect')
    },
    description: {
        type: String,
        default: $t('Inspect the object data structure')
    },
    contentClass: {
        type: String,
        default: ''
    }
})

const dialog = ref(false)

const model = defineModel({
    type: [Object, String] as PropType<Record<string, any> | string>,
    required: true
})

const parsed = computed(() => {
    if (typeof model.value === 'string') {
        const [err, obj] = tryCatch.sync(() => JSON.parse(model.value as string))

        if (err) {
            return model
        }

        return obj
    }

    return model
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
        <DialogContent :class="cn(`sm:max-w-[500px] overflow-auto max-h-[80vh]`, contentClass)">
            <DialogHeader>
                <DialogTitle>
                    {{ title }}
                </DialogTitle>
                <DialogDescription>
                    {{ description }}
                </DialogDescription>
            </DialogHeader>

            <code class="block whitespace-pre-wrap bg-muted px-4 py-2 rounded-md">
                <pre>{{ parsed }}</pre>
            </code>
        </DialogContent>
    </Dialog>
</template>