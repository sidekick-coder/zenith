<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { get } from 'lodash-es'
import { Check } from 'lucide-vue-next'
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
    type: Array as () => any[],
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

function isSelected(value: any) {
    return modelValue.value.includes(Number(value))
}

const isAllSelected = computed(() => {
    if (options.value.length === 0) return false
    return options.value.every((option: any) => modelValue.value.includes(Number(findValue(option))))
})

function toggleSelectAll() {
    if (isAllSelected.value) {
        modelValue.value = []
        return
    }
    
    modelValue.value = options.value.map((option: any) => Number(findValue(option)))
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
            <Select
                v-model="tempValue"
                @update:model-value="handleSelect"
            >
                <SelectTrigger
                    class="w-full min-h-10"
                    :disabled="disabled"
                >
                    <div 
                        v-if="modelValue.length > 0"
                        class="flex items-center gap-2"
                    >
                        <span class="text-sm">{{ modelValue.length }} selected</span>
                    </div>
                    <select-value 
                        v-if="modelValue.length === 0"
                        :placeholder="placeholder" 
                    />
                </SelectTrigger>
                <select-content>
                    <select-group>
                        <select-label v-if="!options.length">
                            {{ $t('No items') }}
                        </select-label>
                        <div 
                            v-if="options.length > 0"
                            class="px-2 py-1.5 cursor-pointer hover:bg-accent text-sm font-medium border-b"
                            @click="toggleSelectAll"
                        >
                            <div class="flex items-center gap-2">
                                <Check 
                                    v-if="isAllSelected"
                                    class="size-4" 
                                />
                                <div :class="{ 'ml-6': !isAllSelected }">
                                    {{ isAllSelected ? 'Unselect All' : 'Select All' }}
                                </div>
                            </div>
                        </div>
                        <select-item
                            v-for="option in options"
                            :key="findValue(option)"
                            :value="String(findValue(option))"
                        >
                            <div class="flex items-center gap-2">
                                <slot
                                    name="option"
                                    :selected="isSelected(findValue(option))"
                                    :option="option"
                                >
                                    <Check 
                                        v-if="isSelected(findValue(option))"
                                        class="size-4" 
                                    />
                                    <div :class="{ 'ml-6': !isSelected(findValue(option)) }">
                                        <slot
                                            name="option-label"
                                            :option="option"
                                        >
                                            {{ findLabel(option) }}
                                        </slot>
                                    </div>
                                </slot>
                            </div>
                        </select-item>
                    </select-group>
                </select-content>
            </Select>
        </div>
    </div>
</template>
