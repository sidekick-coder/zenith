<script setup lang="ts">
import { onMounted, ref } from 'vue'

const show = ref(false)

onMounted(() => {
    show.value = true
})
</script>
<template>
    <slot v-if="show" />
    <div
        v-else
        data-allow-mismatch
    >
        <slot name="fallback" />
    </div>
</template>