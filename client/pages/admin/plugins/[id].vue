<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteQuery } from '@sidekick-coder/zenith-kit/components'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card/index.ts'
import { Tabs, TabsList, TabsTrigger } from '#client/components/ui/tabs/index.ts'
import { Skeleton } from '#client/components/ui/skeleton/index.ts'
import TextField from '#client/components/TextField.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import TabsContent from '#client/components/ui/tabs/TabsContent.vue'

const route = useRoute()
const pluginId = computed(() => route.params.id as string)

const item = ref<any>(null)
const loading = ref(true)
const tab = useRouteQuery('tab', 'migrations')

const tabs: any[] = [
    {
        id: 'migrations',
        label: $t('Migrations'),
        component: defineAsyncComponent(() => import('#client/components/PluginMigrations.vue')),
    },
    {
        id: 'seeders',
        label: $t('Seeders'),
        component: defineAsyncComponent(() => import('#client/components/PluginSeeders.vue')),
    },
    {
        id: 'versions',
        label: $t('Versions'),
        component: defineAsyncComponent(() => import('#client/components/PluginVersions.vue')),
    },
    {
        id: 'advanced',
        label: $t('Advanced'),
        component: defineAsyncComponent(() => import('#client/components/PluginAdvanced.vue')),
    },
]

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try(`/api/plugins/${pluginId.value}`)

    if (error) {
        loading.value = false
        return
    }

    item.value = response
    loading.value = false
}

onMounted(load)
</script>

<template>
    <div
        v-if="
            loading"
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
                    {{ item?.name || $t('Plugin') }}
                </PageTitle>
                <PageSubtitle>
                    {{ item?.description || $t('Plugin details and configuration') }}
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
                        {{ $t('Plugin general information') }}
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
                        :label="$t('Directory')"
                        :model-value="item.directory"
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
                v-if="item && tabs.length"
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
                        :key="t.id"
                        :plugin="item"
                    />
                </TabsContent>
            </Tabs>
        </div>
    </div>
</template>
