<script setup lang="ts">
import { computed } from 'vue'
import Icon from './Icon.vue'
import Select from './Select.vue'
import { Button } from '#client/components/ui/button'

const page = defineModel('page', {
    type: Number,
    required: true,
})

const total = defineModel('total', {
    type: Number,
    required: true,
})

const totalPages = defineModel('totalPages', {
    type: Number,
    required: true,
})


const limit = defineModel('limit', {
    type: Number,
    required: true,
})

const limitOptions = defineModel('limitOptions', {
    type: Array as () => number[],
    required: false,
    default: () => [10, 20, 30, 40, 50],
})

const visiblePages = computed(() => {
    const current = page.value
    const total = totalPages.value
    const pages: number[] = []
    
    if (total <= 3) {
        // Show all pages if total is 3 or less
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
        return pages
    }
    
    // Calculate the range of 3 pages to show
    let start = Math.max(1, current - 1)
    const end = Math.min(total, start + 2)
    
    // Adjust start if end is at the boundary
    if (end - start < 2) {
        start = Math.max(1, end - 2)
    }
    
    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    
    return pages
})


</script>

<template>
    <div class="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
        <div class="flex-1 text-sm text-muted-foreground order-2 sm:order-1">
            {{ $t('Showing :0 of :1 rows', [limit, total]) }}
        </div>
        <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 order-1 sm:order-2">
            <div class="flex items-center space-x-2 sm:space-x-4">
                <Select
                    v-model="limit"
                    :label="$t('Rows per page')"
                    :options="limitOptions"
                    variant="horizontal"
                    label-class="min-w-auto text-xs sm:text-sm"
                />
            </div>
            <div class="flex items-center space-x-2 sm:space-x-2">
                <Button
                    variant="outline"
                    class="w-8 h-8 p-0"
                    :disabled="page === 1"
                    @click="page = 1"
                >
                    <span class="sr-only">{{ $t('Go to first page') }}</span>
                    <Icon
                        name="ChevronsLeft"
                        class="w-4 h-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    class="w-8 h-8 p-0"
                    :disabled="page === 1"
                    @click="page = page - 1"
                >
                    <span class="sr-only">{{ $t('Go to previous page') }}</span>
                    <Icon
                        name="ChevronLeft"
                        class="w-3 h-3 sm:w-4 sm:h-4"
                    />
                </Button>
                <Button
                    v-for="pageNumber in visiblePages"
                    :key="pageNumber"
                    :variant="page === pageNumber ? 'default' : 'outline'"
                    class="w-8 h-8 p-0"
                    @click="page = pageNumber"
                >
                    {{ pageNumber }}
                </Button>
                <Button
                    variant="outline"
                    class="w-8 h-8 p-0"
                    :disabled="page === totalPages"
                    @click="page = page + 1"
                >
                    <span class="sr-only">{{ $t('Go to next page') }}</span>
                    <Icon
                        name="ChevronRight"
                        class="w-3 h-3 sm:w-4 sm:h-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    class="w-8 h-8 p-0"
                    :disabled="page === totalPages"
                    @click="page = totalPages"
                >
                    <span class="sr-only">{{ $t('Go to last page') }}</span>
                    <Icon
                        name="ChevronsRight"
                        class="w-4 h-4"
                    />
                </Button>
            </div>
        </div>
    </div>
</template>