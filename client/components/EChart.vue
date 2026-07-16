<script setup lang="ts">
import * as echarts from 'echarts'
import { onMounted, onUnmounted, ref } from 'vue'
import type { PropType } from 'vue'


const lightTheme = {
    color: [
        '#3b82f6', // blue-500
        '#22c55e', // green-500
        '#f59e0b', // amber-500
        '#ef4444', // red-500
        '#a855f7', // purple-500
        '#06b6d4', // cyan-500
        '#ec4899', // pink-500
        '#84cc16', // lime-500
    ],

    backgroundColor: 'transparent',

    textStyle: {
        // gray-800
        color: '#1f2937',
    },

    title: {
        textStyle: {
            // gray-900
            color: '#111827',
        },
        subtextStyle: {
            // gray-500
            color: '#6b7280',
        },
    },

    legend: {
        textStyle: {
            // gray-700
            color: '#374151',
        },
    },

    xAxis: {
        axisLine: {
            // gray-400
            lineStyle: { color: '#9ca3af' },
        },
        axisTick: { lineStyle: { color: '#9ca3af' }, },
        axisLabel: {
            // gray-600
            color: '#4b5563',
        },
        splitLine: {
            // gray-200
            lineStyle: { color: '#e5e7eb' },
        },
    },

    yAxis: {
        axisLine: { lineStyle: { color: '#9ca3af' }, },
        axisTick: { lineStyle: { color: '#9ca3af' }, },
        axisLabel: { color: '#4b5563', },
        splitLine: { lineStyle: { color: '#e5e7eb' }, },
    },
}

const darkTheme = {
    color: [
        '#60a5fa', // blue-400
        '#4ade80', // green-400
        '#fbbf24', // amber-400
        '#f87171', // red-400
        '#c084fc', // purple-400
        '#22d3ee', // cyan-400
        '#f472b6', // pink-400
        '#a3e635', // lime-400
    ],

    backgroundColor: 'transparent', // gray-900

    textStyle: { color: '#f3f4f6', }, // gray-100
    title: {
        textStyle: { color: '#f9fafb' }, // gray-50
        subtextStyle: { color: '#9ca3af' } // gray-400
    },

    legend: { textStyle: { color: '#d1d5db' } }, // gray-300

    xAxis: {
        axisLine: { lineStyle: { color: '#6b7280' } }, // gray-500
        axisTick: { lineStyle: { color: '#6b7280' }, },
        axisLabel: { color: '#d1d5db' }, // gray-300
        splitLine: { lineStyle: { color: '#374151' } }, // gray-700
    },

    yAxis: {
        axisLine: { lineStyle: { color: '#6b7280' }, },
        axisTick: { lineStyle: { color: '#6b7280' }, },
        axisLabel: { color: '#d1d5db', },
        splitLine: { lineStyle: { color: '#374151' }, },
    },
}

echarts.registerTheme('light', lightTheme)
echarts.registerTheme('dark', darkTheme)

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

    const c = echarts.init(container.value, 'dark')

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
