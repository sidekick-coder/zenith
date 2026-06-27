<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import schemas from '#shared/validators/index.ts'
import Icon from '#client/components/Icon.vue'
import FormTextField from '#client/components/FormTextField.vue'
import FormImageUploader from '#client/components/FormImageUploader.vue'

const loading = ref(false)
const saving = ref(false)
const iconUrls = ref<Record<number, string>>({})
const iconLoadings = ref<Record<number, boolean>>({})
const screenshotUrls = ref<Record<number, string>>({})
const screenshotLoadings = ref<Record<number, boolean>>({})

const { handleSubmit, resetForm, values, setFieldValue } = useForm({
    name: 'pwa-settings',
    validationSchema: toTypedSchema(schemas.pwa.update),
})

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<any>('/api/pwa')

    if (error) {
        loading.value = false
        return
    }
    
    resetForm({ values: response })

    if (response.icons) {
        response.icons.forEach((icon: any, index: number) => {
            if (icon.fileId) {
                iconUrls.value[index] = `/api/files/${icon.fileId}/stream`
            }
        })
    }

    if (response.screenshots) {
        response.screenshots.forEach((screenshot: any, index: number) => {
            if (screenshot.fileId) {
                screenshotUrls.value[index] = `/api/files/${screenshot.fileId}/stream`
            }
        })
    }
    
    setTimeout(() => {
        loading.value = false
    }, 500)
}

const onSubmit = handleSubmit(async (data) => {
    saving.value = true

    const [error] = await $fetch.try('/api/pwa', {
        method: 'PUT',
        data,
    })

    if (error) {
        saving.value = false
        return
    }

    setTimeout(() => {
        saving.value = false
        toast.success($t('PWA settings saved successfully.'))
    }, 500)
    
})

function addIcon() {
    const currentIcons = values.icons || []
    const newIcon = {
        src: '',
        fileId: '',
        sizes: '',
        type: 'image/png'
    }
    
    const newIndex = currentIcons.length
    setFieldValue('icons', [...currentIcons, newIcon])
    iconUrls.value[newIndex] = ''
    iconLoadings.value[newIndex] = false
}

function removeIcon(index: number) {
    const currentIcons = values.icons || []
    const updatedIcons = currentIcons.filter((_, i) => i !== index)
    setFieldValue('icons', updatedIcons)
    delete iconUrls.value[index]
    delete iconLoadings.value[index]
}

function addScreenshot() {
    const currentScreenshots = values.screenshots || []
    const newScreenshot = {
        src: '',
        fileId: '',
        formFactor: '',
        sizes: ''
    }
    
    const newIndex = currentScreenshots.length
    setFieldValue('screenshots', [...currentScreenshots, newScreenshot])
    screenshotUrls.value[newIndex] = ''
    screenshotLoadings.value[newIndex] = false
}

function removeScreenshot(index: number) {
    const currentScreenshots = values.screenshots || []
    const updatedScreenshots = currentScreenshots.filter((_, i) => i !== index)
    setFieldValue('screenshots', updatedScreenshots)
    delete screenshotUrls.value[index]
    delete screenshotLoadings.value[index]
}

const icons = computed(() => values.icons || [])
const screenshots = computed(() => values.screenshots || [])

onMounted(() => {
    load()
})
</script>

<template>

    <form @submit="onSubmit">
        <div class="mb-6 flex">
            <div class="flex-1">
                <PageTitle>{{ $t('PWA Settings') }}</PageTitle>
                <PageSubtitle>
                {{ $t('Configure your Progressive Web App manifest') }}
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
            <h3 class="text-lg font-semibold mb-4">
                {{ $t('Basic Information') }}
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextField
                name="name"
                :label="$t('App Name')"
                :disabled="loading || saving"
                :placeholder="$t('Enter app name')"
                />
                <FormTextField
                name="shortName"
                :label="$t('Short Name')"
                :disabled="loading || saving"
                :placeholder="$t('Enter short name')"
                />
                <FormTextField
                name="description"
                :label="$t('Description')"
                :disabled="loading || saving"
                :placeholder="$t('Enter app description')"
                class="md:col-span-2"
                />
                <FormTextField
                name="startUrl"
                :label="$t('Start URL')"
                :disabled="loading || saving"
                :placeholder="$t('Enter start URL (default: /)')"
                />
                <FormTextField
                name="display"
                :label="$t('Display Mode')"
                :disabled="loading || saving"
                :placeholder="$t('Enter display mode (default: standalone)')"
                />
                <FormTextField
                name="backgroundColor"
                :label="$t('Background Color')"
                :disabled="loading || saving"
                :placeholder="$t('Enter hex color (e.g., #ffffff)')"
                />
                <FormTextField
                name="themeColor"
                :label="$t('Theme Color')"
                :disabled="loading || saving"
                :placeholder="$t('Enter hex color (e.g., #4f46e5)')"
                />
            </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">
                    {{ $t('App Icons') }}
                </h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    :disabled="loading || saving"
                    @click="addIcon"
                    >
                    <Icon 
                    name="Plus" 
                    class="size-4 mr-2" 
                    />
                    {{ $t('Add Icon') }}
                </Button>
            </div>

            <div 
                v-if="icons.length === 0" 
                class="text-center py-8 text-muted-foreground"
                >
                {{ $t('No icons configured. Add icons for your PWA.') }}
            </div>

                <div class="flex flex-wrap [&>*]:p-2 -mx-2 -mt-2">
                    <div
                        v-for="(icon, index) in icons" 
                        :key="index" 
                        class="w-full xl:w-3/12"
                        >
                        <div class="border rounded-lg p-4">
                            <div class="flex items-center justify-between">
                                <h4 class="font-medium">
                                    {{ $t('Icon :0', [index + 1]) }}
                                </h4>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            :disabled="loading || saving"
                            @click="removeIcon(index)"
                            >
                            <Icon 
                            name="Trash2" 
                            class="size-4" 
                            />
                        </Button>
                            </div>

                            <div class="flex flex-col gap-y-4">
                                <FormImageUploader
                                v-model:file-url="iconUrls[index]"
                                v-model:loading="iconLoadings[index]"
                                :name="`icons.${index}.fileId`"
                                :label="$t('Icon Image')"
                                :disabled="loading || saving"
                                purpose="pwa-icon"
                                :public="true"
                                />

                                <FormTextField
                                :name="`icons.${index}.sizes`"
                                :label="$t('Sizes')"
                                :disabled="loading || saving"
                                :placeholder="$t('e.g., 192x192')"
                                />

                                <FormTextField
                                :name="`icons.${index}.type`"
                                :label="$t('Type')"
                                :disabled="loading || saving"
                                :placeholder="$t('e.g., image/png')"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            </Card>

            <Card>
            <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">
                    {{ $t('Screenshots') }}
                </h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    :disabled="loading || saving"
                    @click="addScreenshot"
                    >
                    <Icon 
                    name="Plus" 
                    class="size-4 mr-2" 
                    />
                    {{ $t('Add Screenshot') }}
                </Button>
            </div>

            <div 
                v-if="screenshots.length === 0" 
                class="text-center py-8 text-muted-foreground"
                >
                {{ $t('No screenshots configured. Add screenshots for your PWA.') }}
            </div>

                <div class="flex flex-wrap [&>*]:p-2 -mx-2 -mt-2">
                    <div
                        v-for="(screenshot, index) in screenshots" 
                        :key="index" 
                        class="w-full xl:w-2/12"
                        >
                        <div class="border rounded-lg p-4">
                            <div class="flex items-center justify-between">
                                <h4 class="font-medium">
                                    {{ $t('Screenshot :0', [index + 1]) }}
                                </h4>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            :disabled="loading || saving"
                            @click="removeScreenshot(index)"
                            >
                            <Icon 
                            name="Trash2" 
                            class="size-4" 
                            />
                        </Button>
                            </div>

                            <div class="flex flex-col gap-y-4">
                                <FormImageUploader
                                v-model:file-url="screenshotUrls[index]"
                                v-model:loading="screenshotLoadings[index]"
                                :name="`screenshots.${index}.fileId`"
                                :label="$t('Screenshot Image')"
                                :disabled="loading || saving"
                                purpose="pwa-screenshot"
                                :public="true"
                                />

                                <FormTextField
                                :name="`screenshots.${index}.formFactor`"
                                :label="$t('Form Factor')"
                                :disabled="loading || saving"
                                :placeholder="$t('e.g., wide, narrow')"
                                />

                                <FormTextField
                                :name="`screenshots.${index}.sizes`"
                                :label="$t('Sizes')"
                                :disabled="loading || saving"
                                :placeholder="$t('e.g., 1280x720')"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            </Card>
        </div>
    </form>

</template>
