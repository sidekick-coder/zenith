<script setup lang="ts">
import Button from './Button.vue'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '#client/components/ui/alert-dialog'
import { $t } from '#shared/lang.ts'
import ClientOnly from './ClientOnly.vue';

defineOptions({ inheritAttrs: false })

defineProps({
    title: {
        type: String,
        default: $t('Are you sure?')
    },
    description: {
        type: String,
        default: $t('This action cannot be undone.')
    }
})

const emit = defineEmits<{
    confirm: []
}>()

</script>

<template>
    <ClientOnly>
        <template #fallback>
            <Button v-bind="$attrs">
                <slot />
            </Button>
        </template>
        <AlertDialog>
            <AlertDialogTrigger>
                <Button v-bind="$attrs">
                    <slot />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{{ title }}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {{ description }}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{{ $t('Cancel') }}</AlertDialogCancel>
                    <AlertDialogAction @click="emit('confirm')">
                        {{ $t('Confirm') }}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </ClientOnly>
</template>