<script setup lang="ts">
import { Toaster } from '#app/components/ui/sonner'
import 'vue-sonner/style.css'
</script>
<template>
    <Toaster />
    <suspense>
        <router-view />
    </suspense>
</template>
