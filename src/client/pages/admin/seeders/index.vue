<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Play, RefreshCw } from 'lucide-vue-next'
import { $fetch } from '#client/utils/fetcher.ts'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import AlertButton from '#client/components/AlertButton.vue'
import Button from '#client/components/Button.vue'
import { Input } from '#client/components/ui/input'

interface Seeder {
    name: string
    filename: string
    source: string
}

const seeders = ref<Seeder[]>([])
const loading = ref(false)
const source = ref('')
const runningAll = ref(false)
const runningSeed = ref<string | null>(null)

const columns = defineColumns<Seeder>([
    {
        field: 'name',
        label: $t('Name'),
    },
    {
        field: 'source',
        label: $t('Source'),
        width: 200,
    },
    {
        field: 'filename',
        label: $t('Filename'),
    },
    {
        id: 'actions',
        label: '',
        width: 80,
    },
])

async function load() {
    loading.value = true

    const query = source.value ? `?source=${encodeURIComponent(source.value)}` : ''
    const [, data] = await $fetch.try(`/api/seeders${query}`)

    seeders.value = Array.isArray(data) ? (data as Seeder[]) : []

    loading.value = false
}

onMounted(load)

async function runAll() {
    runningAll.value = true

    const body: any = {}
    if (source.value) body.source = source.value

    const [error] = await $fetch.try('/api/seeders/run', {
        method: 'POST',
        body 
    })

    runningAll.value = false

    if (error) return

    toast.success($t('Seeders ran successfully'))
}

async function runOne(seeder: Seeder) {
    runningSeed.value = seeder.name

    const [error] = await $fetch.try('/api/seeders/run', {
        method: 'POST',
        body: {
            source: seeder.source,
            names: [seeder.name] 
        },
    })

    runningSeed.value = null

    if (error) return

    toast.success($t('Seeder ran successfully'))
}
</script>

<template>
    <div class="mb-6 flex items-center justify-between gap-4">
        <div>
            <PageTitle>
                {{ $t('Seeders') }}
            </PageTitle>
            <PageSubtitle>
                {{ $t('View and run all database seeders') }}
            </PageSubtitle>
        </div>

        <div class="flex items-center gap-2">
            <Input
                v-model="source"
                :placeholder="$t('Filter by source')"
                class="w-48"
                @keyup.enter="load"
            />

            <Button
                variant="outline"
                size="icon"
                :disabled="runningAll || !!runningSeed"
                @click="load"
            >
                <RefreshCw
                    class="size-4"
                    :class="{ 'animate-spin': loading }"
                />
            </Button>

            <AlertButton
                :loading="runningAll"
                :disabled="runningAll || !!runningSeed"
                :description="$t('This will run all seeders')"
                variant="outline"
                size="sm"
                class="bg-green-500 text-white hover:bg-green-600 border-0"
                @confirm="runAll"
            >
                {{ $t('Run all') }}
            </AlertButton>
        </div>
    </div>

    <DataTable
        :rows="seeders"
        :columns="columns"
        :loading="loading"
    >
        <template #row-actions="{ row }">
            <div class="flex justify-end">
                <AlertButton
                    size="icon"
                    variant="ghost"
                    :tooltip="$t('Run')"
                    :disabled="runningAll || !!runningSeed"
                    :loading="runningSeed === row.name"
                    :description="$t('This will run this seeder')"
                    @confirm="runOne(row)"
                >
                    <Play class="size-4" />
                </AlertButton>
            </div>
        </template>
    </DataTable>
</template>
