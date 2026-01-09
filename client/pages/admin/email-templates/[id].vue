<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { toast } from 'vue-sonner'
import AppLayout from '#client/layouts/AppLayout.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import FormTextField from '#client/components/FormTextField.vue'
import FormTextarea from '#client/components/FormTextarea.vue'
import FormSelect from '#client/components/FormSelect.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '#client/components/ui/card'
import { Skeleton } from '#client/components/ui/skeleton'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import $fetch from '#client/facades/fetch.facade.ts'
import { $t } from '#shared/lang'
import EmailTemplate from '#shared/entities/emailTemplate.entity.ts'
import schemas from '#shared/validators/index.ts'

const route = useRoute()
const templateId = computed(() => route.params.id as string)

const template = ref<EmailTemplate>()
const loading = ref(true)
const saving = ref(false)
const iframeKey = ref(0)
const iframeRef = ref<HTMLIFrameElement>()
const previewFormRef = ref<HTMLFormElement>()

const { setValues, handleSubmit, values } = useForm({
    validationSchema: toTypedSchema(schemas.emailTemplate.update),
})

function refreshPreview() {
    if (previewFormRef.value) {
        previewFormRef.value.submit()
    }
}

async function load() {
    loading.value = true
    
    const [error, response] = await $fetch.try(`/api/email-templates/${templateId.value}`, { method: 'GET' })

    if (error) {
        console.error('Failed to load email template:', error)
        loading.value = false
        return
    }

    template.value = new EmailTemplate(response)
    
    setValues(response)
    
    setTimeout(() => {
        loading.value = false
        setTimeout(() => {
            refreshPreview()
        }, 100)
    }, 500)
}

const onSubmit = handleSubmit(async (data) => {
    saving.value = true

    const { id, ...payload } = data

    const [error] = await $fetch.try(`/api/email-templates/${templateId.value}`, {
        method: 'PATCH',
        data: payload
    })

    if (error) {
        saving.value = false
        return
    }

    setTimeout(() => {
        toast.success($t('Email template updated successfully'))
        saving.value = false
    }, 500)
})

onMounted(load)
</script>

<template>
    <AppLayout
        :breadcrumbs="[
            { label: $t('Email Templates'), to: '/admin/email-templates' },
            { label: template?.name || '...' }
        ]"
    >
        <div
            v-if="loading"
            class="flex flex-col space-y-3"
        >
            <Skeleton class="h-[125px] w-full rounded-xl" />
            <div class="space-y-2">
                <Skeleton class="h-4 w-[80%]" />
                <Skeleton class="h-4 w-[60%]" />
            </div>
        </div>

        <div
            v-if="!loading"
            class="flex flex-wrap [&>*]:px-4 gap-y-4 -mx-4"
        >
            <div class="w-full flex items-center justify-between">
                <div>
                    <PageTitle>
                        {{ $t('Edit Email Template') }}
                    </PageTitle>
                    <PageSubtitle>
                        {{ $t('Update the email template information below') }}
                    </PageSubtitle>
                </div>
            </div>

            <div class="w-full xl:w-6/12 flex flex-col space-y-6">
                <Card v-if="template">
                    <CardHeader>
                        <CardTitle>
                            {{ $t('Details') }}
                        </CardTitle>
                        <CardDescription>
                            {{ $t('Email template general information') }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            class="space-y-4 w-full"
                            @submit.prevent="onSubmit"
                        >
                            <FormTextField
                                name="id"
                                :label="$t('ID')"
                                :readonly="true"
                            />
                            
                            <FormTextField
                                name="name"
                                :label="$t('Name')"
                            />

                            <FormTextField
                                name="key"
                                :label="$t('Key')"
                            />

                            <FormTextField
                                name="subject"
                                :label="$t('Subject')"
                            />

                            <FormSelect
                                name="engine"
                                :label="$t('Engine')"
                                :options="[
                                    { label: 'Raw', value: 'raw' },
                                    { label: 'HTML', value: 'html' },
                                    { label: 'MJML', value: 'mjml' },
                                ]"
                            />

                            <FormTextarea
                                name="body"
                                :label="$t('Body')"
                                :rows="15"
                                @blur="refreshPreview"
                            />

                            <div class="flex gap-3 pt-4 justify-end">
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
            </div>

            <div class="w-full xl:w-6/12 flex flex-col space-y-6">
                <Card v-if="template">
                    <CardHeader>
                        <CardTitle>
                            {{ $t('Preview') }}
                        </CardTitle>
                        <CardDescription>
                            {{ $t('Email template preview') }}
                        </CardDescription>
                        <CardAction>
                            <Button
                                variant="outline"
                                size="sm"
                                @click="refreshPreview"
                            >
                                <Icon
                                    name="lucide:refresh-cw"
                                    class="w-4 h-4"
                                />
                            </Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-4">
                            <div>
                                <div class="text-sm font-medium mb-2">
                                    {{ $t('Subject') }}
                                </div>
                                <div class="text-sm text-muted-foreground border rounded p-5">
                                    {{ template.subject }}
                                </div>
                            </div>
                            <div>
                                <div class="text-sm font-medium mb-2">
                                    {{ $t('Body') }}
                                </div>
                                <form
                                    ref="previewFormRef"
                                    action="/api/email-templates/preview"
                                    method="POST"
                                    target="preview-iframe"
                                    class="hidden"
                                >
                                    <input
                                        type="hidden"
                                        name="engine"
                                        :value="values.engine || ''"
                                    >
                                    <input
                                        type="hidden"
                                        name="subject"
                                        :value="values.subject || ''"
                                    >
                                    <textarea
                                        :value="values.body || ''"
                                        name="body"
                                        class="hidden"
                                    />
                                </form>
                                <iframe
                                    ref="iframeRef"
                                    name="preview-iframe"
                                    class="w-full border rounded min-h-[400px] bg-white"
                                    sandbox="allow-scripts allow-same-origin"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
</template>
