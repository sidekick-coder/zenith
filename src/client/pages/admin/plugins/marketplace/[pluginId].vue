<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { waitForServer } from '@sidekick-coder/zenith-kit/client'
import { ZButton } from '@sidekick-coder/zenith-kit/components'
import { toast } from 'vue-sonner'
import Icon from '#client/components/Icon.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import PageTitle from '#client/components/PageTitle.vue'
import { Card, CardContent, CardHeader, CardTitle } from '#client/components/ui/card'
import { Skeleton } from '#client/components/ui/skeleton'
import { $fetch } from '#client/utils/fetcher.ts'

interface MarketplaceItem {
    repository: string
    branch: string
    hash?: string
    version?: string
    name?: string
    description?: string
    repository_name?: string
    readme_html?: string
    zenithConfig?: unknown
    error?: string
}

const route = useRoute()
const pluginId = computed(() => route.params.pluginId as string)
const item = ref<MarketplaceItem>()
const loading = ref(true)
const installing = ref(false)

async function load() {
    const [error, response] = await $fetch.try<MarketplaceItem>(
        `/api/plugins/marketplace/${pluginId.value}`,
    )

    loading.value = false

    if (error) {
        return
    }

    item.value = response
}

async function install() {
    if (!item.value) {
        return
    }

    installing.value = true

    const [error] = await $fetch.try('/api/plugins/install', {
        method: 'POST',
        data: {
            repository: item.value.repository,
            branch: item.value.branch,
        },
    })

    if (error) {
        installing.value = false
        return
    }

    toast.success($t('Installed successfully'))

    await new Promise(resolve => setTimeout(resolve, 800))

    waitForServer({ redirectTo: '/admin/plugins' })
}

onMounted(load)
</script>

<template>
    <div
        v-if="loading"
        class="space-y-4"
    >
        <Skeleton class="h-28 w-full" />
        <Skeleton class="h-96 w-full" />
    </div>

    <div
        v-else-if="item"
        class="space-y-6"
    >
        <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
                <PageTitle>{{ item.name || item.repository_name || item.repository }}</PageTitle>
                <PageSubtitle>{{ item.description || $t('No description available') }}</PageSubtitle>
            </div>
            <div class="flex shrink-0 gap-2">
                <ZButton
                    variant="outline"
                    to="/admin/plugins/marketplace"
                >
                    {{ $t('Back') }}
                </ZButton>
                <ZButton
                    :loading="installing"
                    :disabled="Boolean(item.error)"
                    @click="install"
                >
                    <Icon name="Download" />
                    {{ $t('Install') }}
                </ZButton>
            </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
            <Card>
                <CardHeader>
                    <CardTitle>{{ $t('Plugin details') }}</CardTitle>
                </CardHeader>
                <CardContent class="space-y-5 text-sm">
                    <a
                        :href="item.repository"
                        target="_blank"
                        rel="noreferrer"
                        class="flex items-center gap-2 rounded-md border px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                        <Icon
                            name="Github"
                            class="size-4 shrink-0"
                        />
                        <span class="truncate">{{ item.repository_name || item.repository }}</span>
                        <Icon
                            name="ExternalLink"
                            class="ml-auto size-3.5 shrink-0"
                        />
                    </a>
                    <dl class="space-y-4">
                        <div>
                            <dt class="text-xs text-muted-foreground">
                                {{ $t('Branch') }}
                            </dt>
                            <dd class="mt-1 font-medium">
                                {{ item.branch }}
                            </dd>
                        </div>
                        <div>
                            <dt class="text-xs text-muted-foreground">
                                {{ $t('Version') }}
                            </dt>
                            <dd class="mt-1">
                                <span
                                    v-if="item.version"
                                    :title="item.version"
                                    class="cursor-help font-mono text-xs font-medium"
                                >
                                    {{ item.version.slice(0, 7) }}
                                </span>
                                <span v-else>-</span>
                            </dd>
                        </div>
                    </dl>
                    <div
                        v-if="item.error"
                        class="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-xs leading-relaxed text-destructive"
                    >
                        {{ item.error }}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{{ $t('README') }}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        v-if="item.readme_html"
                        class="space-y-4 text-sm leading-6 [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-1 [&_p]:text-foreground [&_ul]:space-y-1"
                        v-html="item.readme_html"
                    />
                    <p
                        v-else
                        class="text-sm text-muted-foreground"
                    >
                        {{ $t('No README available') }}
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
