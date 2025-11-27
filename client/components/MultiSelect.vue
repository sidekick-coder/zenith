<script setup lang="ts">
import { ref, watch } from 'vue'
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
import Icon from './Icon.vue'
import Button from './Button.vue'
import { $fetch } from '#client/utils/fetcher.ts'

const props = defineProps({
    label: {
        type: String,
        default: null,
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

const model = defineModel({
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

    const response = await $fetch(props.fetch, {
        query: {
            limit: 1000,
        },
    })

    options.value = findFetchOptions(response)
}

function handleSelect(value: any) {
    const numValue = Number(value)

    if (!model.value.includes(numValue)) {
        model.value = [...model.value, numValue]
    }

    if (model.value.includes(numValue)) {
        removeItem(numValue)
    }

    tempValue.value = null
}

function removeItem(value: number) {
    model.value = model.value.filter(v => v !== value)
}

function isSelected(value: any) {
    return model.value.includes(Number(value))
}

function selectAll() {    
    model.value = options.value.map((option: any) => Number(findValue(option)))
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
                multiple
                @update:model-value="handleSelect"
            >
                <SelectTrigger
                    class="w-full min-h-10"
                    :disabled="disabled"
                >
                    <div 
                        v-if="model.length > 0"
                        class="flex items-center gap-2"
                    >
                        <span class="text-sm">{{ model.length }} selected</span>
                    </div>

                    <select-value 
                        v-if="model.length === 0"
                        :placeholder="placeholder" 
                    />

                    <Icon
                        v-if="model.length > 0"
                        name="x"
                        class="size-4 ml-auto cursor-pointer hover:text-red-500"
                        @click.stop.prevent="model = []"
                    />
                </SelectTrigger>
                <select-content class="max-h-92 overflow-y-auto">
                    <select-group>
                        <select-label v-if="!options.length">
                            {{ $t('No items') }}
                        </select-label>
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

                    <template #bottom>
                        <div class="flex space-x-2 p-2 border-t justify-end">
                            <Button
                                variant="outline"
                                :disabled="options.length === model.length"
                                @click="selectAll"
                            >
                                {{ $t('All') }}
                            </Button>
                            <Button
                                variant="outline"
                                :disabled="model.length === 0"
                                @click="model = []"
                            >
                                {{ $t('Clear') }}
                            </Button>
                        </div>
                    </template>
                </select-content>
            </Select>
        </div>
    </div>
</template>
