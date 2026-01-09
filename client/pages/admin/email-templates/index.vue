<script setup lang="ts">
import { defineColumns } from '#client/components/DataTable.vue'
import { defineFormFields } from '#client/components/DialogForm.vue'
import PageCrud from '#client/components/PageCrud.vue'
import AppLayout from '#client/layouts/AppLayout.vue'
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
        label: $t('Subject'),
        field: 'subject',
    },
    {
        label: $t('Created At'),
        field: row => row.created_at,
    },
    {
        label: $t('Updated At'),
        field: row => row.updated_at,
    },
    { id: 'actions' }
])

const fields = defineFormFields({
    name: {
        component: 'text-field',
        label: $t('Name'),
    },
    subject: {
        component: 'text-field',
        label: $t('Subject'),
    },
})

</script>

<template>
    <AppLayout>
        <PageCrud
            fetch="/api/email-templates"
            :title="$t('Email Templates')"
            :columns="columns"
            :fields="fields"
            view-to="/admin/email-templates/:id"
        />
    </AppLayout>
</template>