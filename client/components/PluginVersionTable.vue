<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Check, GitPullRequest, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { GitCommitEntity } from '@sidekick-coder/zenith-kit/shared'
import { $fetch } from '#client/utils/fetcher.ts'
import { Badge } from '#client/components/ui/badge'
import { Button } from '#client/components/ui/button'


const props = defineProps({
    pluginId: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        default: null
    },
    currentCommitHash: {
        type: String,
        default: null
    },
})

const commits = ref<GitCommitEntity[]>([])
const loading = ref(false)
const page = ref(1)
const perPage = ref(10)
const totalPages = ref(1)

function isCurrentItem(c: GitCommitEntity) {
    return c.hash === props.currentCommitHash || c.short_hash === props.currentCommitHash
}

async function load() {
    loading.value = true

    commits.value = []

    const query: Record<string, any> = {
        page: page.value,
        perPage: perPage.value,
    }

    const [error, response] = await $fetch.try(`/api/plugins/${props.pluginId}/git/commits`, { query: query, })

    if (error) {
        return
    }

    commits.value = response

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
                                {{ commit.short_hash }}
                            </Badge>
                            <span class="text-sm truncate">{{ commit.message }}</span>
                        </div>
                        <p class="text-xs text-muted-foreground mt-0.5">
                            Author · {{ $dt(commit.date) }}
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
                        v-if="!isCurrentItem(commit)"
                        variant="outline"
                        size="sm"
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
