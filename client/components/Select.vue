<script setup lang="ts">
import { computed, watch } from 'vue'
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
import Button from './Button.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { cn } from '#client/lib/utils.ts'

const props = defineProps({
    id: {
        type: String,
        default: '',
    },
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
    descriptionKey: {
        type: String,
        default: null,
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
        default: 'items',
    },
    labelClass: {
        type: String,
        default: '',
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    multiple: {
        type: Boolean,
        default: false,
    },
})

const model = defineModel<any>({ 
    required: true,
    default: null
})

const formated = computed(() => options.value.map(option => ({
    label: findLabel(option),
    value: findValue(option),
    description: findDescription(option),
})))

const options = defineModel('options', {
    type: Array,
    default: () => [],
})

function findLabel(option: any) {
    return get(option, props.labelKey) || option
}

function findValue(option: any) {
    return get(option, props.valueKey) || option
}

function findDescription(option: any) {
    if (!props.descriptionKey) {
        return null
    }
    return get(option, props.descriptionKey)
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

function all() {
    model.value = options.value.map((option) => findValue(option))
}

function clear(){
    model.value = []
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
                :id
                v-model="model"
                :disabled="disabled"
                :multiple="multiple"
            >
                <SelectTrigger
                    :class="cn('!h-10', variant === 'horizontal' ? 'rounded-l-none flex-1' : 'w-full', $attrs.class as any)"
                >
                    <div 
                        v-if="multiple && model?.length > 2"
                        class="flex items-center gap-2"
                    >
                        <span class="text-sm">{{ model.length }} selected</span>
                    </div>

                    <SelectValue
                        v-else
                        :placeholder="placeholder"
                    />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel v-if="!options.length">
                            {{ $t('No items') }}
                        </SelectLabel>
                        <select-item
                            v-if="clearable && !multiple"
                            :value="null"
                            @click="model = multiple ? [] : null"
                        >
                            {{ $t('None') }}
                        </select-item>
                        <select-item
                            v-for="o in formated"
                            :key="o.value"
                            :value="o.value"
                        >
                            <div class="flex flex-col">
                                <span>{{ o.label }}</span>
                                <span
                                    v-if="descriptionKey"
                                    class="text-xs text-muted-foreground white-space-normal break-words mt-0.5"
                                >
                                    {{ o.description }}
                                </span>
                            </div>
                        </select-item>
                    </SelectGroup>

                    <template
                        v-if="multiple"
                        #bottom
                    >
                        <div class="flex space-x-2 p-2 border-t justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                :disabled="options.length === model?.length"
                                @click="all"
                            >
                                {{ $t('All') }}
                            </Button>
                            <Button
                                v-if="clearable"
                                variant="outline"
                                size="sm"
                                :disabled="model?.length === 0"
                                @click="clear"
                            >
                                {{ $t('Clear') }}
                            </Button>
                        </div>
                    </template>
                </SelectContent>
            </Select>
        </div>
    </div>
</template>