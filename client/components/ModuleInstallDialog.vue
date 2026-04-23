<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'

import $fetch from '#client/facades/fetch.facade.ts'
import { $server } from '#client/utils/server.ts'
import Dialog from '#client/components/ui/dialog/Dialog.vue'
import DialogContent from '#client/components/ui/dialog/DialogContent.vue'
import DialogScrollContent from '#client/components/ui/dialog/DialogScrollContent.vue'
import DialogHeader from '#client/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '#client/components/ui/dialog/DialogTitle.vue'
import DialogDescription from '#client/components/ui/dialog/DialogDescription.vue'
import DialogFooter from '#client/components/ui/dialog/DialogFooter.vue'
import FormTextField from '#client/components/FormTextField.vue'
import FormTextarea from '#client/components/FormTextarea.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'

const props = defineProps({
    open: {
        type: Boolean,
        required: false,
        default: false,
    },
})

const emit = defineEmits(['update:open'])

const installing = ref(false)

const schema = v.object({
    id: v.pipe(v.string(), v.minLength(1, $t('Module ID is required'))),
    repository: v.pipe(v.string(), v.minLength(1, $t('Repository URL is required'))),
    branch: v.optional(v.string()),
    key: v.optional(v.string()),
})

const { handleSubmit, values, setFieldValue, resetForm } = useForm({
    name: 'install-git',
    validationSchema: toTypedSchema(schema),
})

const onSubmit = handleSubmit(async (data) => {
    installing.value = true

    const [error] = await $fetch.try('/api/modules', {
        method: 'POST',
        data,
    })

    if (error) {
        installing.value = false
        return
    }

    await $server.online({ timeout: 60000 })

    window.location.reload()
})

function close() {
    emit('update:open', false)
    resetForm()
}

watch(() => values.repository, (newVal) => {
    if (!newVal) return

    if (values.id) return

    const matched = newVal.match(/\/([^/]+)(\.git)?$/)

    if (!matched || matched.length < 2) return

    setFieldValue('id', matched[1].replace('.git', ''))
})

watch(() => props.open, (newVal) => {
    if (!newVal) resetForm()
})
</script>

<template>
    <Dialog
        :open="open && !installing"
        @update:open="emit('update:open', $event)"
    >
        <DialogScrollContent class="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>{{ $t('New Module') }}</DialogTitle>
                <DialogDescription>
                    {{ $t('Install a module from a Git repository') }}
                </DialogDescription>
            </DialogHeader>

            <form
                class="space-y-4"
                @submit.prevent="onSubmit"
            >
                <FormTextField
                    name="repository"
                    :label="$t('Repository URL')"
                    placeholder="https://github.com/user/repo.git"
                    :description="$t('Git repository URL (HTTPS or SSH)')"
                />

                <FormTextField
                    name="id"
                    :label="$t('Module ID')"
                    :placeholder="$t('Enter module identifier')"
                    :description="$t('Unique identifier for the module (auto-filled from repository URL)')"
                />

                <FormTextField
                    name="branch"
                    :label="$t('Branch')"
                    :placeholder="$t('main')"
                    :description="$t('Optional: specific branch to clone (defaults to repository default)')"
                />

                <FormTextarea
                    name="key"
                    :label="$t('SSH Private Key')"
                    placeholder="-----BEGIN PRIVATE KEY-----"
                    :hint="$t('Optional: SSH private key for private repositories')"
                    :rows="6"
                />

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        @click="close"
                    >
                        {{ $t('Cancel') }}
                    </Button>
                    <Button type="submit">
                        {{ $t('Install') }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogScrollContent>
    </Dialog>

    <Dialog :open="installing">
        <DialogContent
            class="sm:max-w-[425px]"
            hide-close
        >
            <DialogHeader>
                <DialogTitle>{{ $t('Installing module') }}</DialogTitle>
                <DialogDescription>
                    {{ $t('Please wait while the module is being installed. The server will restart automatically.') }}
                </DialogDescription>
            </DialogHeader>
            <div class="flex items-center justify-center py-4">
                <Icon
                    name="LoaderCircle"
                    class="size-10 animate-spin text-gray-500"
                />
            </div>
        </DialogContent>
    </Dialog>
</template>
