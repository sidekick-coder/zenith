<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppLayout from '#client/layouts/AppLayout.vue'
import UserDetailsForm from '#client/components/UserDetailsForm.vue'
import UserChangePasswordForm from '#client/components/UserChangePasswordForm.vue'

const route = useRoute()
const userId = route.params.id as string
</script>

<template>
    <AppLayout>
        <div class="space-y-8">
            <UserDetailsForm :user-id="userId" />
            <UserChangePasswordForm :user-id="userId" />
        </div>
    </AppLayout>
</template>