<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import {
    defineAsyncComponent, onMounted, ref 
} from 'vue'
import { useRouteQuery } from '@vueuse/router'
import { toast } from 'vue-sonner'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $t } from '#shared/lang.ts'
import Tabs from '#client/components/ui/tabs/Tabs.vue'
import TabsList from '#client/components/ui/tabs/TabsList.vue'
import TabsTrigger from '#client/components/ui/tabs/TabsTrigger.vue'
import TabsContent from '#client/components/ui/tabs/TabsContent.vue'
import { tryCatch } from '#shared/tryCatch.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import type Role from '#shared/entities/role.entity.ts'

const route = useRoute()
const router = useRouter()
const roleId = route.params.id as string

const tab = useRouteQuery('tab', 'details')
const loading = ref(false)
const role = ref<Role>()

const tabs = [
    {
        id: 'details',
        label: $t('Details'),
        component: defineAsyncComponent(() => import('#client/components/RoleDetailsForm.vue')),
        props: { roleId: roleId }
    },
    {
        id: 'permissions',
        label: $t('Permissions'),
        component: defineAsyncComponent(() => import('#client/components/PermissionAssignments.vue')),
        props: { 
            assignType: 'role',
            assignId: roleId 
        },
    },
]

async function load(){
    loading.value = true

    const [error, response] = await tryCatch(() => $fetch<Role>(`/api/roles/${route.params.id}`))

    if (error) {
        loading.value = false
        toast.error($t('Failed to load role details.'))
        router.replace('/roles')
        return
    }

    role.value = response

    setTimeout(() => {
        loading.value = false
    }, 800)
}

onMounted(load)
</script>
<template>
    <AppLayout
        :breadcrumbs="[
            { label: $t('Roles'), to: '/admin/roles' },
            { label: role?.name || $t('Loading...') }
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
                    class="min-w-60"
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
                    v-if="t.component && role"
                    v-model="role"
                    v-bind="t.props"
                />
            </TabsContent>
        </Tabs>
    </AppLayout>
</template>