<script lang="ts">
export interface FormField {
    component: 'text-field' | 'textarea' | 'select' | 'autocomplete' | 'switch' | 'image-upload'
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
import ClientOnly from './ClientOnly.vue'
import FormSwitch from './FormSwitch.vue'
import FormImageUploader from './FormImageUploader.vue'
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
import { tryCatch } from '#shared/utils/tryCatch.ts'
import validator from '#shared/services/validator.service.ts'

const props = defineProps({
    title: {
        type: String,
        default: $t('Create'),
    },
    description: {
        type: String,
        default: $t('Fill in the details below to create a new item'),
    },
    schema: {
        type: Object as () => T,
        default: () => validator.create(v => v.record(v.string(), v.any())), // dummy schema to satisfy generic constraint
    },
    values: {
        type: Object as () => Partial<v.InferInput<T>>,
        default: () => ({}),
    },
    fetch: {
        type: [String, Function] as PropType<string | ((data: any) => Promise<any>)>,
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
    submitText: {
        type: String,
        default: $t('Save'),
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

const { handleSubmit, errors, resetForm } = useForm({
    validationSchema: toTypedSchema(props.schema as T),
    initialValues: props.values as v.InferInput<T>,
})

const errorsWihoutFields = computed(() => {
    const result: Record<string, any> = {}

    for (const [key, value] of Object.entries(errors.value)) {
        if (props.fields[key as keyof v.InferInput<T>]) continue

        result[key] = value
    }
    
    return result
})

function doFetch(data: v.InferInput<T>) {
    if (typeof props.fetch === 'function') {
        return props.fetch(data)
    }

    return $fetch(props.fetch as string, {
        method: props.method,
        data,
    })
}

const onSubmit = handleSubmit(async (data) => {
    if (!props.fetch) {
        open.value = false
        return
    }

    loading.value = true

    const [error, response] = await tryCatch(() => doFetch(data))

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

watch(open, () => {
    if (!open.value) return

    resetForm({
        values: props.values as v.InferInput<T>,
    })
})
</script>
<template>
    <ClientOnly>
        <template #fallback>
            <slot />
        </template>

        <Dialog v-model:open="open">
            <DialogTrigger v-if="$slots.default">
                <slot />
            </DialogTrigger>
    
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{{ title }}</DialogTitle>
                    <DialogDescription>{{ description }}</DialogDescription>
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
    
                        <!-- Add other field types like select, checkbox, radio as needed -->
                    </template>
    
                    <div
                        v-if="Object.keys(errorsWihoutFields).length"
                        class="mb-2 text-sm text-red-600"
                    >
                        <div
                            v-for="(message, field) in errorsWihoutFields"
                            :key="field"
                        >
                            {{ message }}
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button
                            type="submit"
                            class="w-full"
                            :loading
                        >
                            {{ submitText }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </ClientOnly>
</template>