<script lang="ts">
import {
    FlexRender, getCoreRowModel, useVueTable  
} from '@tanstack/vue-table'
import type { ColumnDef } from '@tanstack/vue-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '#app/components/ui/table'


</script>
<script setup lang="ts" generic="TData, TValue">
const props = defineProps({
    items: {
        type: Array as () => any[],
        default: () => [],
    },
    columns: {
        type: Array as () => ColumnDef<TData, TValue>[],
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

const table = useVueTable({
    get data() { return props.items },
    get columns() { return props.columns },
    getCoreRowModel: getCoreRowModel(),
})
</script>

<template>
    <div class="border">
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