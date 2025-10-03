<script lang="ts">
import { computed, h, watch  } from 'vue'
import type { PropType } from 'vue'
import { ref } from 'vue'
import { get } from 'lodash-es'
import Checkbox from './ui/checkbox/Checkbox.vue'
import DataTablePagination from './DataTablePagination.vue'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '#client/components/ui/table'
import { cn } from '#client/lib/utils.ts'
import type Pagination from '#shared/entities/pagination.entity.ts'
import { $fetch } from '#client/utils/fetcher.ts'

export interface DataTableFetchParams {
    page: number
    limit: number
}

export interface DataTableColumn<T extends Record<string, any> = any> {
    id?: string
    label?: string
    field?: keyof T | ((row: T) => any)
    width?: number
}

interface DataTableFetchCallback {
    (params: DataTableFetchParams): Promise<Pagination>
}

export function defineColumns<T extends Record<string, any> = any>(columns: DataTableColumn<T>[]){
    return columns
}

</script>
<script setup lang="ts" generic="T extends Record<string, any>">

defineOptions({ 
    inheritAttrs: false
})

const props = defineProps({
    selection: {
        type: String as () => 'single' | 'multiple',
        default: null
    },
    columns: {
        type: Array as () => DataTableColumn<T>[],
        required: true,
    },
    class: {
        type: String,
        default: '',
    },
    rowClass: {
        type: String,
        default: '',
    },
    rowKey: {
        type: [String, Function] as PropType<string | ((row: T) => string | number)>,
        default: null,
    },
    fetch: {
        type: [String, Function] as PropType<string | DataTableFetchCallback>,
        default: null
    },
    query: {
        type: Object as PropType<Record<string, any>>,
        default: () => ({}),
    },
    serialize: {
        type: Function as PropType<(row: any) => T>,
        default: (row: any) => row as T,
    }
})

const emit = defineEmits<{
    'click:row': [item: T]
    'dblclick:row': [item: T]
}>()

interface Slots {
    default(): any
    [key: `header-${string}`]: (props: { column: DataTableColumn }) => any
    [key: `row-${string}`]: (props: { column: DataTableColumn, row: T }) => any
}

defineSlots<Slots>()

const selected = defineModel('selected', {
    type: Array as () => T[],
    default: () => ([]),
})

const rows = defineModel('rows', {
    type: Array as () => T[],
    default: () => [],
})

const loading = defineModel('loading', {
    type: Boolean,
    default: false,
})

function findKey(row: any) {
    if (typeof props.rowKey === 'function') {
        return props.rowKey(row)
    }

    if (typeof props.rowKey === 'string') {
        return get(row, props.rowKey, '')
    }

    return null
}


function findValue(row: any, column: DataTableColumn) {
    if (typeof column.field === 'function') {
        return column.field(row)
    }

    if (column.field) {
        return get(row, column.field, '')
    }

    return ''
}

function isSelected(row: any) {
    const key = findKey(row)

    if (key) {
        return selected.value.some(i => findKey(i) === key)
    }

    if (props.selection === 'single') {
        return selected.value[0] === row
    }

    if (props.selection === 'multiple') {
        return selected.value.includes(row)
    }

    return false
}

function select(row: any) {
    if (props.selection === 'single') {
        selected.value = [row]
        return
    }

    if (props.selection === 'multiple' && !isSelected(row)) {
        selected.value.push(row)
    }
}

function unselect(row: any) {
    const key = findKey(row) 

    if (key) {
        selected.value = selected.value.filter(i => findKey(i) !== key)
        return
    }
    
    if (props.selection === 'single') {
        selected.value = []
    }

    if (props.selection === 'multiple' && isSelected(row)) {
        selected.value = selected.value.filter(i => i !== row)
    }
}

function toggle(row: any) {
    if (isSelected(row)) {
        return unselect(row)
    }

    select(row)
}

function selectAll(){
    if (props.rowKey) {
        const newSelected = rows.value.filter(r => !selected.value.some(s => findKey(r) === findKey(s)))
        selected.value = [...selected.value, ...newSelected]
        return
    }

    const newSelected = rows.value.filter(r => !selected.value.includes(r))
    selected.value = [...selected.value, ...newSelected]
}

function unselectAll(){
    if (props.rowKey) {
        selected.value = selected.value.filter(s => !rows.value.some(r => findKey(r) === findKey(s)))
        return
    }

    selected.value = selected.value.filter(s => !rows.value.includes(s))
}

function toggleAll(){
    const allSelected = rows.value.every(isSelected)

    if (allSelected) return unselectAll()

    selectAll()
}


function onClick(item: any){
    emit('click:row', item)
}

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

async function load(){
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

    const items = Array.isArray(response.items) ? response.items : []

    rows.value = items.map(i => props.serialize(i))
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

defineExpose({ 
    load,
    reset
})
</script>

<template>
    <Table
        :wrapper-class="cn('border rounded-lg', props.class, loading ? 'opacity-50 pointer-events-none' : '')"
        v-bind="$attrs"
    >
        <TableHeader>
            <TableRow>
                <TableHead
                    v-if="props.selection === 'multiple'"
                    class="w-10 text-center p-0"
                    :style="{
                        height: 'var(--datatable-th-height, 3rem)'
                    }"
                >
                    <Checkbox
                        class="translate-y-0.5"
                        :model-value="selected.length === rows.length && rows.length > 0"
                        :indeterminate="selected.length > 0 && selected.length < rows.length"
                        @click.stop="toggleAll"
                    />
                </TableHead>
                <TableHead
                    v-for="c in columns"
                    :key="c.id"
                    :style="{
                        width: c.width ? c.width + 'px' : 'auto',
                        height: 'var(--datatable-th-height, 3rem)'
                    }"
                >
                    <slot
                        :name="`header-${c.id}`"
                        :column="c"
                    >
                        {{ c.label }}
                    </slot>
                </TableHead>
            </TableRow>
            <TableRow v-if="loading">
                <TableCell
                    :colspan="columns.length + (props.selection ? 1 : 0)"
                    class="p-0"
                >
                    <div class="h-1 bg-primary w-full animate-pulse" />
                </TableCell>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow v-if="!loading && rows.length === 0">
                <TableCell
                    :colspan="columns.length + (props.selection ? 1 : 0)"
                    class="h-24 text-center"
                >
                    {{ $t('No data available') }}
                </TableCell>
            </TableRow>

            <TableRow
                v-for="row in rows"
                :key="row.id"
                :data-state="isSelected(row) ? 'selected' : undefined"
                :class="cn('hover:bg-muted/20 ', props.rowClass)"
                @click="onClick(row)"
                @dblclick="emit('dblclick:row', row.original)"
            >
                <TableCell
                    v-if="props.selection"
                    class="w-10 text-center p-0"
                >
                    <Checkbox
                        class="translate-y-0.5"
                        :model-value="isSelected(row)"
                        @click.stop="toggle(row)"
                    />
                </TableCell>
                <TableCell
                    v-for="c in columns"
                    :key="c.id"
                    :style="{
                        width: c.width ? c.width + 'px' : 'auto',
                        height: 'var(--datatable-td-height, 3rem)'
                    }"
                >
                    <slot
                        :name="`row-${c.id}`"
                        :column="c"
                        :row="row"
                    >
                        {{ findValue(row, c) }}
                    </slot>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>

    <DataTablePagination
        v-if="totalPages > 1"
        v-model:page="page"
        v-model:limit="limit"
        v-model:total="total"
        v-model:total-pages="totalPages"
        class="mt-4"
    />
</template>
