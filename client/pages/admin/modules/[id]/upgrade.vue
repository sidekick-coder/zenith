<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteQuery } from '@vueuse/router'
import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import SettingLayout from '#client/layouts/SettingLayout.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import PageTitle from '#client/components/PageTitle.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#client/components/ui/tabs'
import UpgradeZip from '#client/components/UpgradeZip.vue'
import UpgradeGit from '#client/components/UpgradeGit.vue'

const route = useRoute()
const tab = useRouteQuery('tab', 'zip')

const moduleId = computed(() => route.params.id as string)

const module = ref<any>({
    id: '',
    name: '',
    enabled: false
})

async function loadModule() {
    const [error, json] = await tryCatch(() => $fetch(`/api/modules/${moduleId.value}`, { method: 'GET' }))

    if (error) {
        console.error('Failed to load module:', moduleId.value)
        console.error(error)
        return
    }

    module.value = json
}

await loadModule()
</script>

<template>
    <SettingLayout>
        <div class="space-y-6">
            <div>
                <PageTitle>
                    {{ $t('Upgrade Module') }}
                </PageTitle>
                <PageSubtitle>
                    {{ $t('Upgrade an existing module from a ZIP file or Git repository') }}
                </PageSubtitle>
            </div>

            <Tabs 
                v-model="tab"
                class="w-full"
            >
                <TabsList class="grid w-full grid-cols-2">
                    <TabsTrigger value="zip">
                        {{ $t('From ZIP File') }}
                    </TabsTrigger>
                    <TabsTrigger value="git">
                        {{ $t('From Git Repository') }}
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent 
                    value="zip" 
                    class="mt-6"
                >
                    <UpgradeZip :module="module" />
                </TabsContent>
                
                <TabsContent 
                    value="git" 
                    class="mt-6"
                >
                    <UpgradeGit :module="module" />
                </TabsContent>
            </Tabs>
        </div>
    </SettingLayout>
</template>