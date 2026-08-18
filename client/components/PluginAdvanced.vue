<script setup lang="ts">
import { ref } from 'vue'
import { toast } from '@sidekick-coder/zenith-kit/client'

import { DialogForm } from '@sidekick-coder/zenith-kit/components'
import { $fetch } from '#client/utils/fetcher.ts'
import { $server } from '#client/utils/server.ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card/index.ts'
import AlertButton from '#client/components/AlertButton.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import schemas from '#shared/validators/index.ts'

defineOptions({ inheritAttrs: false, })

const props = defineProps({
    plugin: {
        type: Object,
        required: true,
    },
})


const isInstalling = ref(false)
const isSeeding = ref(false)
const isBuilding = ref(false)

async function installDependencies() {
    toast.error($t('This feature is not available yet. Please install dependencies manually.'))
    // if (isInstalling.value) {
    //     return
    // }
    //
    // isInstalling.value = true
    //
    // const [error] = await $fetch.try(`/api/modules/${props.module.id}/install-dependencies`, { method: 'POST' })
    //
    // if (error) {
    //     isInstalling.value = false
    //     return
    // }
    //
    // setTimeout(() => {
    //     isInstalling.value = false
    //     toast.success($t('Module dependencies installed'))
    // }, 500)
}

async function uninstall(data: any) {

    const [error] = await $fetch.try(`/api/plugins/${props.plugin.id}/uninstall`, {
        method: 'DELETE',
        data
    })

    if (error) {
        return
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    const url = new URL('/api/reloader', window.location.origin)

    url.searchParams.append('redirect_to', '/admin/plugins')
    url.searchParams.append('delay', '3000')

    window.location.href = url.toString()

}

async function buildModule() {
    toast.error($t('This feature is not available yet. Please build the module manually.'))
    // if (isBuilding.value) {
    //     return
    // }
    //
    // isBuilding.value = true
    //
    // const [error] = await $fetch.try(`/api/modules/${props.module.id}/build`, { method: 'POST' })
    //
    // if (error) {
    //     isBuilding.value = false
    //     return
    // }
    //
    // setTimeout(() => {
    //     isBuilding.value = false
    //     toast.success($t('Module builded'))
    // }, 500)
}
</script>

<template>
    <div class="space-y-4">
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
                <CardTitle>{{ $t('Build') }}</CardTitle>
                <CardDescription>
                    {{ $t('Rebuild the module assets. This is an expensive operation that may take several minutes.') }}
                </CardDescription>
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

        <Card v-if="!plugin.enabled">
            <CardHeader>
                <CardTitle>{{ $t('Uninstall') }}</CardTitle>
                <CardDescription>
                    {{ $t('Permanently remove this module and optionally rollback its migrations.') }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DialogForm
                    :title="$t('Uninstall')"
                    :description="$t('Are you sure you want to uninstall the module :0?', [plugin.name])"
                    :submit-text="$t('Confirm')"
                    :handle="data => uninstall(data)"
                    :fields="{
                        rollback: {
                            component: 'switch',
                            label: $t('Rollback migrations'),
                        }
                    }"
                >
                    <Button variant="destructive">
                        {{ $t('Uninstall') }}
                    </Button>
                </DialogForm>
            </CardContent>
        </Card>
    </div>
</template>
