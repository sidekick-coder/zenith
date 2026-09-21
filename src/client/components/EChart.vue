<script setup lang="ts">
import { getThemeCurrent } from '@sidekick-coder/zenith-kit/client'
import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref } from 'vue'
import type { PropType } from 'vue'

const theme = getThemeCurrent()

const customTheme = {
    valueAxis: {
        axisLine: { lineStyle: { color: theme.foreground } },
        axisTick: { lineStyle: { color: theme.foreground } },
        axisLabel: { color: theme.foreground },
        splitLine: { lineStyle: { color: theme.foreground } },
    },
    categoryAxis: {
        axisLine: { lineStyle: { color: theme.foreground } },
        axisTick: { lineStyle: { color: theme.foreground } },
        axisLabel: { color: theme.foreground },
        splitLine: { lineStyle: { color: theme.foreground } },
    },
    tooltip: {
        backgroundColor: theme.background,
        borderColor: theme.border,
        borderWidth: 1,
        textStyle: { color: theme.foreground },
        axisPointer: {
            lineStyle: { color: theme.foreground },
            crossStyle: { color: theme.foreground },
            label: {
                color: theme.primaryForeground,
                backgroundColor: theme.primary 
            },
        },
    },
}

echarts.registerTheme('custom', customTheme)

const props = defineProps({
    options: {
        type: Object as PropType<echarts.EChartsOption>,
        default: () => ({}),
    },
    width: {
        type: String,
        default: '100%',
    },
    height: {
        type: String,
        default: '100%',
    },
})

const container = ref<HTMLDivElement>()
const chart = ref<echarts.ECharts>()

function load() {
    if (chart.value) {
        throw new Error('Chart already loaded')
    }

    if (!container.value) {
        throw new Error('Container not found')
    }


    const c = echarts.init(container.value, 'custom')

    c.setOption(props.options)

    chart.value = c
}

function destroy() {
    if (!chart.value) {
        throw new Error('Chart not loaded')
    }

    chart.value.dispose()
    chart.value = undefined
}

function resize() {
    if (!chart.value) {
        throw new Error('Chart not loaded')
    }

    chart.value.resize()
}

onMounted(load)
onUnmounted(destroy)

defineExpose({ resize, })
</script>

<template>
    <div
        ref="container"
        :style="{ width: props.width, height: props.height }"
    />
</template>
