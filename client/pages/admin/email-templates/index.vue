<script setup lang="ts">
import { defineColumns } from '#client/components/DataTable.vue'
import { defineFormFields } from '#client/components/DialogForm.vue'
import PageCrud from '#client/components/PageCrud.vue'
import type EmailTemplate from '#shared/entities/emailTemplate.entity.ts'

const columns = defineColumns<EmailTemplate>([
    {
        label: 'ID',
        field: 'id',
    },
    {
        label: $t('Name'),
        field: 'name',
    },
    {
        label: $t('Key'),
        field: 'key',
    },
    {
        label: $t('Created At'),
        field: row => $dt(row.created_at),
    },
    {
        label: $t('Updated At'),
        field: row => $dt(row.updated_at),
    },
    { id: 'actions' }
])

const fields = defineFormFields({
    name: {
        component: 'text-field',
        label: $t('Name'),
    },
    key: {
        component: 'text-field',
        label: $t('Key'),
    },
    subject: {
        component: 'text-field',
        label: $t('Subject'),
    },
    engine: {
        component: 'select',
        label: $t('Engine'),
        options: [
            { 
                label: 'Raw', 
                value: 'raw' 
            },
            { 
                label: 'HTML', 
                value: 'html' 
            },
            { 
                label: 'MJML', 
                value: 'mjml' 
            },
        ],
    },
})

</script>

<template>

    <PageCrud
    fetch="/api/email-templates"
    :title="$t('Email Templates')"
    :columns="columns"
    :fields="fields"
    :actions="['create', 'destroy']"
    view-to="/admin/email-templates/:id"
    />

</template>
