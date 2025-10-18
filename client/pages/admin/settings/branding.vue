<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { Card, CardContent } from '#client/components/ui/card'
import FormTextField from '#client/components/FormTextField.vue'
import FormSelect from '#client/components/FormSelect.vue'
import FormTextarea from '#client/components/FormTextarea.vue'
import Button from '#client/components/Button.vue'
import AppLayout from '#client/layouts/AppLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import schemas from '#shared/validators/index.ts'
import Icon from '#client/components/Icon.vue'

const loading = ref(false)
const saving = ref(false)

const { handleSubmit, resetForm, values } = useForm({
    name: 'settings',
    validationSchema: toTypedSchema(schemas.branding.update), 
})

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<any>('/api/branding')

    if (error) {
        loading.value = false
        return
    }

    console.log(response)

    
    resetForm({
        values: response
    })
    
    setTimeout(() => {
        loading.value = false
    }, 500)
}

const onSubmit = handleSubmit(async (data) => {
    saving.value = true

    const [error] = await tryCatch(() => $fetch('/api/branding', {
        method: 'PUT',
        data
    }))

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Updated successfully.'))
    saving.value = false
})

onMounted(() => {
    load()
})
</script>

<template>
    <AppLayout>
        <form @submit="onSubmit">
            <div class="mb-6 flex">
                <div class="flex-1">
                    <PageTitle>{{ $t('Branding') }}</PageTitle>
                    <PageSubtitle>
                        {{ $t('Configure your branding settings') }}
                    </PageSubtitle>
                </div>
                <div class="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        :disabled="loading"
                        @click="load"
                    >
                        <Icon
                            name="RotateCcw"
                            :class="{ 'animate-spin': loading }"
                        />
                    </Button>
                    <Button 
                        type="submit"
                        :loading="saving"
                        :disabled="loading"
                    >
                        {{ $t('Save') }}
                    </Button>
                </div>
            </div>

            <div class="space-y-6">
                <Card>
                    <CardContent class="space-y-4">
                        <FormSelect
                            name="logo-type"
                            :label="$t('Logo Type')"
                            :hint="$t('Choose how you want to set your logo')"
                            :disabled="loading || saving"
                            :options="[
                                { value: 'url', label: $t('URL') },
                                { value: 'svg', label: $t('SVG String') },
                                { value: 'file', label: $t('File Upload') }
                            ]"
                        />
                        
                        <FormTextField
                            v-if="values['logo-type'] === 'url'"
                            name="logo-url"
                            :label="$t('Logo URL')"
                            :hint="$t('URL to your brand logo image')"
                            :disabled="loading || saving"
                        />
                        
                        <FormTextarea
                            v-if="values['logo-type'] === 'svg'"
                            name="logo-svg"
                            :label="$t('SVG Code')"
                            :hint="$t('Paste your SVG code here')"
                            :disabled="loading || saving"
                        />
                        
                        <FormTextField
                            v-if="values['logo-type'] === 'file'"
                            name="logo-file-id"
                            :label="$t('File ID')"
                            :hint="$t('ID of the uploaded logo file')"
                            :disabled="loading || saving"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="space-y-4">
                        <h3 class="text-lg font-semibold mb-4">
                            {{ $t('Main Theme Colors') }}
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormTextField
                                name="color-background"
                                :label="$t('Background')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-foreground"
                                :label="$t('Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-primary"
                                :label="$t('Primary')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-primary-foreground"
                                :label="$t('Primary Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-secondary"
                                :label="$t('Secondary')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-secondary-foreground"
                                :label="$t('Secondary Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-accent"
                                :label="$t('Accent')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-accent-foreground"
                                :label="$t('Accent Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-muted"
                                :label="$t('Muted')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-muted-foreground"
                                :label="$t('Muted Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-destructive"
                                :label="$t('Destructive')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-destructive-foreground"
                                :label="$t('Destructive Foreground')"
                                :disabled="loading || saving"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="space-y-4">
                        <h3 class="text-lg font-semibold mb-4">
                            {{ $t('Interface Colors') }}
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormTextField
                                name="color-card"
                                :label="$t('Card Background')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-card-foreground"
                                :label="$t('Card Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-popover"
                                :label="$t('Popover Background')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-popover-foreground"
                                :label="$t('Popover Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-border"
                                :label="$t('Border')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-input"
                                :label="$t('Input Background')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-ring"
                                :label="$t('Focus Ring')"
                                :disabled="loading || saving"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="space-y-4">
                        <h3 class="text-lg font-semibold mb-4">
                            {{ $t('Chart Colors') }}
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormTextField
                                name="color-chart-1"
                                :label="$t('Chart Color 1')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-chart-2"
                                :label="$t('Chart Color 2')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-chart-3"
                                :label="$t('Chart Color 3')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-chart-4"
                                :label="$t('Chart Color 4')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-chart-5"
                                :label="$t('Chart Color 5')"
                                :disabled="loading || saving"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="space-y-4">
                        <h3 class="text-lg font-semibold mb-4">
                            {{ $t('Sidebar Colors') }}
                        </h3>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormTextField
                                name="color-sidebar"
                                :label="$t('Sidebar Background')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-sidebar-foreground"
                                :label="$t('Sidebar Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-sidebar-primary"
                                :label="$t('Sidebar Primary')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-sidebar-primary-foreground"
                                :label="$t('Sidebar Primary Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-sidebar-accent"
                                :label="$t('Sidebar Accent')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-sidebar-accent-foreground"
                                :label="$t('Sidebar Accent Foreground')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-sidebar-border"
                                :label="$t('Sidebar Border')"
                                :disabled="loading || saving"
                            />
                            <FormTextField
                                name="color-sidebar-ring"
                                :label="$t('Sidebar Ring')"
                                :disabled="loading || saving"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    </AppLayout>
</template>