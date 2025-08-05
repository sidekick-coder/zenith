<script setup lang="ts" generic="T extends Record<string, any>">
import type { ColumnDef } from '@tanstack/vue-table'
import { computed } from 'vue'
import Icon from '#client/components/Icon.vue'
import DataTable from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'

interface FileItem {
    name: string
    path: string
    type: 'file' | 'directory'
    metas: {
        mimetype?: string
        size?: number
    }
}

const props = withDefaults(defineProps<{
    items: T[]
    labelKey: keyof T
    iconKey?: keyof T
    idKey?: keyof T
    columns?: ColumnDef<T, any>[]
}>(), {
    iconKey: undefined,
    idKey: undefined,
    columns: () => []
})

const emit = defineEmits<{
    click: [item: T]
    dblclick: [item: T]
}>()

defineSlots<{
    [key in `row-${string}`]: (props: { row: T }) => any
}>()

function getFileIcon(item: T): string {
    // If iconKey is provided and the item has that property, use it
    if (props.iconKey && item[props.iconKey]) {
        return String(item[props.iconKey])
    }
    
    // Fallback to FileItem logic if the item matches FileItem structure
    const fileItem = item as unknown as FileItem
    if (fileItem.type === 'directory') return 'folder'

    const mimetype = fileItem.metas?.mimetype || ''

    if (mimetype.startsWith('image/')) return 'Image'
    if (mimetype.startsWith('video/')) return 'Video'
    if (mimetype.startsWith('audio/')) return 'Music'
    if (mimetype.includes('pdf')) return 'FileText'
    if (mimetype.includes('text')) return 'FileText'
    
    return 'file'
}

function getItemLabel(item: T): string {
    return String(item[props.labelKey])
}

function formatFileSize(size?: number): string {
    if (!size) return ''
    
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
    if (size < 1024 * 1024 * 1024) return `${Math.round(size / (1024 * 1024))} MB`
    
    return `${Math.round(size / (1024 * 1024 * 1024))} GB`
}

function getItemDescription(item: T): string {
    // Try to get description from FileItem structure
    const fileItem = item as unknown as FileItem
    if (fileItem.type === 'directory') {
        return $t('Directory')
    }
    
    if (fileItem.metas?.mimetype) {
        return fileItem.metas.mimetype
    }
    
    return ''
}

function getItemSize(item: T): string {
    // Try to get size from FileItem structure
    const fileItem = item as unknown as FileItem
    if (fileItem.type === 'file' && fileItem.metas?.size) {
        return formatFileSize(fileItem.metas.size)
    }
    
    return ''
}

const tableColumns = computed((): ColumnDef<T, any>[] => {
    // If custom columns are provided, use them
    if (props.columns.length > 0) {
        return props.columns
    }
    
    // Default columns
    const defaultColumns: ColumnDef<T, any>[] = [
        {
            id: 'label',
            header: $t('Name'),
            accessorFn: (row) => getItemLabel(row),
            cell: ({ row }) => {
                // This will be overridden by the slot
                return getItemLabel(row.original)
            }
        }
    ]
    
    return defaultColumns
})
</script>

<template>
    <DataTable
        :rows="items"
        :columns="tableColumns"
        row-class="cursor-pointer hover:bg-muted/20 p-1 rounded transition-colors"
        @row-click="emit('click', $event)"
        @row-dblclick="emit('dblclick', $event)"
    >
        <template #row-label="{ row }">
            <div class="flex items-center gap-2">
                <Icon
                    :name="getFileIcon(row)"
                    class="w-4 h-4 flex-shrink-0"
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
