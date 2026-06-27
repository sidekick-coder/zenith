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
import DashboardEntity from '#client/entities/dashboard.entity.ts'
import { provideDashboard } from '#client/composables/useDashboard.ts'
import type { DashboardSchema } from '#shared/schemas/index.ts'
import { dashboardSchema } from '#shared/schemas/dashboardSchema.ts'

const route = useRoute()
const id = route.params.id as string

const entity = ref<DashboardEntity>()

provideDashboard(entity)
const loading = ref(false)
const saving = ref(false)

const { handleSubmit, resetForm } = useForm({ validationSchema: toTypedSchema(dashboardSchema.update) })

async function load() {
    loading.value = true

    const [error, dashboard] = await tryCatch(() => $fetch<DashboardSchema>(`/api/dashboards/${id}`))

    if (error) {
        loading.value = false
        return
    }

    resetForm({ values: dashboard })

    const [, metas] = await tryCatch(() => $fetch<Record<string, any>>(`/api/dashboards/${id}/metas`))

    entity.value = new DashboardEntity(dashboard, metas?.widgets ?? [])

    setTimeout(() => {
        loading.value = false
    }, 500)
}

const onSubmit = handleSubmit(async (data) => {
    if (!entity.value) return

    saving.value = true

    const [error] = await tryCatch(() => Promise.all([
        $fetch(`/api/dashboards/${id}`, { method: 'PATCH', data }),
        $fetch(`/api/dashboards/${id}/metas`, { method: 'PUT', data: { widgets: entity.value!.widgets } }),
    ]))

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
                    {{ entity?.dashboard.name || $t('Loading...') }}
                </PageTitle>
                <PageSubtitle v-if="entity?.dashboard.description">
                    {{ entity?.dashboard.description }}
                </PageSubtitle>
            </div>
            <div class="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    :disabled="loading"
                    @click="entity?.addWidget()"
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
        v-if="entity"
        :widgets="entity.widgets"
        class="mt-4"
        @add-widget="entity.addWidget()"
        @update:widgets="entity.setWidgets($event)"
    />
</template>
