<script lang="ts">
export interface FormField {
    component: 'text-field' | 'textarea' | 'select' | 'autocomplete' | 'switch' | 'image-upload' | 'color-picker'
    [key: string]: any
}

export function defineFormFields(field: Record<string, FormField>) {
    return field
}

</script>
<script lang="ts" setup generic="T extends BaseSchema<any, any, any>">
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { computed, ref, watch  } from 'vue'
import type { PropType } from 'vue'
import type { BaseSchema } from 'valibot'
import FormTextarea from './FormTextarea.vue'
import FormSelect from './FormSelect.vue'
import FormAutocomplete from './FormAutocomplete.vue'
import FormSwitch from './FormSwitch.vue'
import FormImageUploader from './FormImageUploader.vue'
import FormColorPicker from './FormColorPicker.vue'
import { $t } from '#shared/lang.ts'
import FormTextField from '#client/components/FormTextField.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import Button from '#client/components/Button.vue'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import validator from '#shared/services/validator.service.ts'

const props = defineProps({
    fields: {
        type: Object as () => Record<keyof v.InferInput<T>, FormField>,
        default: () => ({}),
    },
})

const components = computed(() => {
    return Object.entries(props.fields).map(([name, field]) => {
        const { component, ...rest } = field

        return {
            component,
            name,
            props: rest
        }
    })
})
</script>
<template>
    <template
        v-for="field in components"
        :key="field.name"
    >
        <FormTextField
            v-if="field.component === 'text-field'"
            :name="field.name"
            v-bind="field.props"
        />
    
        <FormTextarea
            v-else-if="field.component === 'textarea'"
            :name="field.name"
            v-bind="field.props"
        />
                        
        <FormSelect
            v-else-if="field.component === 'select'"
            :name="field.name"
            v-bind="field.props"
        />
    
        <FormAutocomplete
            v-else-if="field.component === 'autocomplete'"
            :name="field.name"
            v-bind="field.props"
        />

        <FormSwitch
            v-else-if="field.component === 'switch'"
            :name="field.name"
            v-bind="field.props"
        />

        <FormImageUploader
            v-else-if="field.component === 'image-upload'"
            :name="field.name"
            v-bind="field.props"
        />

        <FormColorPicker
            v-else-if="field.component === 'color-picker'"
            :name="field.name"
            v-bind="field.props"
        />
    
        <!-- Add other field types like select, checkbox, radio as needed -->
    </template>
</template>