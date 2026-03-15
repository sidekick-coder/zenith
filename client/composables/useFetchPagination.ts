import { computed, isRef, onMounted, onServerPrefetch, readonly, ref, watch  } from 'vue'
import type { MaybeRef, Ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useState } from './useState.ts'
import type Pagination from '#shared/entities/pagination.entity.ts'
import $fetch from '#client/facades/fetch.facade.ts'

export interface UseFetchPaginationOptions {
    key?: string
    query?: Record<string, any>
    serialize?: (item: any) => any
    refine?: (items: any[]) => any[]
    limit?: number
    debounce?: number
    immediate?: boolean
}

const hydrated = new Set<string>()

export function useFetchPagination<T = any>(url: string, options: UseFetchPaginationOptions = {}) {
    const key = options.key || url

    const response = useState<Pagination>(key, {
        default: () => ({
            items: [],
            page: 1,
            total: 0,
            total_pages: 1,
        })
    })

    const loading = ref(false)

    const page = computed({
        get: () => response.value.page,
        set: (value) => { response.value.page = value }
    })

    const query = ref(options.query || {}) as Ref<Record<string, any>>
    const limit = ref(options.limit || 10)

    const total = computed(() => response.value.total)
    const totalPages = computed(() => response.value.total_pages)
    const items = computed(() => {
        let items = Array.isArray(response.value.items) ? response.value.items : []

        if (options.refine) {
            items = options.refine(items)
        }

        if (options.serialize) {
            return items.map(i => options.serialize!(i)) as T[]
        }

        return items as T[]
    })

    async function load() {
        if (loading.value) return

        loading.value = true

        const [error, result] = await $fetch.try<Pagination>(url, {
            method: 'GET',
            query: {
                page: page.value,
                limit: limit.value,
                ...query.value
            }
        })

        if (error) {
            loading.value = false
            console.error(error)
            return
        }

        response.value = result

        if (import.meta.env.SSR) {
            loading.value = false
            return
        }

        setTimeout(() => {
            loading.value = false
        }, 800)
    }

    async function reset() {
        if (page.value === 1) {
            await load()
            return
        }

        page.value = 1
    }

    watch([page, limit], load)
    watch(query, reset, { deep: true })

    watchDebounced(
        () => options.query,
        reset,
        {
            deep: true,
            debounce: options.debounce || 1000
        }
    )

    if (options.immediate !== false) {
        onMounted(async () => {
            if (!hydrated.has(key) && items.value.length) {
                hydrated.add(key)
                return
            }

            hydrated.add(key)

            await load()
        })

        onServerPrefetch(async () => {
            if (!items.value.length) {
                await load()
            }
        })

    }



    return {
        page,
        limit,
        total,
        totalPages,
        items,
        loading,
        load,
        reset,
        query
    }
}
