<script lang="ts" setup>
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { ref, watch } from 'vue'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import FormTextarea from './FormTextarea.vue'
import ClientOnly from './ClientOnly.vue'
import FormSelect from './FormSelect.vue'

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
import schemas from '#shared/validators/index.ts'
import type Permission from '#shared/entities/permission.entity.ts'
import validator from '#shared/services/validator.service.ts'

const emit = defineEmits(['submit'])

const loading = ref(false)
const open = ref(false)

const props = defineProps({
    permission: {
        type: Object as () => Permission,
        default: null,
    },
})

const isJsonString = (value: string) => {
    try {
        JSON.parse(value)
        return true
    } catch {
        return false
    }
}

const schema = validator.create(v => v.intersect([
    v.omit(schemas.permission.update, ['conditions']),
    v.object({ conditions: v.nullish(v.pipe(v.string(), v.check(isJsonString, 'Conditions must be a valid JSON string'))) }),
]))

const { handleSubmit, resetForm } = useForm({ validationSchema: toTypedSchema(schema), })

const onSubmit = handleSubmit(async (form) => {
    loading.value = true

    const data = {
        ...form,
        conditions: form.conditions ? JSON.parse(form.conditions) : null,
    }

    const [error, response] = await tryCatch(() => {
        if (props.permission?.id) {
            return $fetch<Permission>(`/api/permissions/${props.permission.id}`, {
                method: 'PUT',
                data,
            })
        }

        return $fetch<Permission>('/api/permissions', {
            method: 'POST',
            data,
        })
    })

    if (error) {
        loading.value = false
        return
    }

    await new Promise(resolve => setTimeout(resolve, 800))

    open.value = false
    loading.value = false

    resetForm()

    emit('submit', response)
    
})

watch(open, (value) => {
    if (value) {
        const conditions = props.permission?.conditions ? JSON.parse(props.permission.conditions as string) : null

        resetForm({
            values: {
                name: props.permission?.name || '',
                description: props.permission?.description || '',
                action: props.permission?.action || '',
                subject: props.permission?.subject || '',   
                conditions: conditions ? JSON.stringify(conditions, null, 2) : '',
            }
        })
    }
}, { immediate: true })
</script>
<template>
    <ClientOnly>
        <template #fallback>
            <slot>
                <Button>
                    {{ $t('Add new') }}
                </Button>
            </slot>
        </template>

        <Dialog v-model:open="open">
            <DialogTrigger>
                <slot>
                    <Button>
                        {{ $t('Add new') }}
                    </Button>
                </slot>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{{ permission ? $t('Edit permission') : $t('Add new permission') }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('Fill in the details below to edit permission') }}
                    </DialogDescription>
                </DialogHeader>
                <form
                    class="space-y-4 py-2"
                    @submit.prevent="onSubmit"
                >
                    <FormTextField
                        name="name"
                        :label="$t('Name')"
                    />
                    
                    <FormTextField
                        name="description"
                        :label="$t('Description')"
                    />
    
                    <FormSelect
                        name="action"
                        :label="$t('Action')"
                        :options="['manage', 'create', 'read', 'update', 'delete']"
                    />
    
                    <FormTextField
                        name="subject"
                        :label="$t('Subject')"
                    />
    
                    <FormTextarea
                        name="conditions"
                        :label="$t('Conditions')"
                    />
                    
                    <DialogFooter>
                        <Button
                            type="submit"
                            class="w-full"
                            :loading
                        >
                            {{ permission ? $t('Update') : $t('Create') }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </ClientOnly>
</template>
