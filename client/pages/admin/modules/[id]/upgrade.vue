<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteQuery } from '@vueuse/router'
import { $t } from '#shared/lang.ts'
import $fetch from '#client/facades/fetch.facade.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import SettingLayout from '#client/layouts/SettingLayout.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import PageTitle from '#client/components/PageTitle.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#client/components/ui/tabs'
import UpgradeZip from '#client/components/UpgradeZip.vue'
import UpgradeGit from '#client/components/UpgradeGit.vue'

const route = useRoute()
const tab = useRouteQuery<string>('tab', 'zip')
const loading = ref(false)

const moduleId = computed(() => route.params.id as string)

const module = ref<any>({
    id: '',
    name: '',
    enabled: false
})

async function load() {
    loading.value = true

    const [error, json] = await $fetch.try(`/api/modules/${moduleId.value}`, {
        query: {
            include: 'upgrade_info'
        }
    })

    if (error) {
        loading.value = false
        return
    }

    module.value = json
    tab.value = module.value.upgrade_info?.source === 'git' ? 'git' : 'zip'

    setTimeout(() => {
        loading.value = false
    }, 300)
}

onMounted(load)
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
                <TabsList>
                    <TabsTrigger value="zip">
                        {{ $t('ZIP File') }}
                    </TabsTrigger>
                    <TabsTrigger value="git">
                        {{ $t('Git Repository') }}
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="zip">
                    <UpgradeZip
                        v-if="!loading"
                        :module="module"
                    />
                </TabsContent>
                
                <TabsContent value="git">
                    <UpgradeGit
                        v-if="!loading"
                        :module="module"
                    />
                </TabsContent>
            </Tabs>
        </div>
    </SettingLayout>
</template>