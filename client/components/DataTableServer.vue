<script setup lang="ts" generic="T extends Record<string, any> = Record<string, any>">
import type { ColumnDef } from '@tanstack/vue-table'
import { ref, useSlots, watch  } from 'vue'
import type { PropType } from 'vue'
import DataTable from './DataTable.vue'
import Pagination from '#shared/entities/pagination.entity.ts'
import { $fetch } from '#client/utils/fetcher.ts'

interface FetchParams {
    page: number
    limit: number
}

interface FetchCallback {
    (params: FetchParams): Promise<Pagination>
}

defineSlots<{
     [key in `row-${string}`]: (props: { row: T }) => T
}>()

const slots = useSlots()

const props = defineProps({
    rows: {
        type: Array as () => T[],
        default: () => [],
    },
    columns: {
        type: Array as () => ColumnDef<any, any>[],
        required: true,
    },
    fetch: {
        type: [String, Function] as PropType<string | FetchCallback>,
        required: true,
    },
    serialize: {
        type: Function as PropType<(row: Record<string, any>) => T>,
        default: (row: Record<string, any>) => row as T,
    }
})

const pagination = ref<Pagination<T>>({
    items: [],
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 1,
})

const loading = defineModel('loading', {
    type: Boolean,
    default: false,
})
const page = ref(1)
const limit = ref(20)

async function load(){
    loading.value = true 

    let response: Pagination | null = null

    if (typeof props.fetch === 'function') {
        response = await props.fetch({
            page: page.value,
            limit: limit.value,
        })
    }

    if (typeof props.fetch === 'string') {
        response = await $fetch<Pagination>(props.fetch, {
            method: 'GET',
            query: {
                page: page.value,
                limit: limit.value,
            }
        })
    }

    if (!response) {
        response = {
            items: [],
            page: 1,
            per_page: 20,
            total: 0,
            total_pages: 1,
        }
    }

    response.items = response.items.map(i => props.serialize(i))


    pagination.value = new Pagination<T>(response)

    setTimeout(() => {
        loading.value = false
    }, 800)
}

watch(page, load, { immediate: true })

defineExpose({
    load,
})

</script>

<template>
    <DataTable
        :loading="loading"
        :rows="pagination.items"
        :columns="columns"
    >
        <template
            v-for="s in Object.keys(slots)"
            :key="s"
            #[s]="slotProps"
        >
            <slot
                :name="s as any"
                v-bind="slotProps"
            />
        </template>
    </DataTable>
</template>
