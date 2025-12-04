<script setup lang="ts">
import { useField } from 'vee-validate'
import MultiSelect from './MultiSelect.vue'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
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

const options = defineModel('options', {
    type: Array as () => any[],
    default: () => [],
})

const { value, errorMessage } = useField<any[]>(() => props.name)
</script>

<template>
    <div class="flex flex-col gap-2">
        <MultiSelect
            v-model="value"
            v-model:options="options"
            :label="label"
            :placeholder="placeholder"
            :disabled="disabled"
            :label-key="labelKey"
            :value-key="valueKey"
            :fetch="fetch"
            :fetch-key="fetchKey"
        >
            <template #option="slotProps">
                <slot
                    name="option"
                    v-bind="slotProps"
                />
            </template>
            <template #option-label="slotProps">
                <slot
                    name="option-label"
                    v-bind="slotProps"
                />
            </template>
        </MultiSelect>
        <span
            v-if="errorMessage"
            class="text-sm text-red-500"
        >
            {{ errorMessage }}
        </span>
    </div>
</template>
