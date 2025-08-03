<script setup lang="ts">
import { ref } from 'vue'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'

const items = ref([])
const page = ref(1)

const columns = defineColumns([
    {
        id: 'id',
        header: 'ID',
        accessorKey: 'id',
    },
    {
        id: 'name',
        header: $t('Name'),
        accessorKey: 'name',
    },
    {
        id: 'username',
        header: $t('Username'),
        accessorKey: 'username',
    },
    {
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
    },
])
</script>
<template>
    <DataTable 
        :items="items"
        :page="page"
        :columns="columns"
    />
</template>
