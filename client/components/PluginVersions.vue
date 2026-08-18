<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { GitCommit, GitBranch, Download, Check, ChevronLeft, ChevronRight, GitPullRequest, RefreshCw } from 'lucide-vue-next'
import type { GitCommitEntity } from '@sidekick-coder/zenith-kit/shared'
import { toast } from '@sidekick-coder/zenith-kit/client'
import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#client/components/ui/card/index.ts'
import { Badge } from '#client/components/ui/badge/index.ts'
import { Button } from '#client/components/ui/button/index.ts'
import AlertButton from '#client/components/AlertButton.vue'

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

const channels: { id: string; label: string }[] = [
    {
        id: 'commits',
        label: 'Commits'
    },
]

const version = ref<Version | null>(null)
const currentChannel = ref<string>('commits')
const fetching = ref(false)

// commits table state
const limit = 10
const commits = ref<GitCommitEntity[]>([])
const commitsLoading = ref(false)
const cursor = ref<string | null>(null)
const cursorPrevious = ref<string | null>(null)
const cursorNext = ref<string | null>(null)

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

function isCurrentCommit(c: GitCommitEntity) {
    return c.hash === version.value?.git_commit_hash || c.short_hash === version.value?.git_commit_hash
}

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

async function loadCommits() {
    commitsLoading.value = true

    commits.value = []

    const query: Record<string, any> = { limit, }

    if (cursor.value) {
        query.cursor = cursor.value
    }

    if (currentBranch.value) {
        query.branches = currentBranch.value
    }

    const [error, response] = await $fetch.try(`/api/plugins/${props.plugin.id}/git/commits`, { query })

    if (error) {
        commitsLoading.value = false
        return
    }

    commits.value = response.items
    cursorPrevious.value = response.cursor_previous
    cursorNext.value = response.cursor_next

    commitsLoading.value = false
}

function goNext() {
    cursor.value = cursorNext.value

    loadCommits()
}

function goPrev() {
    cursor.value = cursorPrevious.value

    loadCommits()
}

async function checkout(commit: GitCommitEntity) {
    const [error] = await $fetch.try(`/api/plugins/${props.plugin.id}/checkout`, {
        method: 'POST',
        data: {
            commit_hash: commit.hash,
            version_channel: currentChannel.value,
        },
    })

    if (error) return

    const url = new URL('/api/reloader', window.location.origin)

    url.searchParams.append('redirect_to', window.location.href)
    url.searchParams.append('delay', '3000')

    window.location.href = url.toString()
}

async function fetchChanges() {
    fetching.value = true
    const [error] = await $fetch.try(`/api/plugins/${props.plugin.id}/git/fetch`, { method: 'POST' })

    if (error) {
        fetching.value = false
        return
    }

    toast.success($t('Fetched changes successfully'))

    fetching.value = false
    cursor.value = null
    loadCommits()
}

watch(currentChannel, () => {
    cursor.value = null
    loadCommits()
})

onMounted(async () => {
    await loadVersion()
    loadCommits()
})
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
                    size="icon"
                    class="size-9"
                    :disabled="commitsLoading"
                    @click="loadCommits"
                >
                    <RefreshCw
                        class="size-4"
                        :class="commitsLoading ? 'animate-spin' : ''"
                    />
                </Button>

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

            <div class="rounded-md border divide-y">
                <div
                    v-if="commitsLoading"
                    class="px-4 py-6 text-center text-sm text-muted-foreground"
                >
                    {{ $t('Loading...') }}
                </div>

                <template v-else>
                    <div
                        v-if="commits.length === 0"
                        class="px-4 py-6 text-center text-sm text-muted-foreground"
                    >
                        {{ $t('No commits found') }}
                    </div>

                    <div
                        v-for="commit in commits"
                        v-else
                        :key="commit.hash"
                        class="flex items-center justify-between gap-4 px-4 py-3 transition-colors"
                        :class="isCurrentCommit(commit) ? 'bg-primary/5' : 'hover:bg-muted/50'"
                    >
                        <div class="flex items-center gap-3 min-w-0">
                            <div
                                class="flex items-center justify-center size-5 rounded-full border-2 shrink-0 transition-colors"
                                :class="isCurrentCommit(commit) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'"
                            >
                                <Check
                                    v-if="isCurrentCommit(commit)"
                                    class="size-3"
                                />
                            </div>

                            <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        class="font-mono text-xs shrink-0"
                                    >
                                        {{ commit.short_hash }}
                                    </Badge>
                                    <span class="text-sm truncate">{{ commit.message }}</span>
                                </div>
                                <p class="text-xs text-muted-foreground mt-0.5">
                                    {{ commit.author_name }} · {{ $dt(commit.date) }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                            <Badge
                                v-if="isCurrentCommit(commit)"
                                variant="secondary"
                            >
                                {{ $t('Current') }}
                            </Badge>

                            <AlertButton
                                v-if="!isCurrentCommit(commit)"
                                variant="outline"
                                size="sm"
                                :title="$t('Change version')"
                                :description="$t('Are you sure you want to switch to version :0?', [commit.short_hash])"
                                :toast-on-success="''"
                                @confirm="checkout(commit)"
                            >
                                <GitPullRequest class="size-3.5" />
                                {{ $t('Checkout') }}
                            </AlertButton>
                        </div>
                    </div>

                    <div
                        v-if="cursorPrevious || cursorNext"
                        class="flex items-center justify-end px-4 py-3"
                    >
                        <div class="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                class="size-8"
                                :disabled="!cursorPrevious"
                                @click="goPrev"
                            >
                                <ChevronLeft class="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                class="size-8"
                                :disabled="!cursorNext"
                                @click="goNext"
                            >
                                <ChevronRight class="size-4" />
                            </Button>
                        </div>
                    </div>
                </template>
            </div>
        </CardContent>
    </Card>
</template>

