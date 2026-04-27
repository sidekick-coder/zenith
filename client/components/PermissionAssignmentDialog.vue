<script lang="ts" setup>
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { ref } from 'vue'
import ClientOnly from './ClientOnly.vue'
import FormAutocomplete from './FormAutocomplete.vue'

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
import schemas from '#shared/validators/index.ts'
import Permission from '#shared/entities/permission.entity.ts'

const props = defineProps({ 
    assignType: {
        type: String,
        required: true,
    },
    assignId: {
        type: [String, Number],
        required: true,
    },
})

const emit = defineEmits(['submit'])

const loading = ref(false)
const open = ref(false)

const { handleSubmit, resetForm } = useForm({
    validationSchema: toTypedSchema(schemas.permissionAssignment.create),
    initialValues: {
        assign_id: String(props.assignId),
        assign_type: props.assignType,
    },
})

const onSubmit = handleSubmit(async (data) => {
    loading.value = true

    const [error, response] = await tryCatch(() => $fetch<Permission>('/api/permission-assignments', {
        method: 'POST',
        data,
    })
    )

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
                        {{ $t('Attatch') }}
                    </Button>
                </slot>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{{ $t('Assign Permission') }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('Fill in the details below to assign a permission') }}
                    </DialogDescription>
                </DialogHeader>
                <form
                    class="space-y-4 py-2"
                    @submit.prevent="onSubmit"
                >
                    <FormAutocomplete
                        name="permission_id"
                        :label="$t('Permission')"
                        fetch="/api/permissions"
                        label-key="name"
                        value-key="id"
                    />
                    
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
    </ClientOnly>
</template>
