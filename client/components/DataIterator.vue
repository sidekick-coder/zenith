<script lang="ts">
import { watch } from 'vue'
import type { PropType } from 'vue'
import { watchDebounced } from '@vueuse/core'
import DataTablePagination from './DataTablePagination.vue'
import { cn } from '#client/lib/utils.ts'
import type Pagination from '#shared/entities/pagination.entity.ts'
import { $fetch } from '#client/utils/fetcher.ts'

export interface DataIteratorFetchParams {
    page: number
    limit: number
}

interface DataIteratorFetchCallback {
    (params: DataIteratorFetchParams): Promise<Pagination>
}
</script>

<script setup lang="ts" generic="T extends Record<string, any>">
defineOptions({ 
    inheritAttrs: false
})

const props = defineProps({
    class: {
        type: String,
        default: '',
    },
    fetch: {
        type: [String, Function] as PropType<string | DataIteratorFetchCallback>,
        default: null
    },
    query: {
        type: Object as PropType<Record<string, any>>,
        default: () => ({}),
    },
    serialize: {
        type: Function as PropType<(item: any) => T>,
        default: (item: any) => item as T,
    },
    limitOptions: {
        type: Array as PropType<number[]>,
        default: () => [10, 20, 30, 40, 50],
    },
})

interface Slots {
    default(): any
    items(props: { items: T[] }): any
    empty(): any
    loading(): any
}

defineSlots<Slots>()

const items = defineModel('items', {
    type: Array as () => T[],
    default: () => [],
})

const loading = defineModel('loading', {
    type: Boolean,
    default: false,
})

// fetch
const page = defineModel('page', {
    type: Number,
    default: 1,
})

const totalPages = defineModel('totalPages', {
    type: Number,
    default: 1,
})

const total = defineModel('total', {
    type: Number,
    default: 0,
})

const limit = defineModel('limit', {
    type: Number,
    default: 10,
})

async function load() {
    if (loading.value) return

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
                ...props.query,
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

    const responseItems = Array.isArray(response.items) ? response.items : []

    items.value = responseItems.map(i => props.serialize(i))
    total.value = response.total || 0
    limit.value = response.per_page || 20
    page.value = response.page || 1
    totalPages.value = response.total_pages || 1

    setTimeout(() => {
        loading.value = false
    }, 800)
}

function reset() {
    page.value = 1
    load()
}

watch([page, limit], load, { immediate: true })
watchDebounced(() => props.query, reset, { 
    deep: true,
    debounce: 1000 
})

defineExpose({ 
    load,
    reset
})
</script>

<template>
    <div
        :class="cn('relative', props.class, loading ? 'opacity-50 pointer-events-none' : '')"
        v-bind="$attrs"
    >
        <!-- Loading indicator -->
        <div
            v-if="loading"
            class="absolute top-0 left-0 right-0 h-1 bg-primary animate-pulse rounded z-10"
        />

        <!-- Default slot for custom content above items -->
        <slot />

        <!-- Loading slot -->
        <div v-if="loading && items.length === 0">
            <slot name="loading">
                <div class="text-center py-8 text-muted-foreground">
                    {{ $t('Loading...') }}
                </div>
            </slot>
        </div>

        <!-- Empty state -->
        <div v-else-if="!loading && items.length === 0">
            <slot name="empty">
                <div class="text-center py-8 text-muted-foreground">
                    {{ $t('No data available') }}
                </div>
            </slot>
        </div>

        <slot
            v-else
            name="items"
            :items="items"
        />

        <!-- Pagination -->
        <DataTablePagination
            v-if="totalPages > 1"
            v-model:page="page"
            v-model:limit="limit"
            v-model:total="total"
            v-model:total-pages="totalPages"
            :limit-options="limitOptions"
            class="mt-4"
        />
    </div>
</template>