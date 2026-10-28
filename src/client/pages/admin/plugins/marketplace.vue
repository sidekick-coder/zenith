<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, ZButton } from '@sidekick-coder/zenith-kit/components'
import Icon from '#client/components/Icon.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import PageTitle from '#client/components/PageTitle.vue'
import Badge from '#client/components/ui/badge/Badge.vue'
import { $fetch } from '#client/utils/fetcher.ts'

interface MarketplaceItem {
    repository: string
    branch: string
    hash?: string
    version?: string
    name?: string
    description?: string
    repository_name?: string
    error?: string
    zenithConfig?: {
        id?: string
    }
}

interface MarketplaceResponse {
    items: MarketplaceItem[]
}

const items = ref<MarketplaceItem[]>([])
const loading = ref(false)

function pluginPath(item: MarketplaceItem) {
    const id = item.zenithConfig?.id || item.name || item.repository_name || item.repository

    return `/admin/plugins/marketplace/${encodeURIComponent(id)}`
}

async function load() {
    loading.value = true

    const [error, response] = await $fetch.try<MarketplaceResponse>('/api/plugins/marketplace')

    loading.value = false

    if (error) {
        return
    }

    items.value = response.items
}

onMounted(load)
</script>

<template>
    <div class="mb-6 flex items-center justify-between">
        <div>
            <PageTitle>{{ $t('Plugin marketplace') }}</PageTitle>
            <PageSubtitle>{{ $t('Browse plugins available from the marketplace.') }}</PageSubtitle>
        </div>
        <ZButton
            variant="outline"
            size="icon"
            :disabled="loading"
            @click="load"
        >
            <Icon
                name="RotateCcw"
                :class="{ 'animate-spin': loading }"
            />
        </ZButton>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card
            v-for="item in items"
            :key="`${item.repository}:${item.branch}`"
            class="flex flex-col border-muted/80 transition-shadow hover:shadow-md"
        >
            <CardHeader class="flex">
                <div class="flex flex-1 min-w-0 items-center gap-3">
                    <div class="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                        <Icon
                            name="Puzzle"
                            class="size-4 text-muted-foreground"
                        />
                    </div>
                    <div class="flex flex-col min-w-0 gap-1">
                        <CardTitle class="truncate">
                            {{ item.name || item.repository_name || item.repository }}
                        </CardTitle>
                        <a
                            :href="item.repository"
                            target="_blank"
                            rel="noreferrer"
                            class="text-xs text-muted-foreground truncate"
                        >
                            {{ item.repository_name || item.repository }}
                        </a>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    size="xs"
                    class="h-full"
                >
                    {{ item.hash?.slice(0, 7) || '-' }}
                </Badge>
            </CardHeader>

            <CardContent>
                <div>
                    {{ item.description || $t('No description available') }}
                </div>
                <div
                    v-if="item.error"
                    class="flex gap-2 rounded-md border border-destructive/20 bg-destructive/5 p-2 text-xs leading-relaxed text-destructive"
                >
                    <Icon
                        name="CircleAlert"
                        class="mt-0.5 size-4 shrink-0"
                    />
                    {{ item.error }}
                </div>
            </CardContent>

            <CardFooter class="flex justify-end gap-2">
                <ZButton
                    variant="outline"
                    sm="sm"
                    :to="pluginPath(item)"
                >
                    <Icon
                        name="Eye"
                        class="size-3.5 shrink-0"
                    />

                    {{ $t('View') }}
                </ZButton>
            </CardFooter>
        </Card>
    </div>
</template>
