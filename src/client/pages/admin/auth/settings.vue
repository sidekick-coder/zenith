<script setup lang="ts">
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import AuthSettingGeneral from '#client/components/AuthSettingGeneral.vue'
import AuthSettingOauth from '#client/components/AuthSettingOauth.vue'
import AuthSettingDesign from '#client/components/AuthSettingDesign.vue'
</script>

<template>
    <div class="mb-6">
        <PageTitle>{{ $t('Authentication Settings') }}</PageTitle>
        <PageSubtitle>
            {{ $t('Configure your authentication') }}
        </PageSubtitle>
    </div>

    <div class="space-y-6">
        <AuthSettingGeneral />
        <AuthSettingOauth />
        <AuthSettingDesign />
    </div>
</template>
