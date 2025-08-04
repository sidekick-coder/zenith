<script lang="ts">
import {
    FlexRender, getCoreRowModel, useVueTable  
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import { computed } from 'vue'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '#client/components/ui/table'

export function defineColumns<TData, TValue>(
    columns: ColumnDef<TData, TValue>[],
): ColumnDef<TData, TValue>[] {
    return columns
}


</script>
<script setup lang="ts" generic="T extends Record<string, any>, TValue">
const props = defineProps({
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
})

const slots = defineSlots<{
     [key in `row-${string}`]: (props: { row: any }) => any
}>()

const tableColumns = computed(() => {
    return props.columns.map((column) => {
        if (slots[`row-${column.id}`]) {
            column.cell = ({ row }) => {
                return slots[`row-${column.id}`]({ row: row.original })
            }
        }

        return column
    })
})

const table = useVueTable({
    get data() { return props.rows },
    get columns() { return tableColumns.value },
    getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
    <div class="border rounded">
        <Table>
            <TableHeader>
                <TableRow
                    v-for="headerGroup in table.getHeaderGroups()"
                    :key="headerGroup.id"
                >
                    <TableHead
                        v-for="header in headerGroup.headers"
                        :key="header.id"
                        :style="{
                            width: header.getSize() + 'px',
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
                    >
                        <TableCell
                            v-for="cell in row.getVisibleCells()"
                            :key="cell.id"
                            :style="{
                                width: cell.column.getSize() + 'px',
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
                            :colspan="columns.length"
                            class="h-24 text-center"
                        >
                            No data available
                        </TableCell>
                    </TableRow>
                </template>
            </TableBody>
        </Table>
    </div>
</template>
