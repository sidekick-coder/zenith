<script setup lang="ts" generic="T = any">
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { useField } from 'vee-validate'
import { watchDebounced } from '@vueuse/core'
import { ref  } from 'vue'
import type { PropType } from 'vue'
import Icon from './Icon.vue'
import Separator from './ui/separator/Separator.vue'
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
import { Avatar } from '#client/components/ui/avatar'
import AvatarImage from '#client/components/ui/avatar/AvatarImage.vue'
import AvatarFallback from '#client/components/ui/avatar/AvatarFallback.vue'
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
    subtitleKey: {
        type: String,
        default: 'subtitle',
    },
    avatarKey: {
        type: String,
        default: 'avatar',
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
    clearable: {
        type: Boolean,
        default: false,
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
    fetchOption: {
        type: Function as PropType<(value: any) => Promise<any>>,
        default: null,
    },
    serialize: {
        type: Function as PropType<(option: any) => T>,
        default: (option: any) => option as T,
    },
})

// general
const { setValue, value } = useField(props.name)
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

function findSubtitle(option: any) {
    return option[props.subtitleKey] || null
}

function findAvatar(option: any) {
    return option[props.avatarKey] || null
}

function findAvatarInitial(option: any) {
    const label = findLabel(option)
    
    if (label) {
        return String(label)
            .charAt(0)
            .toUpperCase()
    }

    return 'A'
}

function findValue(option: any) {
    return option[props.valueKey] || option
}

function select(option: any) {
    if (!option) {
        selectedObject.value = null
        setValue(null)
        return
    }

    selectedObject.value = option

    setValue(findValue(option))
}

// fetch
async function loadSelected(){
    if (!props.fetchOption || !value.value) {
        return
    }

    loading.value = true

    const [error, response] = await tryCatch(() => props.fetchOption!(value.value))

    if (error) {
        console.error('Failed to load selected option:', error)
        loading.value = false
        return
    }

    selectedObject.value = props.serialize(response)

    setTimeout(() => {
        loading.value = false
    }, 500)
}
async function load() {
    loading.value = true

    await loadSelected()

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
    }, 500)
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
                            class="justify-between w-full h-auto min-h-10"
                            :disabled="disabled"
                        >
                            <div
                                v-if="selectedObject"
                                class="flex items-center gap-2 text-left"
                            >
                                <div
                                    v-if="avatarKey"
                                    class="flex-shrink-0"
                                >
                                    <slot
                                        name="avatar"
                                        :option="selectedObject"
                                    >
                                        <Avatar class="size-6">
                                            <AvatarImage
                                                v-if="findAvatar(selectedObject)"
                                                :src="findAvatar(selectedObject)"
                                                :alt="findLabel(selectedObject)"
                                            />
                                            <AvatarFallback>
                                                {{ findAvatarInitial(selectedObject) }}
                                            </AvatarFallback>
                                        </Avatar>
                                    </slot>
                                </div>
                                <div class="flex flex-col items-start flex-1">
                                    <slot
                                        name="label"
                                        :option="selectedObject"
                                    >
                                        {{ findLabel(selectedObject) }}
                                    </slot>
                                    <div
                                        v-if="findSubtitle(selectedObject)"
                                        class="text-sm text-muted-foreground"
                                    >
                                        <slot
                                            name="subtitle"
                                            :option="selectedObject"
                                        >
                                            {{ findSubtitle(selectedObject) }}
                                        </slot>
                                    </div>
                                </div>
                            </div>

                            <div v-else>
                                {{ placeholder }}
                            </div>

                            <div class="ml-2 flex items-center space-x-2">
                                <Icon
                                    v-if="loading"
                                    name="Loader2"
                                    class="animate-spin"
                                />

                                <ChevronsUpDown class="size-4 shrink-0 opacity-50" />
                            </div>
                        </Button>
                    </ComboboxTrigger>
                </ComboboxAnchor>

                <ComboboxList
                    align="start"
                    class="w-md"
                    @focus-outside.prevent
                >
                    <div class="relative w-full items-center">
                        <ComboboxInput
                            v-model="search"
                            :disabled="disabled"
                        />
                    </div>

                    <ComboboxEmpty class="px-6">
                        {{ $t('No results') }}
                    </ComboboxEmpty>

                    <ComboboxGroup>
                        <ComboboxItem
                            v-if="clearable"
                            :value="null"
                            @click="select(null)"
                        >
                            {{ $t('Clear selection') }}
                        </ComboboxItem>
                        
                        <Separator />

                        <ComboboxItem
                            v-for="o in options"
                            :key="findValue(o)"
                            :value="findValue(o)"
                            @click="select(o)"
                        >
                            <div
                                v-if="avatarKey"
                                class="flex-shrink-0 mr-2"
                            >
                                <slot
                                    name="avatar"
                                    :option="o"
                                >
                                    <Avatar class="size-6">
                                        <AvatarImage
                                            v-if="findAvatar(o)"
                                            :src="findAvatar(o)"
                                            :alt="findLabel(o)"
                                        />
                                        <AvatarFallback>
                                            {{ findAvatarInitial(o) }}
                                        </AvatarFallback>
                                    </Avatar>
                                </slot>
                            </div>
                            <div class="flex flex-col items-start flex-1">
                                <slot
                                    name="label"
                                    :option="o"
                                >
                                    {{ findLabel(o) }}
                                </slot>
                                <div
                                    v-if="findSubtitle(o)"
                                    class="text-sm text-muted-foreground"
                                >
                                    <slot
                                        name="subtitle"
                                        :option="o"
                                    >
                                        {{ findSubtitle(o) }}
                                    </slot>
                                </div>
                            </div>

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