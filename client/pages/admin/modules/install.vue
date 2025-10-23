<script setup lang="ts">
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import PageTitle from '#client/components/PageTitle.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#client/components/ui/tabs'
import InstallZip from '#client/components/InstallZip.vue'
import InstallGit from '#client/components/InstallGit.vue'
</script>

<template>
    <AppLayout>
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
                default-value="zip" 
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
    </AppLayout>
</template>