<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { GitCommit, RefreshCw, GitBranch as GitBranchIcon, Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { $fetch } from '#client/utils/fetcher.ts'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#client/components/ui/card'
import { Badge } from '#client/components/ui/badge'
import { Button } from '#client/components/ui/button'
import Select from '#client/components/Select.vue'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '#client/components/ui/dialog'

defineOptions({ inheritAttrs: false, })

const props = defineProps({
    module: {
        type: Object,
        required: true
    }
})

interface GitCommitRef {
    name: string
    shortName: string
    type: 'branch' | 'tag' | 'remote' | 'other'
}

interface Commit {
    hash: string
    shortHash: string
    message: string
    authorName: string
    authorEmail: string
    date: string
    refs: GitCommitRef[]
}

interface Branch {
    name: string
    current: boolean
    remote: string | null
}

interface GitRepoInfo {
    directory: string
    head: string | null
    shortHash: string
    isDetachedHead: boolean
    remotes: string[]
}

// commits state
const commits = ref<Commit[]>([])
const loading = ref(false)
const page = ref(1)
const perPage = ref(20)
const total = ref(0)

// repo info state
const repoInfo = ref<GitRepoInfo | null>(null)

// branch state
const selectedBranch = ref<string | null>(null)
const localBranches = ref<Branch[]>([])
const localBranchOptions = ref<{ label: string; value: string }[]>([])

// remote branches dialog
const remoteDialog = ref(false)
const remoteBranches = ref<Branch[]>([])
const loadingRemotes = ref(false)
const fetchingBranch = ref<string | null>(null)

const columns = defineColumns<Commit>([
    {
        id: 'shortHash',
        field: 'shortHash',
        label: 'Hash',
        width: 120,
    },
    {
        id: 'message',
        field: 'message',
        label: 'Message',
    },
    {
        id: 'refs',
        field: 'refs',
        label: 'Refs',
        width: 260,
    },
    {
        id: 'date',
        field: 'date',
        label: 'Date',
        width: 200,
    },
])

async function loadRepoInfo() {
    const [, data] = await $fetch.try(`/api/modules/${props.module.id}/git-info`)

    if (data && typeof data === 'object' && 'head' in data) {
        repoInfo.value = data as GitRepoInfo

        if (repoInfo.value.head && selectedBranch.value === null) {
            selectedBranch.value = repoInfo.value.head
        }
    }
}

async function loadBranches() {
    const [, data] = await $fetch.try(`/api/modules/${props.module.id}/branches`)

    if (Array.isArray(data)) {
        localBranches.value = data as Branch[]
        localBranchOptions.value = (data as Branch[]).map(b => ({
            label: repoInfo.value?.head === b.name ? `${b.name} (current)` : b.name,
            value: b.name,
        }))
    }
}

async function loadRemoteBranches() {
    loadingRemotes.value = true

    const [, data] = await $fetch.try(`/api/modules/${props.module.id}/branches`, { query: { includeRemotes: 'true' }, })

    if (Array.isArray(data)) {
        const localNames = new Set(localBranches.value.map(b => b.name))

        remoteBranches.value = (data as Branch[]).filter(b => !localNames.has(b.name))
    }

    loadingRemotes.value = false
}

async function load() {
    loading.value = true

    const [error, data] = await $fetch.try(`/api/modules/${props.module.id}/commits`, {
        query: {
            page: page.value,
            perPage: perPage.value,
            ...(selectedBranch.value ? { branch: selectedBranch.value } : {}),
        },
    })

    if (!error && data && typeof data === 'object' && 'items' in data) {
        commits.value = (data as any).items
        total.value = (data as any).total
    }

    loading.value = false
}

async function openRemoteDialog() {
    remoteDialog.value = true
    await loadRemoteBranches()
}

async function fetchToLocal(branch: Branch) {
    const parts = branch.name.split('/')
    const remote = parts[0]
    const localName = parts.slice(1).join('/')

    fetchingBranch.value = branch.name

    const [error] = await $fetch.try(`/api/modules/${props.module.id}/branches/fetch`, {
        method: 'POST',
        data: {
            branch: localName,
            remote 
        },
    })

    fetchingBranch.value = null

    if (error) return

    toast.success($t('Branch :0 fetched to local', [localName]))

    remoteDialog.value = false

    await loadBranches()
}

watch(page, load)
watch(selectedBranch, () => {
    page.value = 1
    load()
})

onMounted(async () => {
    await loadRepoInfo()
    await loadBranches()
    await load()
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
                        {{ $t('Commit history for the current branch') }}
                    </CardDescription>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <Select
                    v-model="selectedBranch"
                    v-model:options="localBranchOptions"
                    :placeholder="$t('Branch')"
                    class="w-48 h-9!"
                    clearable
                />

                <Button
                    variant="outline"
                    @click="openRemoteDialog"
                >
                    <GitBranchIcon class="size-4" />
                    {{ $t('Remote branches') }}
                </Button>

                <Button
                    variant="outline"
                    :disabled="loading"
                    @click="load"
                >
                    <RefreshCw
                        class="size-4"
                        :class="loading ? 'animate-spin' : ''"
                    />
                    {{ $t('Refresh') }}
                </Button>
            </div>
        </CardHeader>

        <CardContent>
            <DataTable
                v-model:page="page"
                v-model:total="total"
                :rows="commits"
                :columns="columns"
                :loading="loading"
                :limit="perPage"
            >
                <template #row-shortHash="{ row }">
                    <Badge
                        variant="outline"
                        class="font-mono"
                    >
                        {{ row.shortHash }}
                    </Badge>
                </template>

                <template #row-refs="{ row }">
                    <div class="flex items-center gap-1 flex-wrap">
                        <Badge
                            v-for="r in row.refs"
                            :key="r.name"
                            :variant="r.type === 'tag' ? 'secondary' : 'outline'"
                            class="text-xs"
                        >
                            {{ r.shortName }}
                        </Badge>
                    </div>
                </template>

                <template #row-date="{ row }">
                    {{ new Date(row.date).toLocaleString() }}
                </template>
            </DataTable>
        </CardContent>
    </Card>

    <Dialog v-model:open="remoteDialog">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{{ $t('Remote branches') }}</DialogTitle>
                <DialogDescription>
                    {{ $t('Fetch a remote branch to your local repository') }}
                </DialogDescription>
            </DialogHeader>

            <div
                v-if="loadingRemotes"
                class="flex justify-center py-6"
            >
                <RefreshCw class="size-5 animate-spin text-muted-foreground" />
            </div>

            <div
                v-else-if="!remoteBranches.length"
                class="py-6 text-center text-sm text-muted-foreground"
            >
                {{ $t('No remote branches found') }}
            </div>

            <div
                v-else
                class="space-y-2"
            >
                <div
                    v-for="branch in remoteBranches"
                    :key="branch.name"
                    class="flex items-center justify-between rounded-md border px-3 py-2"
                >
                    <div class="flex items-center gap-2">
                        <GitBranchIcon class="size-4 text-muted-foreground" />
                        <span class="text-sm font-mono">{{ branch.name }}</span>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        :loading="fetchingBranch === branch.name"
                        :disabled="!!fetchingBranch"
                        @click="fetchToLocal(branch)"
                    >
                        <Download class="size-4" />
                        {{ $t('Fetch to local') }}
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>
