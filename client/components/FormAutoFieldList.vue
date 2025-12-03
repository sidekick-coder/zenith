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
import * as v from 'valibot'
import { computed  } from 'vue'
import type { BaseSchema } from 'valibot'
import FormTextarea from './FormTextarea.vue'
import FormSelect from './FormSelect.vue'
import FormAutocomplete from './FormAutocomplete.vue'
import FormSwitch from './FormSwitch.vue'
import FormImageUploader from './FormImageUploader.vue'
import FormColorPicker from './FormColorPicker.vue'
import FormStringListInput from './FormStringListInput.vue'
import FormTextField from '#client/components/FormTextField.vue'

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

        <FormStringListInput
            v-else-if="field.component === 'string-list-input'"
            :name="field.name"
            v-bind="field.props"    
        />

        <div
            v-else
            class="text-destructive"
        >
            Unknow component {{ field.component }}
        </div>
    
        <!-- Add other field types like select, checkbox, radio as needed -->
    </template>
</template>