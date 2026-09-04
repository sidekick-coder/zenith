<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { Play } from 'lucide-vue-next'
import { $fetch } from '#client/utils/fetcher.ts'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#client/components/ui/card'
import AlertButton from '#client/components/AlertButton.vue'
import Button from '#client/components/Button.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
    plugin: {
        type: Object,
        required: true,
    },
})

interface Seeder {
    name: string
    filename: string
    source: string
}

const seeders = ref<Seeder[]>([])
const loading = ref(false)
const runningAll = ref(false)
const runningSeed = ref<string | null>(null)

const columns = defineColumns<Seeder>([
    {
        field: 'name',
        label: $t('Name'),
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

    const [, data] = await $fetch.try(`/api/seeders?source=${props.plugin.id}`)

    seeders.value = Array.isArray(data) ? (data as Seeder[]) : []

    loading.value = false
}

onMounted(load)

async function runAll() {
    runningAll.value = true

    const [error] = await $fetch.try('/api/seeders/run', {
        method: 'POST',
        body: { source: props.plugin.id },
    })

    runningAll.value = false

    if (error) return

    toast.success($t('Seeders ran successfully'))
}

async function runOne(seeder: Seeder) {
    runningSeed.value = seeder.name

    const [error] = await $fetch.try('/api/seeders/run', {
        method: 'POST',
        body: { source: props.plugin.id, names: [seeder.name] },
    })

    runningSeed.value = null

    if (error) return

    toast.success($t('Seeder ran successfully'))
}
</script>

<template>
    <Card>
        <CardHeader class="flex justify-end items-center">
            <div class="flex-1">
                <CardTitle>
                    {{ $t('Seeders') }}
                </CardTitle>
                <CardDescription>
                    {{ $t('Run database seeders for this plugin') }}
                </CardDescription>
            </div>

            <AlertButton
                :loading="runningAll"
                :disabled="runningAll || !!runningSeed"
                :description="$t('This will run all seeders for this plugin')"
                variant="outline"
                size="sm"
                class="bg-green-500 text-white hover:bg-green-600 border-0"
                @confirm="runAll"
            >
                {{ $t('Run all') }}
            </AlertButton>
        </CardHeader>

        <CardContent>
            <DataTable
                :rows="seeders"
                :columns="columns"
                :loading="loading"
                hide-pagination
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
        </CardContent>
    </Card>
</template>
