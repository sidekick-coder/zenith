<script setup lang="ts">
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'

import { Input } from '#client/components/ui/input'

defineProps({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'text',
    },
    step: {
        type: String,
        default: null,
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
</script>
<template>
    <FormField
        v-slot="{ componentField }"
        :name
        :validate-on-blur="false"
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <div class="flex gap-4">
                    <Input
                        :type
                        :placeholder
                        :disabled
                        :autocomplete
                        :readonly
                        :autofocus
                        :step
                        class="h-10"
                        v-bind="componentField"
                    />
                    <slot name="append" />
                </div>
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>