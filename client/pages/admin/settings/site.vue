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
import { $fetch } from '#client/utils/fetcher.ts'
import Button from '#client/components/Button.vue'
import UiButton from '#client/components/ui/button/Button.vue'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import Card from '#client/components/ui/card/Card.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'
import settingSiteValidator from '#shared/validators/settingSite.validator.ts'
import SettingLayout from '#client/layouts/SettingLayout.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '#client/components/ui/dropdown-menu'

const loading = ref(false)
const saving = ref(false)
const router = useRouter()
const { handleSubmit, setValues, setFieldValue } = useForm({ validationSchema: toTypedSchema(settingSiteValidator.create), })

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
        return $fetch('/api/settings/site', {
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

    const [error, response] = await tryCatch(() => $fetch<any>('/api/settings/site'))

    if (error) return

    setValues(response)

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
            <Card :loading="loading">
                <CardHeader>
                    <CardTitle>{{ $t('Site') }}</CardTitle>
                    <CardDescription>
                        {{ $t('Configure site') }}
                    </CardDescription>
                </CardHeader>
                <CardContent class="space-y-6">
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