<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteQuery } from '@vueuse/router'
import AdminLayout from '#client/layouts/AdminLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#client/components/ui/tabs'
import { Skeleton } from '#client/components/ui/skeleton'
import TextField from '#client/components/TextField.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

const route = useRoute()
const moduleId = computed(() => route.params.id as string)

const item = ref<any>(null)
const loading = ref(true)
const tab = useRouteQuery('tab', 'migrations')

const tabs = [
    {
        id: 'migrations',
        label: $t('Migrations'),
        component: defineAsyncComponent(() => import('#client/components/ModuleMigrations.vue')),
    },
    {
        id: 'upgrade',
        label: $t('Upgrade'),
        component: defineAsyncComponent(() => import('#client/components/ModuleUpgrade.vue')),
    },
    {
        id: 'versions',
        label: $t('Versions'),
        component: defineAsyncComponent(() => import('#client/components/ModuleVersions.vue')),
    },
    {
        id: 'advanced',
        label: $t('Advanced'),
        component: defineAsyncComponent(() => import('#client/components/ModuleAdvanced.vue')),
    },
]

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try(`/api/modules/${moduleId.value}`, { 
        query: {
            include: 'upgrade_info'
        }
    })

    if (error) {
        loading.value = false
        return
    }

    item.value = response
    loading.value = false
}

await load()
</script>

<template>
    <AdminLayout
        :breadcrumbs="[
            { label: $t('Modules'), to: '/admin/modules' },
            { label: item?.name || '...' }
        ]"
    >
        <div
            v-if="loading"
            class="flex flex-col space-y-3"
        >
            <Skeleton class="h-[125px] w-full rounded-xl" />
            <div class="space-y-2">
                <Skeleton class="h-4 w-[80%]" />
                <Skeleton class="h-4 w-[60%]" />
            </div>
        </div>

        <div
            v-else
            class="flex flex-wrap [&>*]:px-4 gap-y-4 -mx-4"
        >
            <div class="w-full flex items-center justify-between">
                <div>
                    <PageTitle>
                        {{ item?.name || $t('Module') }}
                    </PageTitle>
                    <PageSubtitle>
                        {{ item?.description || $t('Module details and configuration') }}
                    </PageSubtitle>
                </div>
            </div>

            <div class="w-full xl:w-4/12 2xl:w-3/12 flex flex-col space-y-6">
                <Card v-if="item">
                    <CardHeader>
                        <CardTitle>
                            {{ $t('Details') }}
                        </CardTitle>
                        <CardDescription>
                            {{ $t('Module general information') }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <TextField
                            :label="$t('ID')"
                            :model-value="item.id"
                            :readonly="true"
                        />
                        <TextField
                            :label="$t('Name')"
                            :model-value="item.name"
                            :readonly="true"
                        />
                        <TextField
                            :label="$t('Version')"
                            :model-value="item.version || '-'"
                            :readonly="true"
                        />
                        <TextField
                            :label="$t('Status')"
                            :model-value="item.enabled ? $t('Enabled') : $t('Disabled')"
                            :readonly="true"
                        />
                    </CardContent>
                </Card>
            </div>

            <div class="w-full xl:w-8/12 2xl:w-9/12 flex flex-col space-y-6">
                <Tabs
                    v-if="item"
                    v-model="tab"
                    class="w-full"
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
                            v-if="t.component"
                            :module="item"
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    </AdminLayout>
</template>
