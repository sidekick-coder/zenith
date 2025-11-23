<script setup lang="ts">
import { ref, watch } from 'vue'
import { get } from 'lodash-es'
import { X } from 'lucide-vue-next'
import { Badge } from './ui/badge'
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
    label: {
        type: String,
        required: false
    },
    placeholder: {
        type: String,
        default: null,
    },
    disabled: {
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
})

const modelValue = defineModel({
    type: Array as () => number[],
    default: () => [],
})

const options = defineModel('options', {
    type: Array,
    default: () => [],
})

const tempValue = ref<string | null>(null)

function findLabel(option: any) {
    return option[props.labelKey] || option[props.valueKey] || option
}

function findValue(option: any) {
    return option[props.valueKey] || option
}

function findFetchOptions(response: any) {
    const items = get(response, props.fetchKey)

    if (Array.isArray(items)) {
        return items
    }

    return []
}

async function fetchOptions() {
    if (!props.fetch) return

    const response = await $fetch(props.fetch)

    options.value = findFetchOptions(response)
}

function handleSelect(value: string) {
    const numValue = Number(value)

    if (!modelValue.value.includes(numValue)) {
        modelValue.value = [...modelValue.value, numValue]
    }

    tempValue.value = null
}

function removeItem(value: number) {
    modelValue.value = modelValue.value.filter(v => v !== value)
}

function getOptionLabel(value: number) {
    const option = options.value.find((opt: any) => findValue(opt) === value)
    return option ? findLabel(option) : value
}

watch(() => props.fetch, fetchOptions, { immediate: true })
</script>
<template>
    <div class="flex flex-col gap-2">
        <label
            v-if="label"
            class="text-sm font-medium"
        >
            {{ label }}
        </label>
        <div class="flex flex-col gap-2">
            <div
                v-if="modelValue.length > 0"
                class="flex flex-wrap gap-2"
            >
                <Badge
                    v-for="value in modelValue"
                    :key="value"
                    variant="secondary"
                    class="flex items-center gap-1"
                >
                    {{ getOptionLabel(value) }}
                    <button
                        type="button"
                        class="ml-1 rounded-full hover:bg-muted"
                        @click="removeItem(value)"
                    >
                        <X class="size-3" />
                    </button>
                </Badge>
            </div>
            <Select
                v-model="tempValue"
                @update:model-value="handleSelect"
            >
                <SelectTrigger
                    class="w-full min-h-10"
                    :disabled="disabled"
                >
                    <select-value :placeholder="placeholder" />
                </SelectTrigger>
                <select-content>
                    <select-group>
                        <select-label v-if="!options.length">
                            {{ $t('No items') }}
                        </select-label>
                        <select-item
                            v-for="option in options"
                            :key="findValue(option)"
                            :value="String(findValue(option))"
                        >
                            {{ findLabel(option) }}
                        </select-item>
                    </select-group>
                </select-content>
            </Select>
        </div>
    </div>
</template>
