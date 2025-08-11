<script setup lang="ts" generic="T extends Record<string, any>">
import type { ColumnDef } from '@tanstack/vue-table'
import Icon from '#client/components/Icon.vue'
import DataTable from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'


interface Props<T> {
    items: T[]
    labelKey: keyof T
    selection?: 'single' | 'multiple'
    iconKey?: keyof T | ((row: T) => string)
    columns?: ColumnDef<T, any>[]
}

const props = withDefaults(defineProps<Props<T>>(), {
    iconKey: undefined,
    selection: undefined,
    columns: () => [
        {
            id: 'label',
            header: $t('Name'),
        }
    ]
})

const selected = defineModel('selected', {
    type: Object,
    default: () => ({})
})

const emit = defineEmits<{
    click: [item: T]
    dblclick: [item: T]
}>()

defineSlots<{
    [key in `row-${string}`]: (props: { row: T }) => any
}>()

function getFileIcon(item: T): string {
    if (typeof props.iconKey === 'function') {
        return props.iconKey(item)
    }

    if (props.iconKey && item[props.iconKey]) {
        return String(item[props.iconKey])
    }
    
    return 'FileText'
}

function getItemLabel(item: T): string {
    return String(item[props.labelKey])
}

function onRowClick(item: T) {
    emit('click', item)
}

function onRowDblClick(item: T) {
    emit('dblclick', item)
}

</script>

<template>
    <DataTable
        v-model:selected="selected"
        :rows="items"
        :columns="columns"
        :selection
        row-class="cursor-pointer hover:bg-muted/20 rounded transition-colors h-12"
        @click:row="onRowClick"
        @dblclick:row="onRowDblClick"
    >
        <template #row-label="{ row }">
            <div class="flex items-center gap-2">
                <Icon
                    :name="getFileIcon(row)"
                    class="size-4 flex-shrink-0"
                />
                <span class="truncate">
                    {{ getItemLabel(row) }}
                </span>
            </div>
        </template>

        <!-- Forward any other row slots -->
        <template
            v-for="slotName in Object.keys($slots).filter(name => name.startsWith('row-') && name !== 'row-label')"
            :key="slotName"
            #[slotName]="slotProps"
        >
            <component
                :is="$slots[slotName as keyof typeof $slots]"
                v-bind="slotProps"
            />
        </template>
    </DataTable>
</template>
