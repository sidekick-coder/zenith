<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { RefreshCw, Undo2, EllipsisVertical, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { $fetch } from '#client/utils/fetcher.ts'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '#client/components/ui/card'
import AlertButton from '#client/components/AlertButton.vue'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '#client/components/ui/dropdown-menu'
import Button from '#client/components/Button.vue'

defineOptions({ inheritAttrs: false, })

const props = defineProps({
    plugin: {
        type: Object,
        required: true,
    },
})

interface Migration {
    name: string
    source: string
    filename: string
    status: string
    executedAt: string | null
}

const migrations = ref<Migration[]>([])
const loading = ref(false)

const columns = defineColumns<Migration>([
    {
        field: 'name',
        label: $t('Name'),
    },
    {
        field: 'status',
        label: $t('Status'),
    },
    {
        id: 'actions',
        label: '',
        width: 200,
    },
])

async function load() {
    loading.value = true

    const [, data] = await $fetch.try(`/api/migrations?source=${props.plugin.id}`)

    migrations.value = Array.isArray(data) ? (data as Migration[]).reverse() : []

    loading.value = false
}

onMounted(load)

const operation = ref<'up' | 'down' | 'rollback' | 'fresh'>()
const loadingMigration = ref<string | null>(null)

async function migrateOne(migration: Migration) {
    loadingMigration.value = migration.name

    const [error] = await $fetch.try(
        `/api/migrations/${encodeURIComponent(migration.name)}/up`,
        { method: 'POST' }
    )

    loadingMigration.value = null

    if (error) return

    toast.success($t('Migration applied successfully'))
    load()
}

async function rollbackOne(migration: Migration) {
    loadingMigration.value = migration.name

    const [error] = await $fetch.try(
        `/api/migrations/${encodeURIComponent(migration.name)}/down`,
        { method: 'POST' }
    )

    loadingMigration.value = null

    if (error) return

    toast.success($t('Migration rolled back successfully'))
    load()
}

async function freshOne(migration: Migration) {
    loadingMigration.value = migration.name

    const [error] = await $fetch.try(
        `/api/migrations/${encodeURIComponent(migration.name)}/fresh`,
        { method: 'POST' }
    )

    loadingMigration.value = null

    if (error) return

    toast.success($t('Migration refreshed successfully'))
    load()
}

async function up() {
    operation.value = 'up'

    const [error] = await $fetch.try(`/api/migrations/up`, { method: 'POST', body: { source: props.plugin.id } })

    operation.value = undefined

    if (error) return

    toast.success($t('Migration step up applied successfully'))
    load()
}

async function down() {
    operation.value = 'down'

    const [error] = await $fetch.try(`/api/migrations/down`, { method: 'POST', body: { source: props.plugin.id } })

    operation.value = undefined

    if (error) return

    toast.success($t('Migration step down applied successfully'))
    load()
}

async function rollback() {
    operation.value = 'rollback'

    const [error] = await $fetch.try(`/api/migrations/rollback`, { method: 'POST', body: { source: props.plugin.id } })

    operation.value = undefined

    if (error) return

    toast.success($t('Migrations rolled back successfully'))
    load()
}

async function fresh() {
    operation.value = 'fresh'

    const [error] = await $fetch.try(`/api/migrations/fresh`, { method: 'POST', body: { source: props.plugin.id } })

    operation.value = undefined

    if (error) return

    toast.success($t('Fresh migrations applied successfully'))
    load()
}
</script>

<template>
    <Card>
        <CardHeader class="flex justify-end items-center">
            <div class="flex-1">
                <CardTitle>
                    {{ $t('Migrations') }}
                </CardTitle>
                <CardDescription>
                    {{ $t('Run, rollback or reset database migrations for this plugin') }}
                </CardDescription>
            </div>

            <AlertButton
                :loading="operation === 'up'"
                :disabled="!!operation"
                :description="$t('This will run one migration step up')"
                variant="outline"
                size="sm"
                class="bg-green-500 text-white hover:bg-green-600 border-0"
                @confirm="up"
            >
                {{ $t('Up') }}
            </AlertButton>

            <AlertButton
                :loading="operation === 'down'"
                :disabled="!!operation"
                :description="$t('This will run one migration step down')"
                variant="outline"
                size="sm"
                class="bg-red-500 text-white hover:bg-red-600 border-0"
                @confirm="down"
            >
                {{ $t('Down') }}
            </AlertButton>

            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <Button
                        variant="outline"
                        size="icon"
                        :disabled="!!operation"
                    >
                        <EllipsisVertical class="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    class="w-48"
                >
                    <AlertButton
                        :loading="operation === 'fresh'"
                        :disabled="!!operation"
                        :description="$t('This will drop all tables and recreate them. This can potentially lead to data loss')"
                        variant="ghost"
                        size="sm"
                        class="w-full justify-start"
                        @confirm="fresh"
                    >
                        {{ $t('Fresh') }}
                    </AlertButton>

                    <AlertButton
                        :loading="operation === 'rollback'"
                        :disabled="!!operation"
                        :description="$t('This can potentially lead to data loss')"
                        variant="ghost"
                        size="sm"
                        class="w-full justify-start"
                        @confirm="rollback"
                    >
                        {{ $t('Rollback') }}
                    </AlertButton>
                </DropdownMenuContent>
            </DropdownMenu>
        </CardHeader>

        <CardContent>
            <DataTable
                :rows="migrations"
                :columns="columns"
                :loading="loading"
                hide-pagination
            >
                <template #row-actions="{ row }">
                    <div class="flex justify-end">
                        <AlertButton
                            v-if="row.status === 'pending'"
                            size="icon"
                            variant="ghost"
                            :tooltip="$t('Up')"
                            :disabled="!!operation || !!loadingMigration"
                            :loading="loadingMigration === row.name"
                            :description="$t('This will apply this migration to the database')"
                            @confirm="migrateOne(row)"
                        >
                            <ArrowUp class="size-4" />
                        </AlertButton>

                        <AlertButton
                            v-if="row.status === 'executed'"
                            size="icon"
                            variant="ghost"
                            :tooltip="$t('Fresh')"
                            :disabled="!!operation || !!loadingMigration"
                            :loading="loadingMigration === row.name"
                            :description="$t('This will rollback and re-apply this migration. This can potentially lead to data loss')"
                            @confirm="freshOne(row)"
                        >
                            <RefreshCw class="size-4" />
                        </AlertButton>

                        <AlertButton
                            v-if="row.status === 'executed'"
                            size="icon"
                            variant="ghost"
                            :tooltip="$t('Down')"
                            :disabled="!!operation || !!loadingMigration"
                            :loading="loadingMigration === row.name"
                            :description="$t('This will rollback this migration. This can potentially lead to data loss')"
                            @confirm="rollbackOne(row)"
                        >
                            <ArrowDown class="size-4" />
                        </AlertButton>
                    </div>
                </template>
            </DataTable>
        </CardContent>
    </Card>
</template>
