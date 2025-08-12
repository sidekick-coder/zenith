<script lang="ts">
import {
    FlexRender, getCoreRowModel, useVueTable  
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { computed, h } from 'vue'
import { ref } from 'vue'
import Checkbox from './ui/checkbox/Checkbox.vue'
import { valueUpdater } from './ui/table/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '#client/components/ui/table'
import { cn } from '#client/lib/utils.ts'

export function defineColumns<T extends Record<string, any> = any, V = any>(
    columns: ColumnDef<T, V>[],
): ColumnDef<T, V>[] {
    return columns
}


</script>
<script setup lang="ts" generic="T extends Record<string, any>, TValue">
const props = defineProps({
    selection: {
        type: String as () => 'single' | 'multiple',
        default: null
    },
    rows: {
        type: Array as () => T[],
        default: () => [],
    },
    columns: {
        type: Array as () => ColumnDef<T, TValue>[],
        required: true,
    },
    page: {
        type: Number,
        default: 1,
    },
    limit: {
        type: Number,
        default: 20,
    },
    total: {
        type: Number,
        default: 0,
    },
    lastPage: {
        type: Number,
        default: 1,
    },
    sortBy: {
        type: String,
        default: '',
    },
    sortDesc: {
        type: Boolean,
        default: false,
    },
    class: {
        type: String,
        default: '',
    },
    rowClass: {
        type: String,
        default: '',
    },
})

const emit = defineEmits<{
    'click:row': [item: T]
    'dblclick:row': [item: T]
}>()

const slots = defineSlots<{
     [key in `row-${string}`]: (props: { row: any }) => any
}>()

const selected = defineModel('selected', {
    type: Object,
    default: () => ({}),
})
const columnSizing = ref<any>({})

const tableColumns = computed(() => {
    const items = props.columns.map((column) => {
        if (slots[`row-${column.id}`]) {
            column.cell = ({ row }) => {
                return slots[`row-${column.id}`]({ row: row.original })
            }
        }

        return column
    })

    if (props.selection) {
        items.unshift({
            id: 'select',
            header: ({ table }) => {
                if (props.selection === 'multiple') {
                    return h(Checkbox, {
                        'modelValue': table.getIsAllPageRowsSelected(),
                        'onUpdate:modelValue': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
                        'ariaLabel': 'Select all',
                    } as any)
                }
            } ,
            cell: ({ row }) => h(Checkbox, {
                'modelValue': row.getIsSelected(),
                'onUpdate:modelValue': (value: boolean) => row.toggleSelected(!!value),
                'ariaLabel': 'Select row',
            } as any),
            size: 50,
            minSize: 50,
            maxSize: 50,
            enableSorting: false,
            enableHiding: false,
        })
    }

    return items
})

const table = useVueTable({
    get data() { return props.rows },
    get columns() { return tableColumns.value },
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, selected),
    state: { 
        get rowSelection() { return selected.value }, 
        get columnSizing() { return columnSizing.value }
    },
    defaultColumn: {
        size: 0,
        minSize: 0,
        maxSize: 0
    }
})

function onClick(item: any){
    emit('click:row', item.original)

    if (props.selection === 'single') {
        table.setRowSelection({ [item.id]: true })
    }

    if (props.selection === 'multiple') {
        table.setRowSelection({
            ...selected.value,
            [item.id]: !selected.value[item.id]
        })
    }
}

</script>

<template>
    <Table :class="cn('border rounded', props.class)">
        <TableHeader>
            <TableRow
                v-for="headerGroup in table.getHeaderGroups()"
                :key="headerGroup.id"
            >
                <TableHead
                    v-for="header in headerGroup.headers"
                    :key="header.id"
                    :style="{
                        width: header.column.getSize() !== 0 ? header.column.getSize() + 'px' : 'auto',
                    }"
                >
                    <FlexRender
                        v-if="!header.isPlaceholder"
                        :render="header.column.columnDef.header"
                        :props="header.getContext()"
                    />
                </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <template v-if="table.getRowModel().rows?.length">
                <TableRow
                    v-for="row in table.getRowModel().rows"
                    :key="row.id"
                    :data-state="row.getIsSelected() ? 'selected' : undefined"
                    :class="cn('hover:bg-muted/20 ', props.rowClass)"
                    @click="onClick(row)"
                    @dblclick="emit('dblclick:row', row.original)"
                >
                    <TableCell
                        v-for="cell in row.getVisibleCells()"
                        :key="cell.id"
                        :style="{
                            width: cell.column.getSize() !== 0 ? cell.column.getSize() + 'px' : 'auto',
                        }"
                    >
                        <FlexRender
                            :render="cell.column.columnDef.cell"
                            :props="cell.getContext()"
                        />
                    </TableCell>
                </TableRow>
            </template>
            <template v-else>
                <TableRow>
                    <TableCell
                        :colspan="tableColumns.length"
                        class="h-24 text-center"
                    >
                        No data available
                    </TableCell>
                </TableRow>
            </template>
        </TableBody>
    </Table>
</template>
