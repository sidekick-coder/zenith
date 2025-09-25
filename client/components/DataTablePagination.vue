<script setup lang="ts">
import type { Table } from '@tanstack/vue-table'
import Icon from './Icon.vue'
import { Button } from '#client/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '#client/components/ui/select'

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


</script>

<template>
    <div class="flex items-center justify-between px-2">
        <div class="flex-1 text-sm text-muted-foreground">
            {{ $t('Showing :0 of :1 rows', [limit, total]) }}
        </div>
        <div class="flex items-center space-x-6 lg:space-x-8">
            <div class="flex items-center space-x-2">
                <p class="text-sm font-medium">
                    Rows per page
                </p>
                <Select v-model="limit">
                    <SelectTrigger class="h-8 w-[70px]">
                        <SelectValue :placeholder="limit.toString()" />
                    </SelectTrigger>
                    <SelectContent side="top">
                        <SelectItem
                            v-for="i in [10, 20, 30, 40, 50]"
                            :key="i"
                            :value="`${i}`"
                        >
                            {{ i }}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div class="flex w-[100px] items-center justify-center text-sm font-medium">
                {{ $t('Page :0 of :1', [page, totalPages]) }}
            </div>
            <div class="flex items-center space-x-2">
                <Button
                    variant="outline"
                    class="hidden w-8 h-8 p-0 lg:flex"
                    :disabled="page === 1"
                    @click="page = 1"
                >
                    <span class="sr-only">{{ $t('Go to first page') }}</span>
                    <Icon
                        name="DoubleArrowLeftIcon"
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
                        name="ChevronLeftIcon"
                        class="w-4 h-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    class="w-8 h-8 p-0"
                    :disabled="page === totalPages"
                    @click="page = page + 1"
                >
                    <span class="sr-only">{{ $t('Go to next page') }}</span>
                    <Icon
                        name="ChevronRightIcon"
                        class="w-4 h-4"
                    />
                </Button>
                <Button
                    variant="outline"
                    class="hidden w-8 h-8 p-0 lg:flex"
                    :disabled="page === totalPages"
                    @click="page = totalPages"
                >
                    <span class="sr-only">{{ $t('Go to last page') }}</span>
                    <Icon
                        name="DoubleArrowRightIcon"
                        class="w-4 h-4"
                    />
                </Button>
            </div>
        </div>
    </div>
</template>