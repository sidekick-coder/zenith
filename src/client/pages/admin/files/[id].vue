<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useRouteQuery } from '@vueuse/router'

import { tryCatch } from '@sidekick-coder/zenith-kit/shared/utils/tryCatch'
import Tabs from '#client/components/ui/tabs/Tabs.vue'
import TabsList from '#client/components/ui/tabs/TabsList.vue'
import TabsTrigger from '#client/components/ui/tabs/TabsTrigger.vue'
import TabsContent from '#client/components/ui/tabs/TabsContent.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import type File from '#shared/entities/file.entity.ts'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'

const route = useRoute()
const router = useRouter()
const fileId = route.params.id as string

const tab = useRouteQuery('tab', 'details')
const loading = ref(false)
const file = ref<File>()

const tabs = [
    {
        id: 'details',
        label: $t('Details'),
        component: defineAsyncComponent(() => import('#client/components/FileDetailsForm.vue')),
        props: { fileId: fileId }
    },
    {
        id: 'metas',
        label: $t('Metas'),
        component: defineAsyncComponent(() => import('#client/components/FileMetas.vue')),
        props: { fileId: fileId }
    },
]

async function load(){
    loading.value = true
    
    const [error, response] = await tryCatch(() => $fetch<File>(`/api/files/${route.params.id}`))

    if (error) {
        loading.value = false
        router.replace('/admin/files')
        return
    }

    file.value = response

    setTimeout(() => {
        loading.value = false
    }, 800)
}

function openFileUrl() {
    if (file.value?.url) {
        window.open(file.value.url, '_blank')
    }
}

onMounted(load)
</script>
<template>
    <div class="flex mb-6">
        <div class="flex flex-col flex-1">
            <PageTitle>
                {{ file?.client_name || $t('Loading...') }}
            </PageTitle>
            <PageSubtitle>
                {{ file?.mimetype || $t('File details and metadata') }}
            </PageSubtitle>
        </div>
        <div 
            v-if="file?.url"
            class="flex gap-2"
        >
            <Button
                variant="outline"
                @click="openFileUrl"
            >
                <Icon name="ExternalLink" />
                {{ $t('Open File') }}
            </Button>
        </div>
    </div>

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
                v-if="t.component && file"
                v-model="file"
                v-bind="t.props"
            />
        </TabsContent>
    </Tabs>
</template>
