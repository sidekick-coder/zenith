<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GitCommit, GitBranch, Tag, Download, Info, GitPullRequest } from 'lucide-vue-next'
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

type ChannelId = 'commits' | 'branch:main' | 'branch:build' | 'tags'

interface Version {
    channel: ChannelId | null
    head: string | null
    commit_hash: string
}

interface VersionItem {
    ref: string
    label: string
    description: string
    body: string
    date: string
    author: string
}

const channels: { id: ChannelId; label: string }[] = [
    {
        id: 'commits',
        label: 'Commits' 
    },
    {
        id: 'branch:main',
        label: 'Branch: main' 
    },
    {
        id: 'branch:build',
        label: 'Branch: build' 
    },
    {
        id: 'tags',
        label: 'Tags' 
    },
]

const version = ref<Version | null>(null)
const currentChannel = ref<ChannelId>('commits')
const fetching = ref(false)
const checkinOut = ref(false)

const checkoutDialog = ref(false)
const checkoutTarget = ref<VersionItem | null>(null)

const detailDialog = ref(false)
const detailTarget = ref<VersionItem | null>(null)

const currentVersionLabel = computed(() => {
    if (!version.value) return null

    if (!version.value.channel) return `commits:${version.value.commit_hash}`

    if (version.value.channel.startsWith('branch:')) return version.value.channel

    return `${version.value.channel}@${version.value.commit_hash}`
})

const currentBranch = computed(() => {
    if (!currentChannel.value.startsWith('branch:')) return undefined

    return currentChannel.value.replace('branch:', '')
})

const placeholderTags: VersionItem[] = [
    {
        ref: 'v2.1.0',
        label: 'v2.1.0',
        description: 'Release v2.1.0 - stability improvements',
        body: '## What\'s new\n- Improved error handling\n- Reduced memory usage\n- Fixed edge case in parser',
        date: '2026-05-01T12:00:00Z',
        author: 'Alice' 
    },
    {
        ref: 'v2.0.1',
        label: 'v2.0.1',
        description: 'Release v2.0.1 - hotfix',
        body: 'Hotfix for critical crash on Windows when path contains spaces.',
        date: '2026-04-20T08:00:00Z',
        author: 'Bob' 
    },
    {
        ref: 'v2.0.0',
        label: 'v2.0.0',
        description: 'Release v2.0.0 - major update',
        body: '## Breaking changes\n- New config format (see migration guide)\n- Dropped Node 16 support\n\n## New features\n- Plugin API v2\n- Hot reload support',
        date: '2026-04-01T10:00:00Z',
        author: 'Alice' 
    },
    {
        ref: 'v1.5.3',
        label: 'v1.5.3',
        description: 'Release v1.5.3 - bug fixes',
        body: 'Various minor bug fixes and performance improvements.',
        date: '2026-03-15T09:00:00Z',
        author: 'Carol' 
    },
]

async function loadVersion() {
    const [, data] = await $fetch.try(`/api/plugins/${props.plugin.id}/version`)

    if (data && typeof data === 'object' && 'commit_hash' in data) {
        version.value = data as Version

        if (version.value.channel) {
            currentChannel.value = version.value.channel
        }
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

function fetchChanges() {
    fetching.value = true
    setTimeout(() => { fetching.value = false }, 1500)
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
                    <Tag
                        v-if="channel.id === 'tags'"
                        class="size-3.5"
                    />
                    <GitBranch
                        v-else-if="channel.id.startsWith('branch:')"
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
                v-if="currentChannel !== 'tags'"
                :plugin-id="plugin.id"
                :branch="currentBranch"
                :commit-hash="version?.commit_hash"
                @checkout="requestCheckout"
                @detail="openDetail"
            />

            <div
                v-else
                class="rounded-md border divide-y"
            >
                <div
                    v-for="item in placeholderTags"
                    :key="item.ref"
                    class="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="flex items-center justify-center size-5 rounded-full border-2 shrink-0 border-muted-foreground/30" />

                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    class="font-mono text-xs shrink-0"
                                >
                                    {{ item.label }}
                                </Badge>
                                <span class="text-sm truncate">{{ item.description }}</span>
                            </div>
                            <p class="text-xs text-muted-foreground mt-0.5">
                                {{ item.author }} · {{ new Date(item.date).toLocaleString() }}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            class="size-8"
                            @click="openDetail(item)"
                        >
                            <Info class="size-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            @click="requestCheckout(item)"
                        >
                            <GitPullRequest class="size-3.5" />
                            {{ $t('Checkout') }}
                        </Button>
                    </div>
                </div>
            </div>
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

