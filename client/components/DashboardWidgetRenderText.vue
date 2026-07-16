<script setup lang="ts">
import { computed  } from 'vue'
import type { HTMLAttributes } from 'vue'
import { useDashboardWidget } from '@sidekick-coder/zenith-kit/client'

const widget = useDashboardWidget()

const text = computed(() => {
    return widget.value.options.text || 'Default text'
})

const styles = computed(() => {
    const result = {
        color: '#ffffff',
        fontSize: '1rem',
        textAlign: 'center',
    }

    if (widget.value.options.color) {
        result.color = widget.value.options.color
    }

    if (widget.value.options.size) {
        result.fontSize = widget.value.options.size + 'rem'
    }

    if (widget.value.options.textAlign) {
        result.textAlign = widget.value.options.textAlign
    }

    return result as HTMLAttributes['style']
})


</script>
<template>
    <div
        class="w-full h-full flex items-center justify-center"
        :style="styles"
    >
        {{ text }}
    </div>
</template>
