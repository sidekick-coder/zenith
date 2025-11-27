<script setup lang="ts">
import LogoIcon from './LogoIcon.vue'
import config from '#client/facades/config.facade.ts'

const logoFileId = config.get('branding.logoFileId', null)
</script>

<template>
    <img
        v-if="logoFileId"
        :src="`/api/files/${logoFileId}/stream`"
        alt="Logo"
        class="size-8 rounded-md"
    >

    <div
        v-else
        class="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-sidebar-primary-foreground"
    >
        <LogoIcon class="size-5 fill-current text-foreground" />
    </div>
</template>
