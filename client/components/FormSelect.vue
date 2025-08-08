<script setup lang="ts">
import { FormField } from './ui/form'
import FormControl from './ui/form/FormControl.vue'
import FormDescription from './ui/form/FormDescription.vue'
import FormItem from './ui/form/FormItem.vue'
import FormLabel from './ui/form/FormLabel.vue'
import FormMessage from './ui/form/FormMessage.vue'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from './ui/select'

const props = defineProps({
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
    options: {
        type: Array,
        default: () => [],
    },
    labelKey: {
        type: String,
        default: 'label',
    },
    valueKey: {
        type: String,
        default: 'value',
    },
})

function findLabel(option: any) {
    return option[props.labelKey] || option[props.valueKey] || option
}

function findValue(option: any) {
    return option[props.valueKey] || option
}
</script>
<template>
    <FormField
        v-slot="{ componentField }"
        :name
        :disabled
        :readonly
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <Select
                    v-bind="componentField"
                    :disabled
                    :readonly
                >
                    <select-trigger class="w-full">
                        <select-value :placeholder="placeholder" />
                    </select-trigger>
                    <select-content>
                        <select-group>
                            <select-label v-if="!options.length">
                                {{ $t('no_results') }}
                            </select-label>
                            <select-item
                                v-for="option in options"
                                :key="findValue(option)"
                                :value="findValue(option)"
                            >
                                {{ findLabel(option) }}
                            </select-item>
                        </select-group>
                    </select-content>
                </Select>
            </FormControl>
            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>