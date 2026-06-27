<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { PageTitle, PageSubtitle } from '@sidekick-coder/zenith-kit/components'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import DashboardBody from '#client/components/DashboardBody.vue'
import type { DashboardSchema } from '#shared/schemas/index.ts'
import { dashboardSchema } from '#shared/schemas/dashboardSchema.ts'

const route = useRoute()
const id = route.params.id as string

const dashboard = ref<DashboardSchema>()
const loading = ref(false)
const saving = ref(false)
const widgets = ref<any[]>([])

const { handleSubmit, resetForm } = useForm({ validationSchema: toTypedSchema(dashboardSchema.update), })

async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() => $fetch<DashboardSchema>(`/api/dashboards/${id}`))

    if (error) {
        loading.value = false
        return
    }

    dashboard.value = response
    resetForm({ values: response })

    setTimeout(() => {
        loading.value = false
    }, 500)
}

const onSubmit = handleSubmit(async (data) => {
    saving.value = true

    const [error] = await tryCatch(() => $fetch(`/api/dashboards/${id}`, {
        method: 'PATCH',
        data,
    }))

    if (error) {
        saving.value = false
        return
    }

    setTimeout(async () => {
        saving.value = false
        toast.success($t('Dashboard saved successfully'))
        await load()
    }, 500)
})

onMounted(load)
</script>

<template>
    <form @submit="onSubmit">
        <div class="mb-6 flex items-center">
            <div class="flex-1">
                <PageTitle>
                    {{ dashboard?.name || $t('Loading...') }}
                </PageTitle>
                <PageSubtitle v-if="dashboard?.description">
                    {{ dashboard?.description }}
                </PageSubtitle>
            </div>
            <div class="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    :disabled="loading"
                    @click="widgets.push({ cols: { base: 4 } })"
                >
                    <Icon name="Plus" />
                    {{ $t('Add widget') }}
                </Button>
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
    </form>

    <DashboardBody
        v-model:widgets="widgets"
        class="mt-4"
        @add-widget="widgets.push({ cols: { base: 4 } })"
    />
</template>
