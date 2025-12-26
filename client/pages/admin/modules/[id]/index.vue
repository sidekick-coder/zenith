<script setup lang="ts">
import {
    computed, defineAsyncComponent, ref
} from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import SettingLayout from '#client/layouts/SettingLayout.vue'
import Icon from '#client/components/Icon.vue'
import Button from '#client/components/Button.vue'
import AlertButton from '#client/components/AlertButton.vue'
import Card from '#client/components/ui/card/Card.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'


import { $fetch } from '#client/utils/fetcher.ts'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { CardFooter } from '#client/components/ui/card/index.ts'

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
const isInstalling = ref(false)
const isSeeding = ref(false)
const isBuilding = ref(false)

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

async function installDependencies() {
    if (isInstalling.value) {
        return
    }
    
    isInstalling.value = true
    
    const [error] = await tryCatch(() => $fetch(`/api/modules/${id.value}/install-dependencies`, { 
        method: 'POST' 
    }))
    
    if (error) {
        console.error('Failed to install dependencies:', error)
        return
    }
    
    setTimeout(() => {
        isInstalling.value = false
        toast.success($t('Module dependencies installed'))
    }, 500)

}

async function runSeeds() {
    if (isSeeding.value) {
        return
    }
    
    isSeeding.value = true
    
    const [error] = await tryCatch(() => $fetch(`/api/modules/${id.value}/seed`, { 
        method: 'POST' 
    }))
    
    if (error) {
        console.error('Failed to run seeds:', error)
        isSeeding.value = false
        return
    }
    
    setTimeout(() => {
        isSeeding.value = false
        toast.success($t('Module seeds run completed'))
    }, 500)
}

async function buildModule() {
    if (isBuilding.value) {
        return
    }
    
    isBuilding.value = true
    
    const [error] = await $fetch.try(`/api/modules/${id.value}/build`, { 
        method: 'POST' 
    })
    
    if (error) {
        console.error('Failed to build module:', error)
        return
    }

    setTimeout(() => {
        isBuilding.value = false
        toast.success($t('Module builded'))
    }, 500)
    
}


</script>
<template>
    <SettingLayout :padding="false">
        <div class="flex min-h-full w-full">
            <Card class="w-full lg:w-3/12 xl:w-2/12 min-h-full rounded-none shadow-none">
                <CardHeader class="text-center">
                    <div class="flex justify-center items-center">
                        <div class=" bg-primary text-white rounded-md size-18 flex items-center justify-center mb-2">
                            <Icon
                                name="Puzzle"
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

                <CardFooter class="flex flex-col gap-3">
                    <Button 
                        :to="`/admin/modules/${item.id}/upgrade`"
                        variant="outline"
                        class="w-full" 
                    >
                        {{ $t('Upgrade') }}
                    </Button>
                    
                    <Button 
                        variant="outline"
                        class="w-full"
                        :disabled="isInstalling"
                        @click="installDependencies"
                    >
                        <Icon
                            v-if="isInstalling"
                            name="LoaderCircle"
                            class="size-4 mr-2 animate-spin"
                        />
                        {{ $t('Install Dependencies') }}
                    </Button>
                    
                    <Button 
                        variant="outline"
                        class="w-full"
                        :disabled="isSeeding"
                        @click="runSeeds"
                    >
                        <Icon
                            v-if="isSeeding"
                            name="LoaderCircle"
                            class="size-4 mr-2 animate-spin"
                        />
                        {{ $t('Run Seeds') }}
                    </Button>
                    
                    <AlertButton 
                        variant="destructive"
                        class="w-full"
                        :disabled="isBuilding"
                        :title="$t('Build Module')"
                        :description="$t('Building a module is an expensive operation that may take several minutes and consume significant system resources. Are you sure you want to proceed?')"
                        @confirm="buildModule"
                    >
                        <Icon
                            v-if="isBuilding"
                            name="LoaderCircle"
                            class="size-4 mr-2 animate-spin"
                        />
                        {{ $t('Build Module') }}
                    </AlertButton>
                </CardFooter>
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
                        @click="tab = t.name"
                    >
                        {{ t.label }}
                    </Button>
                </div>

                <Suspense>
                    <component
                        :is="component"
                        v-if="component"
                        :id="item.id"
                        :module="item"
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
    </SettingLayout>
</template>