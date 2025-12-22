<script setup lang="ts">
import { ref, onMounted, computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { useRouteQuery } from '@vueuse/router'
import { toTypedSchema } from '@vee-validate/valibot'
import * as v from 'valibot'
import { toast } from 'vue-sonner'
import AppLayout from '#client/layouts/AppLayout.vue'
import Button from '#client/components/Button.vue'
import FormTextField from '#client/components/FormTextField.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '#client/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#client/components/ui/tabs'
import { Skeleton } from '#client/components/ui/skeleton'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { $t } from '#shared/lang'
import DriveConfig from '#shared/entities/driveConfig.entity.ts'

const route = useRoute()
const driveId = computed(() => route.params.id as string)

const drive = ref<DriveConfig>()
const loading = ref(true)
const saving = ref(false)
const tab = useRouteQuery('tab', 'config')

const tabs = [
    {
        id: 'config',
        label: $t('Config'),
        component: defineAsyncComponent(() => import('#client/components/DriveConfig.vue')),
    },
    {
        id: 'explorer',
        label: $t('Explorer'),
        component: defineAsyncComponent(() => Promise.resolve({
            template: '<div>Explorer content coming soon...</div>'
        })),
    }
]

const { setValues, handleSubmit } = useForm()

async function loadDrive() {
    loading.value = true
    
    const [error, response] = await tryCatch(() => $fetch(`/api/drives/${driveId.value}`, { method: 'GET' }))

    if (error) {
        console.error('Failed to load drive:', error)
        loading.value = false
        return
    }

    drive.value = new DriveConfig(response)
    
    // Set form values
    setValues(response)
    
    setTimeout(() => {
        loading.value = false
    }, 500)
}

const onSubmit = handleSubmit(async (data) => {
    saving.value = true

    const [error] = await $fetch.try(`/api/drives/${driveId.value}`, {
        method: 'PUT',
        data
    })

    if (error) {
        saving.value = false
        return
    }

    setTimeout(() => {
        toast.success($t('Drive updated successfully'))
        saving.value = false
    }, 500)
})

onMounted(loadDrive)
</script>

<template>
    <AppLayout
        :breadcrumbs="[
            { label: $t('Drives'), to: '/admin/drives' },
            { label: drive?.name || '...' }
        ]"
    >
        <div
            v-if="loading"
            class="flex flex-col space-y-3"
        >
            <Skeleton class="h-[125px] w- rounded-xl" />
            <div class="space-y-2">
                <Skeleton class="h-4 w-[80%]" />
                <Skeleton class="h-4 w-[60%]" />
            </div>
        </div>

        <div
            v-else
            class="flex flex-wrap [&>*]:px-4 gap-y-4 -mx-4"
        >
            <div class="w-full flex items-center justify-between">
                <div>
                    <PageTitle>
                        {{ $t('Edit Drive') }}
                    </PageTitle>
                    <PageSubtitle>
                        {{ $t('Update the drive information below') }}
                    </PageSubtitle>
                </div>
            </div>

            <div class="w-full xl:w-4/12 2xl:w-3/12 flex flex-col space-y-6">
                <Card v-if="drive">
                    <CardHeader>
                        <CardTitle>
                            {{ $t('Details') }}
                        </CardTitle>
                        <CardDescription>
                            {{ $t('Drive general information') }}
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

            <div class="w-full xl:w-8/12 2xl:w-9/12 flex flex-col space-y-6">
                <Tabs
                    v-if="drive"
                    v-model="tab"
                    class="w-full"
                >
                    <TabsList>
                        <TabsTrigger
                            v-for="t in tabs"
                            :key="t.id"
                            :value="t.id"
                        >
                            {{ t.label }}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent
                        v-for="t in tabs"
                        :key="t.id"
                        :value="t.id"
                    >
                        <component
                            :is="t.component"
                            :drive="drive"
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </AppLayout>
</template>