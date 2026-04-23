<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { GitCommit, RefreshCw, GitBranch as GitBranchIcon, Download } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { $fetch } from '#client/utils/fetcher.ts'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#client/components/ui/card'
import { Badge } from '#client/components/ui/badge'
import { Button } from '#client/components/ui/button'
import { Switch } from '#client/components/ui/switch'
import Select from '#client/components/Select.vue'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '#client/components/ui/dialog'
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
    isCurrent: boolean
    isRemote: boolean
    remote: string | null
}

interface GitRepoInfo {
    directory: string
    head: string | null
    shortHash: string
    isDetachedHead: boolean
    remotes: string[]
}

interface CheckoutRefOption {
    label: string
    value: string
}

// commits state
const commits = ref<Commit[]>([])
const loading = ref(false)
const page = ref(1)
const perPage = ref(20)
const total = ref(0)
const totalPages = ref(1)

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
        id: 'checkout',
        field: 'hash',
        label: '',
        width: 60,
    },
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
        id: 'date',
        field: 'date',
        label: 'Date',
        width: 200,
    },
])

// checkout state
const checkoutDialog = ref(false)
const checkoutTarget = ref<Commit | null>(null)
const checkinOut = ref(false)
const checkoutRef = ref<string | null>(null)
const checkoutRefOptions = ref<CheckoutRefOption[]>([])

function isHead(commit: Commit) {
    return commit.refs.some(r => r.name === 'HEAD')
}

function commitRowClass(commit: Commit) {
    return isHead(commit) ? 'bg-primary/5 hover:bg-primary/10' : ''
}

function getCheckoutRefOptions(commit: Commit): CheckoutRefOption[] {
    const refs = Array.from(
        new Map(
            commit.refs
                .filter(ref => ref.type === 'tag' || ref.type === 'branch')
                .sort((left, right) => {
                    const priority = {
                        tag: 0,
                        branch: 1,
                    }

                    return priority[left.type] - priority[right.type]
                })
                .map(ref => [
                    ref.name,
                    {
                        label: ref.type === 'tag'
                            ? $t('Tag: :0', [ref.shortName])
                            : $t('Branch: :0', [ref.shortName]),
                        value: ref.shortName,
                    },
                ]),
        ).values(),
    )

    refs.push({
        label: $t('Commit: :0', [commit.shortHash]),
        value: commit.hash,
    })

    return refs
}

function requestCheckout(commit: Commit) {
    if (isHead(commit)) return

    checkoutRefOptions.value = getCheckoutRefOptions(commit)
    checkoutRef.value = checkoutRefOptions.value[0]?.value ?? commit.hash
    checkoutTarget.value = commit
    checkoutDialog.value = true
}

async function checkout() {
    if (!checkoutTarget.value) return

    checkinOut.value = true

    const target = checkoutTarget.value

    const [error] = await $fetch.try(`/api/modules/${props.module.id}/checkout`, {
        method: 'POST',
        data: { ref: checkoutRef.value ?? target.hash, },
    })

    if (error) {
        checkinOut.value = false
        toast.error($t('Failed to checkout commit'))
        return
    }

    toast.success($t('Checked out successfully'))

    checkinOut.value = false
    checkoutDialog.value = false
    checkoutTarget.value = null
    checkoutRef.value = null
    checkoutRefOptions.value = []

    await loadRepoInfo()
    await loadBranches()
    await load()
}

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
        const all = data as Branch[]
        const local = all.filter(b => !b.isRemote)

        localBranches.value = local
        localBranchOptions.value = local.map(b => ({
            label: repoInfo.value?.head === b.name ? `${b.name} (current)` : b.name,
            value: b.name,
        }))
    }
}

async function loadRemoteBranches() {
    loadingRemotes.value = true

    const [, data] = await $fetch.try(`/api/modules/${props.module.id}/branches`)

    if (Array.isArray(data)) {
        remoteBranches.value = (data as Branch[]).filter(b => b.isRemote)
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
        totalPages.value = (data as any).totalPages
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
watch(perPage, () => {
    if (page.value !== 1) {
        page.value = 1
        return
    }

    load()
})
watch(selectedBranch, () => {
    if (page.value !== 1) {
        page.value = 1
        return
    }

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
                v-model:total-pages="totalPages"
                v-model:limit="perPage"
                v-model:total="total"
                :rows="commits"
                :columns="columns"
                :loading="loading"
                :row-class="commitRowClass"
            >
                <template #row-checkout="{ row }">
                    <Switch
                        :model-value="isHead(row)"
                        :disabled="isHead(row)"
                        @click="requestCheckout(row)"
                    />
                </template>

                <template #row-message="{ row }">
                    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:flex-nowrap">
                        <span class="w-full sm:w-auto">{{ row.message }}</span>
                        <div
                            v-if="row.refs.filter(r => r.name !== 'HEAD').length"
                            class="flex flex-wrap items-center gap-1"
                        >
                            <Badge
                                v-for="r in row.refs.filter(r => r.name !== 'HEAD')"
                                :key="r.name"
                                :variant="r.type === 'tag' ? 'secondary' : 'outline'"
                                class="text-xs"
                            >
                                {{ r.shortName }}
                            </Badge>
                        </div>
                    </div>
                </template>

                <template #row-shortHash="{ row }">
                    <Badge
                        variant="outline"
                        class="font-mono"
                    >
                        {{ row.shortHash }}
                    </Badge>
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

    <AlertDialog v-model:open="checkoutDialog">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ $t('Checkout commit') }}</AlertDialogTitle>
                <AlertDialogDescription>
                    {{ $t('Are you sure you want to checkout commit :0?', [checkoutTarget?.shortHash]) }}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div
                v-if="checkoutRefOptions.length"
                class="space-y-2"
            >
                <div class="text-sm font-medium">
                    {{ $t('Checkout ref') }}
                </div>
                <Select
                    v-model="checkoutRef"
                    v-model:options="checkoutRefOptions"
                    :placeholder="$t('Select a ref')"
                    class="w-full"
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel :disabled="checkinOut">
                    {{ $t('Cancel') }}
                </AlertDialogCancel>
                <AlertDialogAction
                    :disabled="checkinOut"
                    @click.prevent="checkout"
                >
                    {{ $t('Checkout') }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
