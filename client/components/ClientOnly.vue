<script setup lang="ts">
import { onMounted, ref } from 'vue'

const ssr = import.meta.env.SSR
</script>
<template>
    <slot v-if="!ssr" />
    <div v-else>
        <slot name="fallback" />
    </div>
</template>