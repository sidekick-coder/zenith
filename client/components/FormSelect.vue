<script setup lang="ts">
import { watch } from 'vue'
import { get } from 'lodash-es'
import { SelectIcon } from 'reka-ui'
import { ChevronDown } from 'lucide-vue-next'
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
import { $fetch } from '#client/utils/fetcher.ts'

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
    labelKey: {
        type: String,
        default: 'label',
    },
    valueKey: {
        type: String,
        default: 'value',
    },
    fetch: {
        type: String,
        default: null,
    },
    fetchKey: {
        type: String,
        default: null,
    },
    clearable: {
        type: Boolean,
        default: false,
    },
})

const options = defineModel('options', {
    type: Array,
    default: () => [],
})

function findLabel(option: any) {
    return option[props.labelKey] || option[props.valueKey] || option
}

function findValue(option: any) {
    return option[props.valueKey] || option
}

function findFetchOptions(response: any){
    const items =  get(response, props.fetchKey)

    if (Array.isArray(items)) {
        return items
    }

    console.warn('Fetched options is not an array:', { 
        items,
        response 
    })

    return []
}

async function fetchOptions() {
    if (!props.fetch) return

    const response = await $fetch(props.fetch)

    options.value = findFetchOptions(response)
}

watch(() => props.fetch, fetchOptions, { immediate: true })
</script>
<template>
    <FormField
        v-slot="{ componentField, setValue }"
        :name
        :disabled
        :readonly
    >
        <FormItem>
            <FormLabel>{{ label }}</FormLabel>
            <FormControl>
                <Select v-bind="componentField">
                    <SelectTrigger
                        v-if="readonly"
                        disabled
                        class="w-full disabled:opacity-100 min-h-10"
                    >
                        <select-value :placeholder="placeholder" />
                    </SelectTrigger>
                    
                    <select-trigger
                        v-else
                        class="w-full min-h-10"
                        :disabled="disabled"
                    >
                        <select-value :placeholder="placeholder" />
                    </select-trigger>
                    <select-content>
                        <select-group>
                            <select-label v-if="!options.length">
                                {{ $t('No items') }}
                            </select-label>
                            <select-item
                                v-if="clearable"
                                :value="null"
                                @click="setValue(null)"
                            >
                                {{ $t('None') }}
                            </select-item>
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