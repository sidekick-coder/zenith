<script setup lang="ts">
import Label from './ui/label/Label.vue'
import { Input } from '#client/components/ui/input'

defineProps({
    variant: {
        type: String,
        default: 'default',
    },
    modelValue: {
        type: [String, Number],
        default: '',
    },
    type: {
        type: String,
        default: 'text',
    },
    label: {
        type: String,
        default: null,
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
    },
    labelClass: {
        type: String,
        default: '',
    },
    inputClass: {
        type: String,
        default: '',
    },
})

defineEmits(['update:modelValue'])
</script>
<template>
    <div>
        <Label
            v-if="label && variant !== 'horizontal'"
            class="mb-4"
            :class="labelClass"
        >
            {{ label }}
        </Label>
        <div class="flex">
            <Label
                v-if="label && variant === 'horizontal'"
                class="h-10 flex items-center border px-2 rounded-l bg-secondary text-xs"
                :class="labelClass"
            >
                {{ label }}
            </Label>
            <Input
                :model-value="modelValue"
                :type
                :placeholder
                :disabled
                :autocomplete
                :readonly
                :autofocus
                :class="[label && variant === 'horizontal' ? 'rounded-l-none flex-1' : '', inputClass]"
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