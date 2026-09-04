<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useDashboardWidget  } from '@sidekick-coder/zenith-kit/client'
import type { DashboardWidgetDefinitionChart } from '@sidekick-coder/zenith-kit/client'
import { tryCatch } from '@sidekick-coder/zenith-kit/shared'
import EChart from './EChart.vue'
import Icon from './Icon.vue'

const widget = useDashboardWidget()
const options = ref()
const loading = ref(false)
const error = ref<any>()
const chartRef = ref<InstanceType<typeof EChart>>()

const def = widget.value.definition as DashboardWidgetDefinitionChart

async function load() {
    loading.value = true

    const [err, data] = await tryCatch(() => def.chartOptions(widget.value.options))

    if (err) {
        loading.value = false
        error.value = err
        return
    }

    options.value = data

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
    <div
        v-if="loading"
        class="flex items-center justify-center h-full @container"
    >
        <Icon
            name="Loader"
            class="animate-spin mr-2 @md:text-xl"
        />
    </div>

    <div
        v-else-if="error"
        class="flex flex-col items-center justify-center h-full"
    >
        <div class="text-red-500 text-lg font-bold mb-2">
            {{ error?.error }}
        </div>
        <div class="text-red-500 text-xs">
            {{ error.message }}
        </div>
    </div>

    <EChart
        v-else-if="options"
        ref="chartRef"
        :options="options"
    />

    <div
        v-else
        class="flex items-center justify-center h-full @container"
    >
        <div class="text-muted text-8xl">
            <Icon
                name="ChartPie"
                class="mr-2"
            />
        </div>
    </div>
</template>
