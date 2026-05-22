<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GitCommit, GitBranch, Download } from 'lucide-vue-next'
import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#client/components/ui/card'
import { Badge } from '#client/components/ui/badge'
import { Button } from '#client/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '#client/components/ui/alert-dialog'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '#client/components/ui/dialog'
import PluginVersionTable from '#client/components/PluginVersionTable.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    plugin: {
        type: Object,
        required: true,
    },
})

interface Version {
    version_channel: string
    version_available_channels: string[]
    git_head: string
    git_commit_hash: string
}

interface VersionItem {
    ref: string
    label: string
    description: string
    body: string
    date: string
    author: string
}

const channels: { id: string; label: string }[] = [
    {
        id: 'commits',
        label: 'Commits' 
    },
]

const version = ref<Version | null>(null)
const currentChannel = ref<string>('commits')
const fetching = ref(false)
const tableKey = ref(0)
const checkinOut = ref(false)

const checkoutDialog = ref(false)
const checkoutTarget = ref<VersionItem | null>(null)

const detailDialog = ref(false)
const detailTarget = ref<VersionItem | null>(null)

const currentVersionLabel = computed(() => {
    if (!version.value) return null

    if (version.value.version_channel?.startsWith('branch:')) {
        return version.value.version_channel
    }

    return `commits:${version.value.git_commit_hash}`
})

const currentBranch = computed(() => {
    if (!currentChannel.value.startsWith('branch:')) return undefined

    return currentChannel.value.replace('branch:', '')
})

async function loadVersion() {
    const [error, data] = await $fetch.try(`/api/plugins/${props.plugin.id}/version`)

    if (error) {
        return
    }

    version.value = data as Version

    currentChannel.value = version.value.version_channel || 'commits'

    if (version.value.version_available_channels) {
        version.value.version_available_channels
            .forEach(c => channels.push({
                id: c,
                label: c,
            }))
    }
}

function openDetail(item: VersionItem) {
    detailTarget.value = item
    detailDialog.value = true
}

function requestCheckout(item: VersionItem) {
    checkoutTarget.value = item
    checkoutDialog.value = true
}

function checkout() {
    if (!checkoutTarget.value) return

    checkinOut.value = true

    setTimeout(() => {
        if (version.value) {
            version.value.commit_hash = checkoutTarget.value!.ref
        }

        checkinOut.value = false
        checkoutDialog.value = false
        checkoutTarget.value = null
    }, 800)
}

async function fetchChanges() {
    fetching.value = true
    await $fetch.try(`/api/plugins/${props.plugin.id}/git/fetch`, { method: 'POST' })
    tableKey.value++
    fetching.value = false
}

onMounted(loadVersion)
</script>

<template>
    <Card>
        <CardHeader class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <GitCommit class="size-5" />
                <div>
                    <CardTitle>
                        {{ $t('Versions') }}
                    </CardTitle>
                    <CardDescription>
                        {{ $t('Manage plugin version and channel') }}
                    </CardDescription>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <Badge
                    variant="outline"
                    class="h-9 gap-1.5"
                >
                    <GitBranch class="size-3.5" />
                    <template v-if="currentVersionLabel">
                        {{ currentVersionLabel }}
                    </template>
                    <template v-else>
                        {{ $t('Unknown') }}
                    </template>
                </Badge>

                <Button
                    variant="outline"
                    :disabled="fetching"
                    @click="fetchChanges"
                >
                    <Download
                        class="size-4"
                        :class="fetching ? 'animate-pulse' : ''"
                    />
                    {{ $t('Check updates') }}
                </Button>
            </div>
        </CardHeader>

        <CardContent class="space-y-4">
            <div class="flex flex-wrap gap-2">
                <Button
                    v-for="channel in channels"
                    :key="channel.id"
                    :variant="currentChannel === channel.id ? 'default' : 'outline'"
                    size="sm"
                    @click="currentChannel = channel.id"
                >
                    <GitBranch
                        v-if="channel.id.startsWith('branch:')"
                        class="size-3.5"
                    />
                    <GitCommit
                        v-else
                        class="size-3.5"
                    />
                    {{ $t(channel.label) }}
                </Button>
            </div>

            <PluginVersionTable
                :key="tableKey"
                :plugin-id="plugin.id"
                :branch="currentBranch"
                :current-commit-hash="version?.git_commit_hash"
                :channel="currentChannel"
                @checkout="requestCheckout"
                @detail="openDetail"
            />
        </CardContent>
    </Card>

    <!-- Detail dialog -->
    <Dialog v-model:open="detailDialog">
        <DialogContent class="max-w-lg">
            <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                    <Badge
                        variant="outline"
                        class="font-mono"
                    >
                        {{ detailTarget?.label }}
                    </Badge>
                    {{ detailTarget?.description }}
                </DialogTitle>
                <DialogDescription>
                    {{ detailTarget?.author }} · {{ detailTarget ? new Date(detailTarget.date).toLocaleString() : '' }}
                </DialogDescription>
            </DialogHeader>
            <pre class="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap break-words font-mono">{{ detailTarget?.body }}</pre>
        </DialogContent>
    </Dialog>

    <!-- Checkout confirmation dialog -->
    <AlertDialog v-model:open="checkoutDialog">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ $t('Change version') }}</AlertDialogTitle>
                <AlertDialogDescription>
                    {{ $t('Are you sure you want to switch to version :0?', [checkoutTarget?.label]) }}
                    {{ $t('This will restart the plugin.') }}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel :disabled="checkinOut">
                    {{ $t('Cancel') }}
                </AlertDialogCancel>
                <AlertDialogAction
                    :disabled="checkinOut"
                    @click.prevent="checkout"
                >
                    {{ $t('Confirm') }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

