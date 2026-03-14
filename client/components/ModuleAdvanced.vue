<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card'
import AlertButton from '#client/components/AlertButton.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps({
    module: {
        type: Object,
        required: true
    }
})

const isInstalling = ref(false)
const isSeeding = ref(false)
const isBuilding = ref(false)

async function installDependencies() {
    if (isInstalling.value) {
        return
    }

    isInstalling.value = true

    const [error] = await $fetch.try(`/api/modules/${props.module.id}/install-dependencies`, {
        method: 'POST'
    })

    if (error) {
        isInstalling.value = false
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

    const [error] = await $fetch.try(`/api/modules/${props.module.id}/seed`, {
        method: 'POST'
    })

    if (error) {
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

    const [error] = await $fetch.try(`/api/modules/${props.module.id}/build`, {
        method: 'POST'
    })

    if (error) {
        isBuilding.value = false
        return
    }

    setTimeout(() => {
        isBuilding.value = false
        toast.success($t('Module builded'))
    }, 500)
}
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>{{ $t('Dependencies') }}</CardTitle>
            <CardDescription>{{ $t('Install or update the module dependencies') }}</CardDescription>
        </CardHeader>
        <CardContent>
            <Button
                variant="outline"
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
        </CardContent>
    </Card>

    <Card>
        <CardHeader>
            <CardTitle>{{ $t('Seeds') }}</CardTitle>
            <CardDescription>{{ $t('Run database seeders for this module') }}</CardDescription>
        </CardHeader>
        <CardContent>
            <Button
                variant="outline"
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
        </CardContent>
    </Card>

    <Card>
        <CardHeader>
            <CardTitle>{{ $t('Build') }}</CardTitle>
            <CardDescription>{{ $t('Rebuild the module assets. This is an expensive operation that may take several minutes.') }}</CardDescription>
        </CardHeader>
        <CardContent>
            <AlertButton
                variant="destructive"
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
        </CardContent>
    </Card>
</template>
