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
                <Input
                    :type
                    :placeholder
                    :disabled
                    :autocomplete
                    :readonly
                    class="h-10"
                    v-bind="componentField"
                />
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>