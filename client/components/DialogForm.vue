<script lang="ts">
export interface FormField {
    component: 'text-field' | 'textarea' | 'select' | 'autocomplete'
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
import { computed, ref } from 'vue'
import type { BaseSchema } from 'valibot'
import FormTextarea from './FormTextarea.vue'
import FormSelect from './FormSelect.vue'
import FormAutocomplete from './FormAutocomplete.vue'
import { $t } from '#shared/lang.ts'
import FormTextField from '#client/components/FormTextField.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import Button from '#client/components/Button.vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '#client/components/ui/dialog'

const props = defineProps({
    schema: {
        type: Object as () => T,
        required: true,
    },
    values: {
        type: Object as () => Partial<v.InferInput<T>>,
        default: () => ({}),
    },
    fetch: {
        type: String,
        default: null,
    },
    method: {
        type: String,
        default: 'POST',
    },
    fields: {
        type: Object as () => Record<keyof v.InferInput<T>, FormField>,
        default: () => ({}),
    },
})

const emit = defineEmits(['submit'])

const loading = ref(false)

const open = defineModel('open', {
    type: Boolean,
    default: false,
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

const { handleSubmit, errors, values, resetForm } = useForm({
    validationSchema: toTypedSchema(props.schema as T),
    initialValues: props.values as v.InferInput<T>,
})

const onSubmit = handleSubmit(async (data) => {
    if (!props.fetch) {
        open.value = false
        return
    }

    loading.value = true

    const [error, response] = await $fetch.try(props.fetch, {
        method: props.method,
        data,
    })

    if (error) {
        loading.value = false
        return
    }

    
    setTimeout(() => {
        open.value = false
        loading.value = false
        resetForm()
        emit('submit', response)
    }, 1000)

})
</script>
<template>
    <Dialog v-model:open="open">
        <DialogTrigger v-if="$slots.default">
            <slot />
        </DialogTrigger>

        <DialogContent>
            <DialogHeader>
                <DialogTitle>{{ $t('Create user') }}</DialogTitle>
                <DialogDescription>
                    {{ $t('Fill in the details below to create a new user account') }}
                </DialogDescription>
            </DialogHeader>
            <form
                class="space-y-4 py-2"
                @submit.prevent="onSubmit"
            >
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

                    <!-- Add other field types like select, checkbox, radio as needed -->
                </template>

                <DialogFooter>
                    <Button
                        type="submit"
                        class="w-full"
                        :loading
                    >
                        {{ $t('Save') }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>