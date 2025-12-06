<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { kebabCase } from 'lodash-es'
import ClientOnly from './ClientOnly.vue'

defineOptions({
    inheritAttrs: false,
})

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
    <ClientOnly>
        <Icon
            :icon="iconName"
            v-bind="$attrs"
        />

        <template #fallback>
            <span v-bind="$attrs" />
        </template>
    </ClientOnly>
</template>