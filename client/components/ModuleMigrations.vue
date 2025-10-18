
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { $fetch } from '../utils/fetcher'
import DataTable, { defineColumns } from './DataTable.vue'
import { CardHeader, CardTitle } from './ui/card'
import AlertButton from './AlertButton.vue'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { $t } from '#shared/lang.ts'

const props = defineProps<{ id: string }>()

interface Migration {
  id: string
  name: string
  created_at: string
  status: string
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
    const data = await $fetch(`/api/modules/${props.id}/migrations`)
    
    if (Array.isArray(data)) {
        migrations.value = data as Migration[]
    }
    
    if (!Array.isArray(data)) {
        migrations.value = []
    }

    loading.value = false
}

onMounted(load)

const executing = ref(false)

async function migrate() {
    executing.value = true

    const [error] = await tryCatch(() => $fetch(`/api/modules/${props.id}/migrate`, { method: 'POST' }))

    if (error) {
        executing.value = false
        return
    }

    toast.success($t('Migrations applied successfully'))

    setTimeout(() => {
        executing.value = false
        load()
    }, 1000)
}

async function rollback() {
    executing.value = true

    const [error] = await tryCatch(() => $fetch(`/api/modules/${props.id}/rollback`, { method: 'POST' }))

    if (error) {
        executing.value = false
        return
    }

    toast.success($t('Migrations rolled back successfully'))

    setTimeout(() => {
        executing.value = false
        load()
    }, 1000)
}

async function fresh() {
    executing.value = true

    const [error] = await tryCatch(() => $fetch(`/api/modules/${props.id}/fresh`, { method: 'POST' }))

    if (error) {
        executing.value = false
        return
    }

    toast.success($t('Fresh migrations applied successfully'))

    setTimeout(() => {
        executing.value = false
        load()
    }, 1000)
}
</script>

<template>
    <CardHeader class="flex justify-end p-4 items-center">
        <CardTitle class="flex-1">
            {{ $t('Migrations') }}
        </CardTitle>

        <AlertButton
            :loading="executing"
            :description="$t('This can potentially lead to data loss')"
            variant="destructive"
            @confirm="rollback"
        >
            Rollback
        </AlertButton>
        
        <AlertButton
            :loading="executing"
            :description="$t('This will drop all tables and recreate them. This can potentially lead to data loss')"
            variant="destructive"
            @confirm="fresh"
        >
            Fresh
        </AlertButton>
        
        <AlertButton
            :loading="executing"
            :description="$t('This will make changes in your database')"
            @confirm="migrate"
        >
            Migrate
        </AlertButton>
    </CardHeader>

    <DataTable
        :rows="migrations"
        :columns="columns"
        :loading="loading"
        class="border-x-0 rounded-none"
    />
</template>
