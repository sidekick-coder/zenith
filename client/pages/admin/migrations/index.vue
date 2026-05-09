<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { RefreshCw, ArrowUp, ArrowDown, EllipsisVertical } from 'lucide-vue-next'
import { $fetch } from '#client/utils/fetcher.ts'
import AdminLayout from '#client/layouts/AdminLayout.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import AlertButton from '#client/components/AlertButton.vue'
import Button from '#client/components/Button.vue'
import Badge from '#client/components/ui/badge/Badge.vue'
import { Input } from '#client/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '#client/components/ui/dropdown-menu'

interface Migration {
    name: string
    source: string
    filename: string
    status: 'executed' | 'pending'
    executedAt: string | null
}

const migrations = ref<Migration[]>([])
const loading = ref(false)
const source = ref('')
const operation = ref<string | null>(null)
const loadingMigration = ref<string | null>(null)

const columns = defineColumns<Migration>([
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
        id: 'status',
        label: $t('Status'),
        width: 120,
    },
    {
        id: 'actions',
        label: '',
        width: 150,
    },
])

async function load() {
    loading.value = true

    const query = source.value ? `?source=${encodeURIComponent(source.value)}` : ''
    const [, data] = await $fetch.try(`/api/migrations${query}`)

    migrations.value = Array.isArray(data) ? (data as Migration[]) : []

    loading.value = false
}

onMounted(load)

async function up() {
    operation.value = 'up'

    const body: any = { steps: 1 }
    if (source.value) body.source = source.value

    const [error] = await $fetch.try('/api/migrations/up', { method: 'POST', body })

    operation.value = null

    if (error) return

    toast.success($t('Migration step up applied successfully'))
    load()
}

async function down() {
    operation.value = 'down'

    const body: any = { steps: 1 }
    if (source.value) body.source = source.value

    const [error] = await $fetch.try('/api/migrations/down', { method: 'POST', body })

    operation.value = null

    if (error) return

    toast.success($t('Migration step down applied successfully'))
    load()
}

async function rollback() {
    operation.value = 'rollback'

    const body: any = {}
    if (source.value) body.source = source.value

    const [error] = await $fetch.try('/api/migrations/rollback', { method: 'POST', body })

    operation.value = null

    if (error) return

    toast.success($t('Migrations rolled back successfully'))
    load()
}

async function fresh() {
    operation.value = 'fresh'

    const body: any = {}
    if (source.value) body.source = source.value

    const [error] = await $fetch.try('/api/migrations/fresh', { method: 'POST', body })

    operation.value = null

    if (error) return

    toast.success($t('Fresh migrations applied successfully'))
    load()
}

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
</script>

<template>
    <AdminLayout
        :breadcrumbs="[{ label: $t('Migrations'), href: '/admin/migrations' }]"
    >
        <div class="mb-6 flex items-center justify-between gap-4">
            <div>
                <PageTitle>
                    {{ $t('Migrations') }}
                </PageTitle>
                <PageSubtitle>
                    {{ $t('View and manage all database migrations') }}
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
                    :disabled="!!operation"
                    @click="load"
                >
                    <RefreshCw
                        class="size-4"
                        :class="{ 'animate-spin': loading }"
                    />
                </Button>

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
            </div>
        </div>

        <DataTable
            :rows="migrations"
            :columns="columns"
            :loading="loading"
        >
            <template #row-status="{ row }">
                <Badge :variant="row.status === 'executed' ? 'default' : 'secondary'">
                    {{ row.status === 'executed' ? $t('Executed') : $t('Pending') }}
                </Badge>
            </template>

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
    </AdminLayout>
</template>
