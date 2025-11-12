<script setup lang="ts">
import { watch } from 'vue'
import { get } from 'lodash-es'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from './ui/select'
import Label from './ui/label/Label.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { cn } from '#client/lib/utils.ts'

const props = defineProps({
    variant: {
        type: String,
        default: 'default',
    },
    label: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
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
        default: '',
    },
    fetchKey: {
        type: String,
        default: '',
    },
    labelClass: {
        type: String,
        default: '',
    },
})

const modelValue = defineModel<any>({ required: true })

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

function findFetchOptions(response: any) {
    if (!props.fetchKey) {
        return response
    }
    return get(response, props.fetchKey)
}

async function fetchOptions() {
    if (!props.fetch) return

    try {
        const response = await $fetch(props.fetch)
        options.value = findFetchOptions(response)
    } catch (error) {
        console.error('Failed to fetch options:', error)
    }
}

watch(() => props.fetch, fetchOptions, { immediate: true })
</script>

<template>
    <div>
        <Label
            v-if="label && variant !== 'horizontal'"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-4"
            :class="labelClass"
        >
            {{ label }}
        </Label>

        <div class="flex">
            <Label
                v-if="variant === 'horizontal'"
                class="h-10 flex items-center border px-2 rounded-l bg-secondary text-xs"
                :class="labelClass"
            >
                {{ label }}
            </Label>
            <Select
                v-model="modelValue"
                :disabled="disabled"
            >
                <SelectTrigger
                    :class="cn('!h-10', variant === 'horizontal' ? 'rounded-l-none flex-1' : 'w-full', $attrs.class as any)"
                >
                    <SelectValue :placeholder="placeholder" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel v-if="!options.length">
                            {{ $t('no_results') }}
                        </SelectLabel>
                        <SelectItem
                            v-for="option in options"
                            :key="findValue(option)"
                            :value="findValue(option)"
                        >
                            {{ findLabel(option) }}
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    </div>
</template>