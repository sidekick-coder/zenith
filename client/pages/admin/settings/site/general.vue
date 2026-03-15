<script lang="ts" setup>
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { 
    computed, 
    onMounted, 
    ref 
} from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { ChevronDown } from 'lucide-vue-next'

import FormTextField from '#client/components/FormTextField.vue'
import FormImageUploader from '#client/components/FormImageUploader.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import Button from '#client/components/Button.vue'
import UiButton from '#client/components/ui/button/Button.vue'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Card from '#client/components/ui/card/Card.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'
import settingSiteValidator from '#shared/validators/settingSite.validator.ts'
import SettingLayout from '#client/layouts/SettingLayout.vue'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '#client/components/ui/dropdown-menu'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import Image from '#client/components/Image.vue'

const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const setting = ref<any>({})
const { handleSubmit, setValues, setFieldValue } = useForm({
    validationSchema: toTypedSchema(settingSiteValidator.create)
})

const availableRoutes = computed(() => {
    return router.getRoutes()
        .filter(route => route.path && !route.path.includes('*') && route.path !== '/' )
        .map(route => ({
            path: route.path,
            name: route.name || route.path
        }))
        .sort((a, b) => a.path.localeCompare(b.path))
})

function selectRoute(routePath: string) {
    setFieldValue('home_route_path', routePath)
}

const onSubmit = handleSubmit(async (form) => {
    saving.value = true

    const [error] = await tryCatch(() => {
        return $fetch('/api/configs/site', {
            method: 'PUT',
            data: form,
        })
    })

    if (error) {
        saving.value = false
        return
    }
    
    setTimeout(() => {
        saving.value = false
        toast.success($t('Updated successfully'))
    }, 1000)
})

async function load(){
    loading.value = true

    const [error, response] = await tryCatch(() => $fetch<any>('/api/configs/site'))

    if (error) return

    setValues(response)
    
    setting.value = response

    setTimeout(() => {
        loading.value = false
    }, 1000)
}

onMounted(load)
</script>
<template>
    <SettingLayout>
        <form
            class="space-y-4 py-2"
            @submit.prevent="onSubmit"
        >
            <div class="flex-1">
                <PageTitle>{{ $t('General') }}</PageTitle>
                <PageSubtitle>
                    {{ $t('Configure your general settings') }}
                </PageSubtitle>
            </div>
            <Card :loading="loading">
                <CardContent class="space-y-6">
                    <FormTextField
                        name="name"
                        :label="$t('Name')"
                    />

                    <FormTextField
                        name="support_email"
                        :label="$t('Support Email')"
                    />

                    <FormImageUploader
                        name="favicon_image_id"
                        :label="$t('Favicon')"
                        purpose="favicon"
                        :public="true"
                        :max-size="1024 * 1024"
                        :file-url="setting.favicon_url || '/favicon' "
                    />

                    <FormTextField
                        name="home_route_path"
                        :label="$t('Home route path')"
                    >
                        <template #append>
                            <DropdownMenu>
                                <DropdownMenuTrigger as-child>
                                    <UiButton
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        class="h-10 px-3"
                                    >
                                        <ChevronDown class="h-4 w-4" />
                                    </UiButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent 
                                    align="end" 
                                    class="w-64"
                                >
                                    <DropdownMenuItem
                                        v-for="route in availableRoutes"
                                        :key="route.path"
                                        class="cursor-pointer"
                                        @click="selectRoute(route.path)"
                                    >
                                        {{ route.path }}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </template>
                    </FormTextField>
                </CardContent>
     
                <CardFooter class="justify-end">
                    <Button
                        type="submit"
                        :loading="saving"
                    >
                        {{ $t('Save') }}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    </SettingLayout>
</template>