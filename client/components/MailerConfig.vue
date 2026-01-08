<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import FormAutoFieldList from '#client/components/FormAutoFieldList.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { $t } from '#shared/lang'
import type MailerConfig from '#shared/entities/mailerConfig.entity.ts'

const props = defineProps({
    mailer: {
        type: Object as () => MailerConfig,
        required: true
    }
})

const saving = ref(false)

const { handleSubmit, resetForm } = useForm()

const configFields = computed(() => {
    return props.mailer.config_fields || {}
})

const onSubmit = handleSubmit(async (data) => {
    saving.value = true

    const [error] = await $fetch.try(`/api/mailers/${props.mailer.id}`, {
        method: 'PUT',
        data: {
            config: data
        }
    })

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Config updated successfully'))

    setTimeout(() => {
        saving.value = false
    }, 500)
})

watch(() => props.mailer, (newDrive) => {
    if (newDrive) {
        resetForm({
            values: {
                ...(newDrive.config || {})
            }
        })
    }
}, { immediate: true })
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>
                {{ $t('Configuration') }}
            </CardTitle>
            <CardDescription>
                {{ $t('Configure drive settings') }}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form
                class="space-y-4 w-full"
                @submit.prevent="onSubmit"
            >
                <FormAutoFieldList
                    v-if="configFields && Object.keys(configFields).length > 0"
                    :fields="configFields"
                />

                <div
                    v-if="!configFields || Object.keys(configFields).length === 0"
                    class="text-muted-foreground"
                >
                    {{ $t('No configuration fields available') }}
                </div>

                <div
                    v-if="configFields && Object.keys(configFields).length > 0"
                    class="flex gap-3 pt-4 justify-end"
                >
                    <Button
                        type="submit"
                        :loading="saving"
                    >
                        {{ $t('Save') }}
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
</template>
