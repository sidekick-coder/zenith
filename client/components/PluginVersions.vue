<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GitCommit, GitBranch, Tag, Download, Check, Info, GitPullRequest } from 'lucide-vue-next'
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
    isCurrent: boolean
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

async function loadVersion() {
    const [, data] = await $fetch.try(`/api/plugins/${props.plugin.id}/version`)

    if (data && typeof data === 'object' && 'commit_hash' in data) {
        version.value = data as Version

        if (version.value.channel) {
            currentChannel.value = version.value.channel
        }
    }
}

const placeholderData: Record<ChannelId, VersionItem[]> = {
    'commits': [
        {
            ref: 'a1b2c3d',
            label: 'a1b2c3d',
            description: 'fix: resolve plugin initialization bug',
            body: 'The plugin was failing to initialize when the config file was missing optional fields.\n\nThis patch adds default values for all optional config keys so initialization always succeeds.',
            date: '2026-05-21T14:00:00Z',
            author: 'Alice',
            isCurrent: true 
        },
        {
            ref: 'e4f5g6h',
            label: 'e4f5g6h',
            description: 'feat: add new configuration options',
            body: 'Added support for `timeout`, `retries`, and `verbose` configuration keys.\n\nBreaking: `logLevel` renamed to `log_level`.',
            date: '2026-05-20T10:30:00Z',
            author: 'Bob',
            isCurrent: false 
        },
        {
            ref: 'i7j8k9l',
            label: 'i7j8k9l',
            description: 'chore: update dependencies',
            body: 'Bumped all dependencies to their latest patch versions.',
            date: '2026-05-18T09:00:00Z',
            author: 'Alice',
            isCurrent: false 
        },
        {
            ref: 'm1n2o3p',
            label: 'm1n2o3p',
            description: 'docs: improve readme',
            body: 'Rewrote the Getting Started section and added a configuration reference table.',
            date: '2026-05-15T16:45:00Z',
            author: 'Carol',
            isCurrent: false 
        },
        {
            ref: 'q4r5s6t',
            label: 'q4r5s6t',
            description: 'refactor: clean up core module',
            body: 'Extracted helper functions into separate utilities. No functional changes.',
            date: '2026-05-12T11:20:00Z',
            author: 'Bob',
            isCurrent: false 
        },
    ],
    'branch:main': [
        {
            ref: 'a1b2c3d',
            label: 'a1b2c3d',
            description: 'fix: resolve plugin initialization bug',
            body: 'The plugin was failing to initialize when the config file was missing optional fields.\n\nThis patch adds default values for all optional config keys so initialization always succeeds.',
            date: '2026-05-21T14:00:00Z',
            author: 'Alice',
            isCurrent: true 
        },
        {
            ref: 'e4f5g6h',
            label: 'e4f5g6h',
            description: 'feat: add new configuration options',
            body: 'Added support for `timeout`, `retries`, and `verbose` configuration keys.',
            date: '2026-05-20T10:30:00Z',
            author: 'Bob',
            isCurrent: false 
        },
        {
            ref: 'i7j8k9l',
            label: 'i7j8k9l',
            description: 'chore: update dependencies',
            body: 'Bumped all dependencies to their latest patch versions.',
            date: '2026-05-18T09:00:00Z',
            author: 'Alice',
            isCurrent: false 
        },
    ],
    'branch:build': [
        {
            ref: 'u7v8w9x',
            label: 'u7v8w9x',
            description: 'build: compile production assets',
            body: 'Compiled and minified all production assets for deployment.',
            date: '2026-05-21T15:00:00Z',
            author: 'CI',
            isCurrent: false 
        },
        {
            ref: 'y1z2a3b',
            label: 'y1z2a3b',
            description: 'build: optimize bundle size',
            body: 'Applied tree-shaking and code splitting to reduce the final bundle by ~20%.',
            date: '2026-05-19T13:00:00Z',
            author: 'CI',
            isCurrent: false 
        },
    ],
    'tags': [
        {
            ref: 'v2.1.0',
            label: 'v2.1.0',
            description: 'Release v2.1.0 - stability improvements',
            body: '## What\'s new\n- Improved error handling\n- Reduced memory usage\n- Fixed edge case in parser',
            date: '2026-05-01T12:00:00Z',
            author: 'Alice',
            isCurrent: false 
        },
        {
            ref: 'v2.0.1',
            label: 'v2.0.1',
            description: 'Release v2.0.1 - hotfix',
            body: 'Hotfix for critical crash on Windows when path contains spaces.',
            date: '2026-04-20T08:00:00Z',
            author: 'Bob',
            isCurrent: false 
        },
        {
            ref: 'v2.0.0',
            label: 'v2.0.0',
            description: 'Release v2.0.0 - major update',
            body: '## Breaking changes\n- New config format (see migration guide)\n- Dropped Node 16 support\n\n## New features\n- Plugin API v2\n- Hot reload support',
            date: '2026-04-01T10:00:00Z',
            author: 'Alice',
            isCurrent: false 
        },
        {
            ref: 'v1.5.3',
            label: 'v1.5.3',
            description: 'Release v1.5.3 - bug fixes',
            body: 'Various minor bug fixes and performance improvements.',
            date: '2026-03-15T09:00:00Z',
            author: 'Carol',
            isCurrent: false 
        },
    ],
}

const items = computed<VersionItem[]>(() => placeholderData[currentChannel.value])

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
        placeholderData[currentChannel.value].forEach(i => { i.isCurrent = false })
        checkoutTarget.value!.isCurrent = true

        if (version.value) {
            version.value.commit_hash = checkoutTarget.value!.ref
            version.value.head = checkoutTarget.value!.ref
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

            <div class="rounded-md border divide-y">
                <div
                    v-for="item in items"
                    :key="item.ref"
                    class="flex items-center justify-between gap-4 px-4 py-3 transition-colors"
                    :class="item.isCurrent ? 'bg-primary/5' : 'hover:bg-muted/50'"
                >
                    <div class="flex items-center gap-3 min-w-0">
                        <div
                            class="flex items-center justify-center size-5 rounded-full border-2 shrink-0 transition-colors"
                            :class="item.isCurrent ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'"
                        >
                            <Check
                                v-if="item.isCurrent"
                                class="size-3"
                            />
                        </div>

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
                        <Badge
                            v-if="item.isCurrent"
                            variant="secondary"
                        >
                            {{ $t('Current') }}
                        </Badge>

                        <Button
                            variant="ghost"
                            size="icon"
                            class="size-8"
                            @click="openDetail(item)"
                        >
                            <Info class="size-4" />
                        </Button>

                        <Button
                            v-if="!item.isCurrent"
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

