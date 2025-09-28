<script setup lang="ts">
import {
    computed, defineAsyncComponent, ref, 
    watch
} from 'vue'
import { useRoute } from 'vue-router'
import Dashboard from '#client/layouts/AppLayout.vue'
import Icon from '#client/components/Icon.vue'
import Button from '#client/components/Button.vue'
import Card from '#client/components/ui/card/Card.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'

import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'

const route = useRoute()
const id = computed(() => route.params.id as string)

const item = ref<any>({
    id: '',
    name: '',
    description: '' 
})

async function load(){
    const [error, json] = await tryCatch(() => $fetch(`/api/modules/${id.value}`, { method: 'GET', }))

    if (error) {
        console.error('Failed to load module:', id.value)
        console.error(error)
        return
    }

    item.value = json
}

await load()

const tab = ref('migrations')

const tabs = [
    {
        name: 'migrations',
        label: $t('Migrations'),
        component: defineAsyncComponent(() => import('#client/components/ModuleMigrations.vue')),
    },
]

const component = computed(() => {
    const activeTab = tabs.find(t => t.name === tab.value)

    if (!activeTab) {
        return null
    }

    return activeTab ? activeTab.component : null
})


</script>
<template>
    <Dashboard :padding="false">
        <div class="flex min-h-full w-full">
            <Card class="w-full lg:w-3/12 xl:w-2/12 min-h-full rounded-none shadow-none">
                <CardHeader class="text-center">
                    <div class="flex justify-center items-center">
                        <div class=" bg-primary text-white rounded-md size-18 flex items-center justify-center mb-2">
                            <Icon
                                name="PuzzleIcon"
                                class="size-10"
                            />
                        </div>
                    </div>

                    <CardTitle class="text-2xl font-bold">
                        {{ item.name }}
                    </CardTitle>
                    <CardDescription>
                        {{ item.description || $t('No description available') }}
                    </CardDescription>
                </CardHeader>
            </Card>
            <div class="flex-1 flex flex-col">
                <div class="border-b">
                    <Button
                        v-for="t in tabs"
                        :key="t.name"
                        variant="ghost"
                        class="py-5 rounded-none border-b-2 border-transparent hover:border-gray-300 focus:border-gray-300 min-w-[100px]"
                        :class="{
                            'border-primary text-primary': t.name === tab,
                            'text-muted-foreground': t.name !== tab
                        }"
                    >
                        {{ t.label }}
                    </Button>
                </div>

                <Suspense>
                    <component
                        :is="component"
                        v-if="component"
                        :id="item.id"
                    />
                    <template #fallback>
                        <div class="flex items-center justify-center h-full">
                            <Icon
                                name="LoaderCircle"
                                class="size-10 animate-spin text-gray-500"
                            />
                        </div>
                    </template>
                </Suspense>
            </div>
        </div>
    </Dashboard>
</template>