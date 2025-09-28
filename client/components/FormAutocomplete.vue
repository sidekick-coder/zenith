<script setup lang="ts" generic="T = any">
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { useField } from 'vee-validate'
import { watchDebounced } from '@vueuse/core'
import { ref  } from 'vue'
import type { PropType } from 'vue'
import Icon from './Icon.vue'
import { cn } from '#client/lib/utils'
import { Button } from '#client/components/ui/button'
import {
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '#client/components/ui/form'

import { Combobox, ComboboxAnchor, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxList } from '#client/components/ui/combobox'
import ComboboxTrigger from '#client/components/ui/combobox/ComboboxTrigger.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        default: null,
    },
    labelKey: {
        type: String,
        default: 'label',
    },
    valueKey: {
        type: String,
        default: 'value',
    },
    hint: {
        type: String,
        default: null,
    },
    placeholder: {
        type: String,
        default: null,
    },
    class: {
        type: String,
        default: null,
    },
    initialOption: {
        type: Object,
        default: null,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    fetch: {
        type: String,
        default: null,
    },
    serialize: {
        type: Function as PropType<(option: any) => T>,
        default: (option: any) => option as T,
    },
})

// general
const { setValue } = useField(props.name)
const selectedObject = ref<any>(props.initialOption)

const options = defineModel('options', {
    type: Array as () => T[],
    default: () => [],
})

const loading = defineModel('loading', {
    type: Boolean,
    default: false,
})

const search = defineModel('search', {
    type: String,
    default: '',
})

function findLabel(option: any) {
    return option[props.labelKey] || option[props.valueKey] || option
}

function findValue(option: any) {
    return option[props.valueKey] || option
}

function select(option: any) {
    selectedObject.value = option

    setValue(findValue(option))
}

// fetch
async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() => $fetch<any>(props.fetch as string, {
        method: 'GET',
        query: {
            search: search.value,
            limit: 5,
        }
    }))

    if (error) {
        console.error('Failed to load options:', error)
        options.value = []
        loading.value = false
        return
    }

    const items = response?.items || response

    options.value = items.map((i: any) => props.serialize(i))

    setTimeout(() => {
        loading.value = false
    }, 1000)
}

if (props.fetch) {
    watchDebounced(search, load, {
        immediate: true,
        debounce: 1000,
    })
}
</script>

<template>
    <FormField :name>
        <FormItem class="flex flex-col">
            <FormLabel v-if="label">
                {{ label }}
            </FormLabel>
            <Combobox
                :ignore-filter="true"
                :disabled="disabled"
            >
                <ComboboxAnchor as-child>
                    <ComboboxTrigger as-child>
                        <Button
                            variant="outline"
                            class="justify-between w-full h-auto"
                            :disabled="disabled"
                        >
                            <slot
                                v-if="selectedObject"
                                name="label"
                                :option="selectedObject"
                            >
                                {{ findLabel(selectedObject) }}
                            </slot>

                            <div v-else>
                                {{ placeholder }}
                            </div>

                            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxList
                    align="start"
                    class="w-md"
                >
                    <div class="relative w-full items-center">
                        <ComboboxInput
                            v-model="search"
                            :placeholder
                            :disabled="disabled"
                        />
                    </div>

                    <div
                        v-if="loading"
                        class="w-full p-6 flex items-center justify-center"
                    >
                        <Icon
                            name="Loader"
                            class="animate-spin mx-auto"
                        />
                    </div>

                    <ComboboxEmpty
                        v-else-if="!options.length"
                        class="px-6"
                    >
                        {{ $t('no_results') }}
                    </ComboboxEmpty>

                    <ComboboxGroup v-else>
                        <ComboboxItem
                            v-for="o in options"
                            :key="findValue(o)"
                            :value="findValue(o)"
                            @click="select(o)"
                        >
                            <slot
                                name="label"
                                :option="o"
                            >
                                {{ findLabel(o) }}
                            </slot>

                            <ComboboxItemIndicator>
                                <Check :class="cn('ml-auto h-4 w-4')" />
                            </ComboboxItemIndicator>
                        </ComboboxItem>
                    </ComboboxGroup>
                </ComboboxList>
            </Combobox>

            <FormDescription v-if="hint">
                {{ hint }}
            </FormDescription>
            <FormMessage />
        </FormItem>
    </FormField>
</template>