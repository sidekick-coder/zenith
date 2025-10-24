<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { kebabCase } from 'lodash-es'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
})

const iconName = computed(() => {
    if (props.name.includes(':')) {
        return props.name
    }

    return `lucide:${kebabCase(props.name)}`
})
</script>

<template>
    <Icon :icon="iconName" />
</template>