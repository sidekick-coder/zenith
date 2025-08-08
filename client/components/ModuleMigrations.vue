
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { $fetch } from '../utils/fetcher'
import DataTable from './DataTable.vue'
import Button from './Button.vue'
import { CardHeader, CardTitle } from './ui/card'
import { tryCatch } from '#shared/tryCatch.ts'
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

const columns = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'status',
        header: 'Status',
    },
]

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
</script>

<template>
    <CardHeader class="flex justify-end p-4 items-center">
        <CardTitle class="flex-1">
            {{ $t('Migrations') }}
        </CardTitle>

        <Button
            :loading="executing"
            variant="destructive"
            @click="rollback"
        >
            Rollback
        </Button>
        
        <Button
            :loading="executing"
            @click="migrate"
        >
            Migrate
        </Button>
    </CardHeader>

    <DataTable
        :rows="migrations"
        :columns="columns"
        :loading="loading"
        class="border-x-0 rounded-0"
    />
</template>
