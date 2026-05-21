<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Check, Info, GitPullRequest, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { $fetch } from '#client/utils/fetcher.ts'
import { Badge } from '#client/components/ui/badge'
import { Button } from '#client/components/ui/button'

interface Commit {
    hash: string
    shortHash: string
    message: string
    authorName: string
    date: string
}

interface VersionItem {
    ref: string
    label: string
    description: string
    body: string
    date: string
    author: string
}

const props = defineProps({
    pluginId: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        required: false,
    },
    commitHash: {
        type: String,
        required: false,
    },
})

const emit = defineEmits<{
    checkout: [item: VersionItem]
    detail: [item: VersionItem]
}>()

const commits = ref<Commit[]>([])
const loading = ref(false)
const page = ref(1)
const perPage = ref(10)
const total = ref(0)
const totalPages = ref(1)

function toVersionItem(c: Commit): VersionItem {
    return {
        ref: c.hash,
        label: c.shortHash,
        description: c.message,
        body: '',
        date: c.date,
        author: c.authorName,
    }
}

function isCurrentItem(c: Commit) {
    return c.hash === props.commitHash || c.shortHash === props.commitHash
}

async function load() {
    loading.value = true

    const [, data] = await $fetch.try(`/api/plugins/${props.pluginId}/git/commits`, {
        query: {
            page: page.value,
            perPage: perPage.value,
            ...(props.branch ? { branch: props.branch } : {}),
        },
    })

    if (data && typeof data === 'object' && 'items' in data) {
        commits.value = (data as any).items
        total.value = (data as any).total
        totalPages.value = (data as any).totalPages
    }

    loading.value = false
}

watch(() => props.branch, () => {
    page.value = 1
    load()
})

watch(page, load)

onMounted(load)
</script>

<template>
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
                :class="isCurrentItem(commit) ? 'bg-primary/5' : 'hover:bg-muted/50'"
            >
                <div class="flex items-center gap-3 min-w-0">
                    <div
                        class="flex items-center justify-center size-5 rounded-full border-2 shrink-0 transition-colors"
                        :class="isCurrentItem(commit) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30'"
                    >
                        <Check
                            v-if="isCurrentItem(commit)"
                            class="size-3"
                        />
                    </div>

                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                class="font-mono text-xs shrink-0"
                            >
                                {{ commit.shortHash }}
                            </Badge>
                            <span class="text-sm truncate">{{ commit.message }}</span>
                        </div>
                        <p class="text-xs text-muted-foreground mt-0.5">
                            {{ commit.authorName }} · {{ new Date(commit.date).toLocaleString() }}
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <Badge
                        v-if="isCurrentItem(commit)"
                        variant="secondary"
                    >
                        {{ $t('Current') }}
                    </Badge>

                    <Button
                        variant="ghost"
                        size="icon"
                        class="size-8"
                        @click="emit('detail', toVersionItem(commit))"
                    >
                        <Info class="size-4" />
                    </Button>

                    <Button
                        v-if="!isCurrentItem(commit)"
                        variant="outline"
                        size="sm"
                        @click="emit('checkout', toVersionItem(commit))"
                    >
                        <GitPullRequest class="size-3.5" />
                        {{ $t('Checkout') }}
                    </Button>
                </div>
            </div>

            <div
                v-if="totalPages > 1"
                class="flex items-center justify-between px-4 py-3"
            >
                <p class="text-sm text-muted-foreground">
                    {{ $t('Page :0 of :1', [page, totalPages]) }}
                </p>
                <div class="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        class="size-8"
                        :disabled="page <= 1"
                        @click="page--"
                    >
                        <ChevronLeft class="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        class="size-8"
                        :disabled="page >= totalPages"
                        @click="page++"
                    >
                        <ChevronRight class="size-4" />
                    </Button>
                </div>
            </div>
        </template>
    </div>
</template>
