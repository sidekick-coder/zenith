<script setup lang="ts">
import { computed, watch } from 'vue'
import { get } from 'lodash-es'
import { useFieldValue } from 'vee-validate'
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
        default: null,
    },
    fetchKey: {
        type: String,
        default: 'items',
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

const model = useFieldValue(props.name)


const formated = computed(() => options.value.map(option => ({
    label: findLabel(option),
    value: findValue(option),
    description: findDescription(option),
}))
)

const selected = computed(() => {
    return formated.value.find(o => o.value === model.value)
})

function findLabel(option: any) {
    return get(option, props.labelKey) || get(option, props.valueKey) || option
}

function findValue(option: any) {
    return get(option, props.valueKey) || option
}

function findDescription(option: any) {
    return get(option, props.descriptionKey) || ''
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
        v-slot="{ componentField, setValue, value }"
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
                        <select-value :placeholder>
                            {{ selected?.label }}
                        </select-value>
                    </SelectTrigger>
                    
                    <select-trigger
                        v-else
                        class="w-full min-h-10"
                        :disabled="disabled"
                    >
                        <select-value :placeholder>
                            {{ selected?.label }}
                        </select-value>
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