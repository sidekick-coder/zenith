<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import * as v from 'valibot'

import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent } from '#client/components/ui/card'
import Button from '#client/components/Button.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import Icon from '#client/components/Icon.vue'
import FormSwitch from '#client/components/FormSwitch.vue'
import FormSelect from '#client/components/FormSelect.vue'
import di from '#client/utils/di.ts'
import auth from '#client/facades/auth.facade.ts'
import translator from '#client/facades/translator.facade.ts'

defineProps({
    title: {
        type: String,
        default: $t('Preferences'),
    },
    description: {
        type: String,
        default: $t('Manage your personal preferences'),
    },
})

const loading = ref(false)
const saving = ref(false)

const schema = toTypedSchema(v.object({
    darkMode: v.optional(v.boolean()),
    locale: v.nullish(v.string()),
}))

const { handleSubmit, resetForm } = useForm({
    validationSchema: schema,
    initialValues: {
        darkMode: false,
        locale: '',
    },
})

async function load() {
    if (!auth.user) {
        return
    }

    const state = di.get<Record<string, any>>('state') || {}
    const metas = state['user:metas'] || {}

    loading.value = true

    resetForm({
        values: {
            darkMode: metas['admin-ui:dark_mode'],
            locale: metas['locale'] || '',
        }
    })
    
    setTimeout(() => {
        loading.value = false
    }, 300)
}

const onSubmit = handleSubmit(async (data) => {
    if (!auth.user) {
        return
    }

    saving.value = true

    const [error] = await $fetch.try(`/api/users/${auth.user.id}/metas`, {
        method: 'PUT',
        data: [
            {
                name: 'admin-ui:dark_mode',
                value: data.darkMode ? 'bool:true' : 'bool:false',
            },
            {
                name: 'locale',
                value: data.locale || '',
            },
        ],
    })

    if (error) {
        saving.value = false
        return
    }

    toast.success($t('Preferences saved successfully!'))

    setTimeout(() => {
        window.location.reload()
    }, 800)
    
})

onMounted(() => {
    load()
})
</script>

<template>
    <form @submit="onSubmit">
        <div class="mb-6 flex">
            <div class="flex-1">
                <PageTitle>{{ title }}</PageTitle>
                <PageSubtitle>
                    {{ description }}
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

        <Card>
            <CardContent class="space-y-4">
                <FormSelect
                    name="locale"
                    label-key="label"
                    value-key="value"
                    clearable
                    :label="$t('Language')"
                    :disabled="loading || saving"
                    :options="translator.locales.map(l => ({
                        label: l,
                        value: l
                    }))"
                />
                <FormSwitch
                    name="darkMode"
                    :label="$t('Dark mode')"
                    :hint="$t('Enable dark theme for the application')"
                    :disabled="loading || saving"
                />
            </CardContent>
        </Card>
    </form>
</template>
