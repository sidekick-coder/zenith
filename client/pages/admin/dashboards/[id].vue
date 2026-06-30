<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { PageTitle, PageSubtitle } from '@sidekick-coder/zenith-kit/components'
import { fetcher } from '@sidekick-coder/zenith-kit/client'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import DashboardBody from '#client/components/DashboardBody.vue'
import DashboardEntity from '#client/entities/Dashboard.ts'
import { provideDashboard } from '#client/composables/useDashboard.ts'
import { DashboardSchema, dashboardSchema } from '#shared/schemas/dashboardSchema.ts'
import DashboardWidgetData from '#client/entities/DashboardWidgetData.ts'

const route = useRoute()
const id = route.params.id as string

const entity = ref<DashboardEntity>(new DashboardEntity())
const body = ref<InstanceType<typeof DashboardBody>>()

provideDashboard(entity)

const loading = ref(false)
const saving = ref(false)
const dashboard = ref<DashboardSchema>()
const metas = ref<any>({})

async function load() {
    loading.value = true

    const [error, response] = await fetcher.try(`/api/dashboards/${id}`, { query: { with: 'metas' } })

    if (error) {
        loading.value = false
        return
    }

    dashboard.value = response
    metas.value = response.metas

    let widgets: any[] = response.metas?.widgets ?? []

    widgets = widgets.map(w => new DashboardWidgetData(w))

    entity.value
        .setName(response.name)
        .setDescription(response.description)
        .setWidgets(widgets)

    await new Promise(resolve => setTimeout(resolve, 500))

    loading.value = false
}

async function save() {
    saving.value = true

    const widgets = entity.value.widgets.map(w => ({
        id: w.id,
        definition_id: w.definition_id,
        x: w.x,
        y: w.y,
        columns: w.columns,
        rows: w.rows,
    }))

    const data = {
        ...metas.value,
        widgets
    }

    const [error] = await fetcher.try(`/api/dashboards/${id}/metas`, {
        method: 'PUT',
        data
    })

    if (error) {
        saving.value = false
        return
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    saving.value = false

    toast.success($t('Dashboard saved successfully'))

    await load()
}

function loadBody() {
    if (!body.value?.$el) return

    const el = body.value.$el as HTMLElement

    const width = el.offsetWidth

    entity.value.setContainerWidth(width)
}

onMounted(load)
onMounted(loadBody)
</script>

<template>
    <div>
        <div class="mb-6 flex items-center">
            <div class="flex-1">
                <PageTitle>
                    {{ entity.name || $t('Loading...') }}
                </PageTitle>
                <PageSubtitle v-if="entity.description">
                    {{ entity.description }}
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
                    @click="save"
                >
                    {{ $t('Save') }}
                </Button>
            </div>
        </div>
    </div>

    <DashboardBody
        v-if="!loading"
        ref="body"
        :widgets="entity.widgets"
        @add-widget="entity.addWidget()"
        @update:widgets="entity.setWidgets($event)"
    />
</template>
