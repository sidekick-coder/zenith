<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { ArrowUp, ArrowDown, RefreshCw, Undo2, Play } from 'lucide-vue-next'
import { $fetch } from '../utils/fetcher'
import DataTable, { defineColumns } from './DataTable.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import AlertButton from './AlertButton.vue'


defineOptions({
    inheritAttrs: false,
})

const props = defineProps({
    module: {
        type: Object,
        required: true
    }
})

interface Migration {
  name: string
  module: string
  filename: string
  status: string
  executedAt: string | null
}

const migrations = ref<Migration[]>([])
const loading = ref(false)

const columns = defineColumns<Migration>([
    {
        field: 'name',
        label: 'Name',
    },
    {
        field: 'status',
        label: 'Status',
    },
    {
        id: 'actions',
        label: '',
        width: 200,
    },
])

async function load() {
    loading.value = true

    const data = await $fetch('/api/migrations', { query: { module: props.module.id } })

    if (Array.isArray(data)) {
        migrations.value = (data as Migration[]).reverse()
    }

    if (!Array.isArray(data)) {
        migrations.value = []
    }

    loading.value = false
}

onMounted(load)

const operation = ref<'migrate' | 'rollback' | 'fresh' | 'up' | 'down'>()
const loadingMigration = ref<string | null>(null)

async function migrateOne(migration: Migration) {
    loadingMigration.value = migration.name

    const [error] = await $fetch.try(`/api/migrations/${encodeURIComponent(migration.name)}/migrate`, {
        method: 'POST',
    })

    if (error) {
        loadingMigration.value = null
        return
    }

    toast.success($t('Migration applied successfully'))

    setTimeout(() => {
        loadingMigration.value = null
        load()
    }, 1000)
}

async function rollbackOne(migration: Migration) {
    loadingMigration.value = migration.name

    const [error] = await $fetch.try(`/api/migrations/${encodeURIComponent(migration.name)}/rollback`, {
        method: 'POST',
    })

    if (error) {
        loadingMigration.value = null
        return
    }

    toast.success($t('Migration rolled back successfully'))

    setTimeout(() => {
        loadingMigration.value = null
        load()
    }, 1000)
}

async function freshOne(migration: Migration) {
    loadingMigration.value = migration.name

    const [rollbackError] = await $fetch.try(`/api/migrations/${encodeURIComponent(migration.name)}/rollback`, {
        method: 'POST',
    })

    if (rollbackError) {
        loadingMigration.value = null
        return
    }

    const [migrateError] = await $fetch.try(`/api/migrations/${encodeURIComponent(migration.name)}/migrate`, {
        method: 'POST',
    })

    if (migrateError) {
        loadingMigration.value = null
        return
    }

    toast.success($t('Migration refreshed successfully'))

    setTimeout(() => {
        loadingMigration.value = null
        load()
    }, 1000)
}

async function up() {
    operation.value = 'up'

    const [error] = await $fetch.try('/api/migrations/up', {
        method: 'POST',
        data: {
            module: props.module.id,
        },
    })

    if (error) {
        operation.value = undefined
        return
    }

    toast.success($t('Migration step up applied successfully'))

    setTimeout(() => {
        operation.value = undefined
        load()
    }, 1000)
}

async function down() {
    operation.value = 'down'

    const [error] = await $fetch.try('/api/migrations/down', {
        method: 'POST',
        data: {
            module: props.module.id,
        },
    })

    if (error) {
        operation.value = undefined
        return
    }

    toast.success($t('Migration step down applied successfully'))

    setTimeout(() => {
        operation.value = undefined
        load()
    }, 1000)
}

async function migrate() {
    operation.value = 'migrate'

    const [error] = await $fetch.try('/api/migrations/migrate', { 
        method: 'POST',
        data: { 
            module: props.module.id
        } 
    })

    if (error) {
        operation.value = undefined
        return
    }

    toast.success($t('Migrations applied successfully'))

    setTimeout(() => {
        operation.value = undefined
        load()
    }, 1000)
}

async function rollback() {
    operation.value = 'rollback'

    const [error] = await $fetch.try('/api/migrations/rollback', {
        method: 'POST',
        data: { 
            module: props.module.id
        } 
    })

    if (error) {
        operation.value = undefined
        return
    }

    toast.success($t('Migrations rolled back successfully'))

    setTimeout(() => {
        operation.value = undefined
        load()
    }, 1000)
}

async function fresh() {
    operation.value = 'fresh'

    const [error] = await $fetch.try('/api/migrations/fresh', { 
        method: 'POST',
        data: { 
            module: props.module.id
        } 
    })

    if (error) {
        operation.value = undefined
        return
    }

    toast.success($t('Fresh migrations applied successfully'))

    setTimeout(() => {
        operation.value = undefined
        load()
    }, 1000)
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
                    {{ $t('Run, rollback or reset database migrations for this module') }}
                </CardDescription>
            </div>

            <AlertButton
                :loading="operation === 'up'"
                :disabled="!!operation"
                :description="$t('This will run one migration step up')"
                variant="outline"
                size="sm"
                @confirm="up"
            >
                <ArrowUp class="size-4" />
                {{ $t('Up') }}
            </AlertButton>

            <AlertButton
                :loading="operation === 'down'"
                :disabled="!!operation"
                :description="$t('This will run one migration step down')"
                variant="outline"
                size="sm"
                @confirm="down"
            >
                <ArrowDown class="size-4" />
                {{ $t('Down') }}
            </AlertButton>

            <AlertButton
                :loading="operation === 'fresh'"
                :disabled="!!operation"
                :description="$t('This will drop all tables and recreate them. This can potentially lead to data loss')"
                variant="outline"
                @confirm="fresh"
            >
                <RefreshCw class="size-4" />
                Fresh
            </AlertButton>
        
            <AlertButton
                :loading="operation === 'rollback'"
                :disabled="!!operation"
                :description="$t('This can potentially lead to data loss')"
                variant="outline"
                @confirm="rollback"
            >
                <Undo2 class="size-4" />
                Rollback all
            </AlertButton>
        
        
            <AlertButton
                :loading="operation === 'migrate'"
                :disabled="!!operation"
                :description="$t('This will make changes in your database')"
                @confirm="migrate"
            >
                <Play class="size-4" />
                Migrate all
            </AlertButton>
        </CardHeader>

        <CardContent>
            <DataTable
                :rows="migrations"
                :columns="columns"
                :loading="loading"
                hide-pagination
            >
                <template #row-actions="{ row }">
                    <div class="flex justify-end gap-2">
                        <AlertButton
                            v-if="row.status === 'pending'"
                            size="sm"
                            variant="default"
                            :disabled="!!operation || !!loadingMigration"
                            :loading="loadingMigration === row.name"
                            :description="$t('This will apply this migration to the database')"
                            @confirm="migrateOne(row)"
                        >
                            <Play class="size-4" />
                            {{ $t('Migrate') }}
                        </AlertButton>

                        <AlertButton
                            v-if="row.status === 'executed'"
                            size="sm"
                            variant="outline"
                            :disabled="!!operation || !!loadingMigration"
                            :loading="loadingMigration === row.name"
                            :description="$t('This will rollback and re-apply this migration. This can potentially lead to data loss')"
                            @confirm="freshOne(row)"
                        >
                            <RefreshCw class="size-4" />
                            {{ $t('Fresh') }}
                        </AlertButton>

                        <AlertButton
                            v-if="row.status === 'executed'"
                            size="sm"
                            variant="destructive"
                            :disabled="!!operation || !!loadingMigration"
                            :loading="loadingMigration === row.name"
                            :description="$t('This will rollback this migration. This can potentially lead to data loss')"
                            @confirm="rollbackOne(row)"
                        >
                            <Undo2 class="size-4" />
                            {{ $t('Rollback') }}
                        </AlertButton>
                    </div>
                </template>
            </DataTable>
        </CardContent>
    </Card>
</template>
