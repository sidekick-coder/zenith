<script setup lang="ts">
import {
    useFetchPagination,
    Switch,
    ZDataTable, ZDialogForm, ZAlertButton, PageTitle, PageSubtitle, ZButton, defineColumns, defineFormFields, Badge
} from '@sidekick-coder/zenith-kit/components'
import { onMounted, onServerPrefetch, ref } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { validator } from '@sidekick-coder/zenith-kit/shared'
import { fetcher, toast } from '@sidekick-coder/zenith-kit/client'
import AdminLayout from '#client/layouts/AdminLayout.vue'
import { webhookSenderCreateSchema } from '#shared/schemas/webhookSenderSchema.ts'
import type { WebhookSender } from '#shared/schemas/webhookSenderSchema.ts'
import Icon from '#client/components/Icon.vue'

// table
const { items, loading, load, hydrate } = useFetchPagination('/api/webhook-senders', { limit: 100, })

const columns = defineColumns([
    {
        id: 'enabled',
        label: $t('Enabled'),
        field: 'enabled',
    },
    {
        id: 'name',
        label: $t('Name'),
        field: 'name'
    },
    {
        id: 'event',
        label: $t('Event'),
        field: 'trigger_events',
    },
    { id: 'actions', }
])

onMounted(hydrate)
onServerPrefetch(hydrate)

// form
const schema = validator.create(v => v.intersect([
    v.omit(webhookSenderCreateSchema, ['request_headers', 'trigger_events']),
    v.object({
        request_headers: v.optional(v.string()),
        trigger_events: v.string(),
    })
]))

const fields = defineFormFields({
    name: {
        component: 'text-field',
        label: $t('Name'),
        placeholder: $t('New user notify'),
    },
    trigger_events: {
        component: 'textarea',
        label: $t('Events'),
        hint: $t('Separated by semicolons. ex "user:created;user:deleted"'),
    },
    request_url: {
        component: 'text-field',
        label: $t('Request URL'),
        placeholder: 'https://example.com/webhook',
    },
    request_method: {
        component: 'select',
        label: $t('Request Method'),
        options: [
            {
                label: 'POST',
                value: 'POST'
            },
            {
                label: 'GET',
                value: 'GET'
            },
            {
                label: 'PUT',
                value: 'PUT'
            },
            {
                label: 'DELETE',
                value: 'DELETE'
            },
        ],
    },
    request_headers: {
        component: 'textarea',
        label: $t('Request Headers'),
        // split with new line, and key value with ":"
        hint: $t('One header per line, key and value separated by ":". ex "Content-Type: application/json"'),
    },
    request_body: {
        component: 'textarea',
        label: $t('Request Body'),
        hint: $t('You can use {{data.event}} to include the variables in the request body.'),
    },
})

function toForm(data: WebhookSender) {
    const payload: Record<string, any> = {
        name: data.name,
        request_url: data.request_url,
        request_method: data.request_method,
        request_body: data.request_body
    }

    if (data.trigger_events) {
        payload.trigger_events = data.trigger_events.join(';')
    }

    return payload
}

function toRequestData(data: Record<string, any>) {
    const payload: Record<string, any> = {
        name: data.name,
        request_url: data.request_url,
        request_method: data.request_method,
        request_body: data.request_body
    }

    if (data.trigger_events) {
        payload.trigger_events = data.trigger_events.split('\n\n;').map((event: string) => event.trim())
    }

    if (data.request_headers) {
        const headers: Record<string, string> = {}
        const lines = data.request_headers.split('\n')

        lines.forEach((line: string) => {
            const [key, value] = line.split(':').map((part: string) => part.trim())
            if (key && value) {
                headers[key] = value
            }
        })

        payload.request_headers = headers
    }

    return payload
}

// actions
const deletingItems = ref<string[]>([])
const toggling = ref<string[]>([])

async function create(data: Record<string, any>) {
    const [error] = await fetcher.try('/api/webhook-senders', {
        method: 'POST',
        data: toRequestData(data)
    })

    if (error) {
        toast.error($t('Failed to create.'))
        return
    }

    toast.success($t('Created successfully.'))

    load()
}

async function update(id: string, data: Record<string, any>) {
    const [error] = await fetcher.try(`/api/webhook-senders/${id}`, {
        method: 'PUT',
        data: toRequestData(data)
    })

    if (error) {
        return
    }

    toast.success($t('Updated successfully.'))

    load()
}

async function destroy(id: string) {
    deletingItems.value.push(id)

    const [error] = await fetcher.try(`/api/webhook-senders/${id}`, { method: 'DELETE' })

    if (error) {
        deletingItems.value = []
        return
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success($t('Deleted successfully.'))

    load()
}

async function toggle(row: WebhookSender) {
    toggling.value.push(row.id)

    const [error] = await fetcher.try(`/api/webhook-senders/${row.id}/toggle`, { method: 'POST' })

    if (error) {
        toggling.value = []
        return
    }

    await new Promise(resolve => setTimeout(resolve, 800))

    toast.success($t('Updated successfully.'))

    toggling.value = []

    load()
}

</script>
<template>
    <AdminLayout>
        <div class="mb-6 flex items-center justify-between gap-4">
            <div>
                <PageTitle>
                    {{ $t('Webhook senders') }}
                </PageTitle>
                <PageSubtitle>
                    {{ $t('Manage your webhook senders here.') }}
                </PageSubtitle>
            </div>

            <div class="flex items-center gap-2">
                <ZButton
                    variant="outline"
                    size="icon"
                    :disabled="loading"
                    @click="load"
                >
                    <RefreshCw
                        class="size-4"
                        :class="{ 'animate-spin': loading }"
                    />
                </ZButton>
                <ZDialogForm
                    :fields="fields"
                    :title="$t('New Webhook Sender')"
                    :description="$t('Create a new webhook sender.')"
                    :submit-text="$t('Create')"
                    :schema="schema"
                    :handle="create"
                    @submit="load"
                >
                    <ZButton>
                        {{ $t('Add new') }}
                    </ZButton>
                </ZDialogForm>
            </div>
        </div>

        <ZDataTable
            :loading="loading"
            :rows="items"
            :columns="columns"
        >
            <template #row-enabled="{ row }">
                <Icon
                    v-if="toggling.includes(row.id)"
                    name="Loader2"
                    class="animate-spin"
                />

                <Switch
                    v-else
                    :model-value="!!row.enabled"
                    @click="toggle(row)"
                />
            </template>

            <template #row-event="{ row }">
                <div class="flex flex-col gap-1">
                    <Badge
                        v-for="event in row.trigger_events"
                        :key="event"
                    >
                        {{ event }}
                    </Badge>
                </div>
            </template>

            <template #row-actions="{ row }">
                <div class="flex justify-end items-center gap-2">
                    <ZDialogForm
                        :fields="fields"
                        :title="$t('Edit Webhook Sender')"
                        :description="$t('Edit the webhook sender.')"
                        :submit-text="$t('Update')"
                        :schema="schema"
                        :values="toForm(row)"
                        :handle="(data: any) => update(row.id, data)"
                        @submit="load"
                    >
                        <ZButton
                            variant="ghost"
                            size="icon"
                        >
                            <Icon name="Edit" />
                        </ZButton>
                    </ZDialogForm>

                    <ZAlertButton
                        variant="ghost"
                        :loading="deletingItems.includes(row.id)"
                        @confirm="destroy(row.id)"
                    >
                        <Icon name="trash" />
                    </ZAlertButton>
                </div>
            </template>
        </ZDataTable>
    </AdminLayout>
</template>
