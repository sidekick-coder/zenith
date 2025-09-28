<script lang="ts" setup>
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { ref } from 'vue'
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

const emit = defineEmits(['submit'])

const loading = ref(false)
const open = ref(false)

const schema = v.pipe(
    v.object({
        name: v.string(),
        username: v.string(),
        email: v.pipe(v.string(), v.email($t('Invalid email'))),
        password: v.pipe(
            v.string(),
            v.minLength(6, $t('Password must be at least 6 characters'))
        ),
        password_confirmation: v.pipe(
            v.string(),
            v.minLength(6, $t('Password confirmation required'))
        ),
    }),
    v.forward(
        v.partialCheck(
            [['password'], ['password_confirmation']],
            (input) => input.password === input.password_confirmation,
            $t('Passwords do not match')
        ),
        ['password_confirmation']
    )
)

const { handleSubmit, errors, values, resetForm } = useForm({
    validationSchema: toTypedSchema(schema),
    initialValues: {
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    },
})

const onSubmit = handleSubmit(async (form) => {
    loading.value = true

    const [error] = await tryCatch(() => {
        return $fetch('/api/users', {
            method: 'POST',
            data: form,
        })
    })

    if (error) {
        loading.value = false
        return
    }

    
    setTimeout(() => {
        open.value = false
        loading.value = false
        resetForm()
        emit('submit')
    }, 1000)

})
</script>
<template>
    <Dialog v-model:open="open">
        <DialogTrigger>
            <Button>
                {{ $t('Add new') }}
            </Button>
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
                <FormTextField
                    v-model="values.name"
                    name="name"
                    :label="$t('Name')"
                    :error="errors.name"
                />
                <FormTextField
                    v-model="values.username"
                    name="username"
                    :label="$t('Username')"
                    :error="errors.username"
                />
                <FormTextField
                    v-model="values.email"
                    name="email"
                    :label="$t('Email')"
                    :error="errors.email"
                />
                <FormTextField
                    v-model="values.password"
                    name="password"
                    :label="$t('Password')"
                    :error="errors.password"
                    type="password"
                />
                <FormTextField
                    v-model="values.password_confirmation"
                    name="password_confirmation"
                    :label="$t('Confirm password')"
                    :error="errors.password_confirmation"
                    type="password"
                />
                <DialogFooter>
                    <Button
                        type="submit"
                        class="w-full"
                        :loading
                    >
                        {{ $t('Save changes') }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>