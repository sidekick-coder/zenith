<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
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
])

async function load() {
    loading.value = true
    const data = await $fetch('/api/migrations', { query: { module: props.module.id } })

    if (Array.isArray(data)) {
        migrations.value = data as Migration[]
    }

    if (!Array.isArray(data)) {
        migrations.value = []
    }

    loading.value = false
}

onMounted(load)

const operation = ref<'migrate' | 'rollback' | 'fresh'>()

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
                :loading="operation === 'fresh'"
                :disabled="!!operation"
                :description="$t('This will drop all tables and recreate them. This can potentially lead to data loss')"
                variant="outline"
                @confirm="fresh"
            >
                Fresh
            </AlertButton>
        
            <AlertButton
                :loading="operation === 'rollback'"
                :disabled="!!operation"
                :description="$t('This can potentially lead to data loss')"
                variant="outline"
                @confirm="rollback"
            >
                Rollback
            </AlertButton>
        
        
            <AlertButton
                :loading="operation === 'migrate'"
                :disabled="!!operation"
                :description="$t('This will make changes in your database')"
                @confirm="migrate"
            >
                Migrate
            </AlertButton>
        </CardHeader>

        <CardContent>
            <DataTable
                :rows="migrations"
                :columns="columns"
                :loading="loading"
            />
        </CardContent>
    </Card>
</template>
