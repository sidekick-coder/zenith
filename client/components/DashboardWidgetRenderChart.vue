<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import EChart from './EChart.vue'
import { useDashboardWidget } from '#client/composables/useDashboardWidget.ts'
import type DashboardWidgetDefinitionChart from '#client/entities/DashboardWidgetDefinitionChart.ts'

const widget = useDashboardWidget()
const options = ref()
const loading = ref(false)
const chartRef = ref<InstanceType<typeof EChart>>()

const def = widget.value.definition as DashboardWidgetDefinitionChart

async function load() {
    loading.value = true

    options.value = await def.chartOptions(widget.value.options)

    await new Promise(resolve => setTimeout(resolve, 800)) // wait for chart to render 

    loading.value = false
}

function resize() {
    chartRef.value?.resize()
}

onMounted(load)

watch([() => widget.value.rows, () => widget.value.columns], resize)

watchDebounced(() => widget.value.options, load, {
    debounce: 500,
    deep: true
})
</script>
<template>
    <EChart
        v-if="options && !loading"
        ref="chartRef"
        :options="options"
    />
</template>
