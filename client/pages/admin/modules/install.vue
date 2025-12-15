<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'

import SettingLayout from '#client/layouts/SettingLayout.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import PageTitle from '#client/components/PageTitle.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#client/components/ui/tabs'
import InstallZip from '#client/components/InstallZip.vue'
import InstallGit from '#client/components/InstallGit.vue'

const tab = useRouteQuery('tab', 'zip')

</script>

<template>
    <SettingLayout>
        <div class="space-y-6">
            <div>
                <PageTitle>
                    {{ $t('Install Module') }}
                </PageTitle>
                <PageSubtitle>
                    {{ $t('Install a module from a ZIP file or Git repository') }}
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
                    <InstallZip />
                </TabsContent>
                
                <TabsContent 
                    value="git" 
                    class="mt-6"
                >
                    <InstallGit />
                </TabsContent>
            </Tabs>
        </div>
    </SettingLayout>
</template>