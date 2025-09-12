<script setup lang="ts">
import { Input } from '#client/components/ui/input'

defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    type: {
        type: String,
        default: 'text',
    },
    label: {
        type: String,
        required: true,
    },
    hint: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: null,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    readonly: {
        type: Boolean,
        default: false,
    },
    autocomplete: {
        type: String,
        default: 'off',
    },
    autofocus: {
        type: Boolean,
        default: false,
    }
})

defineEmits(['update:modelValue'])
</script>
<template>
    <div>
        <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-4">
            {{ label }}
        </label>
        <div class="flex gap-4">
            <Input
                :model-value="modelValue"
                :type
                :placeholder
                :disabled
                :autocomplete
                :readonly
                :autofocus
                class="h-10"
                @update:model-value="$emit('update:modelValue', $event)"
            />
            <slot name="append" />
        </div>
        <p
            v-if="hint"
            class="text-sm text-muted-foreground"
        >
            {{ hint }}
        </p>
    </div>
</template>