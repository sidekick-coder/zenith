<script setup lang="ts">
import { ref, computed, watch, onMounted, PropType } from 'vue'
import { GitCommit, GitBranch, Download, Check, GitPullRequest, RefreshCw } from 'lucide-vue-next'
import type { GitCommitEntity, PluginEntity } from '@sidekick-coder/zenith-kit/shared'
import { Badge, ZButton as Button, ZPagination } from '@sidekick-coder/zenith-kit/components'
import { waitForServer } from '@sidekick-coder/zenith-kit/client'
import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#client/components/ui/card/index.ts'
import AlertButton from '#client/components/AlertButton.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    plugin: {
        type: Object as PropType<PluginEntity>,
        required: true,
    },
})

interface Version {
    version_channel: string
    version_available_channels: string[]
    git_head: string
    git_commit_hash: string
}

const branches = computed(() => props.plugin.branches.filter(b => !!b.branch))

const version = ref<Version | null>(null)
const selected = ref<string>()
const fetching = ref(false)

// commits table state
const limit = ref(10)
const offset = ref(0)
const total = ref(0)
const page = ref(1)
const totalPages = ref(0)
const commits = ref<GitCommitEntity[]>([])
const loading = ref(false)

function isCurrentCommit(c: GitCommitEntity) {
    return c.hash === version.value?.git_commit_hash || c.short_hash === version.value?.git_commit_hash
}

async function loadVersion() {
    const main = branches.value.find(b => b.main)

    if (main) {
        selected.value = main.branch
    }

    if (!main && branches.value.length > 0) {
        selected.value = branches.value[0].branch
    }

    const [error, response] = await $fetch.try(`/api/plugins/${props.plugin.id}/version`)

    if (error) return

    version.value = response
}

async function loadCommits() {
    if (!selected.value) return

    loading.value = true

    commits.value = []

    const query: Record<string, any> = {
        limit: limit.value,
        offset: offset.value,
        branch: selected.value,
    }

    const [error, response] = await $fetch.try(`/api/plugins/${props.plugin.id}/git/commits`, { query })

    if (error) {
        loading.value = false
        return
    }

    commits.value = response.items
    page.value = Math.floor(offset.value / limit.value) + 1
    total.value = response.total
    totalPages.value = Math.ceil(total.value / limit.value)

    loading.value = false
}

function goToPage(p: number) {
    page.value = p
    offset.value = (p - 1) * limit.value

    loadCommits()
}

async function checkout(commit: GitCommitEntity) {
    const [error] = await $fetch.try(`/api/plugins/${props.plugin.id}/checkout`, {
        method: 'POST',
        data: {
            commit_hash: commit.hash,
            version_channel: selected.value,
        },
    })

    if (error) return

    waitForServer()
}

watch(selected, () => {
    offset.value = 0
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
                <Button
                    variant="outline"
                    size="icon"
                    class="size-9"
                    :disabled="loading"
                    @click="loadCommits"
                >
                    <RefreshCw
                        class="size-4"
                        :class="loading ? 'animate-spin' : ''"
                    />
                </Button>

                <Button
                    variant="outline"
                    :disabled="fetching"
                    :to="`/admin/plugins/${props.plugin.id}/update`"
                >
                    <Download
                        class="size-4"
                        :class="fetching ? 'animate-pulse' : ''"
                    />
                    {{ $t('Update') }}
                </Button>
            </div>
        </CardHeader>

        <CardContent v-if="!branches.length">
            <div class="px-4 py-6 text-center text-sm text-muted-foreground">
                {{ $t('No branches declared for this plugin') }}
            </div>
        </CardContent>

        <CardContent
            v-else
            class="space-y-4"
        >
            <div class="flex flex-wrap gap-2">
                <Button
                    v-for="b in branches"
                    :key="b.branch"
                    :variant="selected === b.branch ? 'default' : 'outline'"
                    size="sm"
                    @click="selected = b.branch"
                >
                    <GitBranch class="size-3.5" />
                    {{ b.label || b.branch }}
                </Button>
            </div>

            <div class="rounded-md border divide-y">
                <div
                    v-if="loading"
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

                    <ZPagination
                        v-if="totalPages > 1"
                        :page="page"
                        :total-pages="totalPages"
                        class="my-4"
                        @update:page="goToPage"
                    />
                </template>
            </div>
        </CardContent>
    </Card>
</template>

