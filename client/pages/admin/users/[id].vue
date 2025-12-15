<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import {
    defineAsyncComponent, onMounted, ref 
} from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { toast } from 'vue-sonner'
import AppLayout from '#client/layouts/AppLayout.vue'

import Tabs from '#client/components/ui/tabs/Tabs.vue'
import TabsList from '#client/components/ui/tabs/TabsList.vue'
import TabsTrigger from '#client/components/ui/tabs/TabsTrigger.vue'
import TabsContent from '#client/components/ui/tabs/TabsContent.vue'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import type User from '#shared/entities/user.entity.ts'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

const tab = useRouteQuery('tab', 'details')
const loading = ref(false)
const user = ref<User>()

const tabs = [
    {
        id: 'details',
        label: $t('Details'),
        component: defineAsyncComponent(() => import('#client/components/UserDetailsForm.vue')),
        props: { userId: userId }
    },
    {
        id: 'change-password',
        label: $t('Password'),
        component: defineAsyncComponent(() => import('#client/components/UserChangePasswordForm.vue')),
        props: { userId: userId }
    },
    {
        id: 'roles',
        label: $t('Roles'),
        component: defineAsyncComponent(() => import('#client/components/UserRoles.vue')),
        props: { 
            userId: userId
        },
    },
    {
        id: 'permissions',
        label: $t('Permissions'),
        component: defineAsyncComponent(() => import('#client/components/PermissionAssignments.vue')),
        props: { 
            assignType: 'user',
            assignId: userId 
        },
    },
    {
        id: 'metas',
        label: $t('Metas'),
        component: defineAsyncComponent(() => import('#client/components/UserMetas.vue')),
        props: { userId: userId }
    },
]

async function load(){
    loading.value = true
    
    const [error, response] = await tryCatch(() => $fetch<User>(`/api/users/${route.params.id}`))

    if (error) {
        loading.value = false
        toast.error($t('Failed to load user details.'))
        router.replace('/admin/users')
        return
    }

    user.value = response

    setTimeout(() => {
        loading.value = false
    }, 800)
}

onMounted(load)
</script>
<template>
    <AppLayout
        :breadcrumbs="[
            { label: $t('Users'), to: '/admin/users' },
            { label: user?.name || $t('Loading...') }
        ]"
    >
        <Tabs
            v-model="tab"
            default-value="details" 
        >
            <TabsList>
                <TabsTrigger
                    v-for="t in tabs"
                    :key="t.id"
                    :value="t.id"
                >
                    {{ t.label }}
                </TabsTrigger>
            </TabsList>
                                
            <TabsContent
                v-for="t in tabs"
                :key="t.id"
                :value="t.id"
            >
                <component
                    :is="t.component"
                    v-if="t.component && user"
                    v-model="user"
                    v-bind="t.props"
                />
            </TabsContent>
        </Tabs>
    </AppLayout>
</template>