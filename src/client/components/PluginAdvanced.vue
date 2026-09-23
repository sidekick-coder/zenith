<script setup lang="ts">
import { ref } from 'vue'
import { toast, waitForServer } from '@sidekick-coder/zenith-kit/client'

import { DialogForm } from '@sidekick-coder/zenith-kit/components'
import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card/index.ts'
import AlertButton from '#client/components/AlertButton.vue'
import Button from '#client/components/Button.vue'

defineOptions({ inheritAttrs: false, })

const props = defineProps({
    plugin: {
        type: Object,
        required: true,
    },
})


const isInstalling = ref(false)
const isBuilding = ref(false)

async function install() {
    if (isInstalling.value) {
        return
    }

    isInstalling.value = true

    const [error] = await $fetch.try(`/api/plugins/${props.plugin.id}/npm-install`, { method: 'POST' })

    if (error) {
        isInstalling.value = false
        return
    }

    setTimeout(() => {
        isInstalling.value = false
        toast.success($t('Dependencies installed'))
    }, 500)
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

    waitForServer({ redirectTo: '/admin/plugins', })

}

async function build() {
    if (isBuilding.value) {
        return
    }

    isBuilding.value = true

    const [error] = await $fetch.try(`/api/plugins/${props.plugin.id}/npm-build`, { method: 'POST' })

    if (error) {
        isBuilding.value = false
        return
    }

    setTimeout(() => {
        isBuilding.value = false
        toast.success($t('Builded successfully'))
    }, 500)
}
</script>

<template>
    <div class="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('Dependencies') }}</CardTitle>
                <CardDescription>{{ $t('Install/update the module dependencies') }}</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertButton
                    :disabled="isInstalling"
                    :loading="isInstalling"
                    :title="$t('Install')"
                    :description="$t('This may take some time. Are you sure you want to proceed?')"
                    @confirm="install"
                >
                    {{ $t('Install') }}
                </AlertButton>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{{ $t('Update') }}</CardTitle>
                <CardDescription>
                    {{ $t('Update plugin') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="flex gap-4">
                <Button
                    :disabled="isBuilding"
                    :loading="isBuilding"
                    :to="`/admin/plugins/${plugin.id}/update-git`"
                >
                    GIT
                </Button>
                <Button
                    :disabled="isBuilding"
                    :loading="isBuilding"
                    :to="`/admin/plugins/${plugin.id}/update-bundle`"
                >
                    Bundle
                </Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('Build') }}</CardTitle>
                <CardDescription>
                    {{ $t('Build the plugin. This is an expensive operation that may take several minutes.') }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AlertButton
                    variant="destructive"
                    :disabled="isBuilding"
                    :title="$t('Build')"
                    :description="$t('This may take some time. Are you sure you want to proceed?')"
                    :loading="isBuilding"
                    @confirm="build"
                >
                    {{ $t('Build') }}
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
                    :description="$t(`Are you sure you want to uninstall \&quot;:0\&quot;?`, [plugin.name])"
                    :submit-text="$t('Confirm')"
                    :handle="data => uninstall(data)"
                    :fields="{}"
                >
                    <Button variant="destructive">
                        {{ $t('Uninstall') }}
                    </Button>
                </DialogForm>
            </CardContent>
        </Card>
    </div>
</template>
