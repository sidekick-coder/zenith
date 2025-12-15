<script setup lang="ts" generic="T extends Record<string, any>">
import type { PropType } from 'vue'
import DataTable from '#client/components/DataTable.vue'

import ClientOnly from '#client/components/ClientOnly.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import DialogForm from '#client/components/DialogForm.vue'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
import { useFetchPagination } from '#client/composables/useFetchPagination.ts'

const props = defineProps({
    title: {
        type: String,
        default: $t('Items')
    },
    description: {
        type: String,
        default: ''
    },
    serialize: {
        type: Function as PropType<(row: any) => T>,
        default: (row: any) => row as T,
    },
    fetch: {
        type: String,
        default: null
    },
    fetchDestroy: {
        type: String,
        default: null
    },
    actions: {
        type: Array as PropType<Array<'create' | 'edit' | 'destroy'>> ,
        default: () => ['edit', 'destroy'],
    },
})

const { items, loading, load } = useFetchPagination(props.fetch, {
    serialize: props.serialize,
})

const columns = defineModel('columns', {
    type: Array as PropType<Array<any>>,
    default: undefined,
})

const fields = defineModel('fields', {
    type: Object,
    default: () => ({}),
})

const fieldsEdit = defineModel('fieldsEdit', {
    type: Object,
    default: null,
})

function parse(url: string, row: any): string {
    // replace all :key with row.key in fetch-destroy
    return url.replace(/:([a-zA-Z_]+)/g, (_, key) => row[key]) as string
}

defineExpose({
    load,
})

</script>

<template>
    <div>
        <div class="flex mb-4 justify-between items-center gap-4">
            <div class="flex-1">
                <PageTitle>
                    {{ title }}
                </PageTitle>
                <PageSubtitle v-if="description">
                    {{ description }}
                </PageSubtitle>
            </div>
            <div class="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    :disabled="loading"
                    @click="load"
                >
                    <Icon
                        name="RotateCcw"
                        :class="{ 'animate-spin': loading }"
                    />
                </Button>
                <ClientOnly v-if="actions.includes('create')">
                    <DialogForm 
                        :fetch
                        :title="$t('Add new')"
                        :description="$t('Fill in the details below to add a new repository')"
                        :fields="fields"
                        @submit="load"
                    >
                        <Button>
                            {{ $t('Add new') }}
                        </Button>
                    </DialogForm>
                </ClientOnly>
            </div>
        </div>

        <DataTable
            v-if="fetch"
            ref="tableRef"
            v-model:rows="items"
            v-model:loading="loading"
            v-model:columns="columns"
        >
            <template
                v-for="c in columns.filter(c => c.id !== 'actions')"
                #[`row-${c.id}`]="slotProps"
                :key="c.id"
            >
                <slot
                    :name="`row-${c.id}`"
                    v-bind="slotProps"
                />
            </template>


            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">
                    <slot
                        name="prepend-actions"
                        :row="row"
                    />

                    <DialogForm 
                        v-if="actions.includes('edit')"
                        :fetch="parse(fetch || '', row)"
                        method="PUT"
                        :title="$t('Edit')"
                        :description="$t('Fill in the details below to edit')"
                        :fields="fieldsEdit || fields"
                        :values="row"
                        @submit="load"
                    >
                        <Button
                            size="icon"
                            variant="ghost"
                        >
                            <Icon name="Edit" />
                        </Button>
                    </DialogForm>

                    <AlertButton 
                        v-if="actions.includes('destroy')"
                        variant="ghost"
                        size="sm"
                        :fetch="parse(fetchDestroy || fetch, row)"
                        fetch-method="DELETE"
                        @fetched="load"
                    >
                        <Icon name="trash" />
                    </AlertButton>
                </div>
            </template>
        </DataTable>
    </div>
</template>
