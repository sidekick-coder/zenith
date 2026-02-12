<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import AlertButton from './AlertButton.vue'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'

import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import $fetch from '#client/facades/fetch.facade.ts'
import type OauthAccount from '#shared/entities/oauthAccount.entity.ts'

const props = defineProps({
    userId: {
        type: [Number, String],
        required: true,
    },
    redirectTo: {
        type: String,
        default: null
    }
})

const tableRef = ref<ComponentExposed<typeof DataTable>>()
const url = computed(() => `/api/users/${props.userId}/oauth-accounts`)

const loading = ref(false)
const loadingOAuth = ref(false)

const columns = defineColumns<OauthAccount>([
    {
        id: 'id',
        label: 'ID',
        field: 'id',
        width: 50,
    },
    {
        id: 'provider',
        label: $t('Provider'),
        field: 'provider'
    },
    {
        id: 'provider_user_id',
        label: $t('Provider User ID'),
        field: 'provider_user_id'
    },
    {
        id: 'provider_user_email',
        label: $t('Provider User Email'),
        field: 'provider_user_email'
    },
    {
        id: 'created_at',
        label: $t('Created At'),
        field: row => $dt(row.created_at)
    },
    { id: 'actions' }
])

async function load(){
    tableRef.value?.load()
}

async function connectOAuth(provider: string) {
    loadingOAuth.value = true

    let redirectTo = props.redirectTo

    if (!redirectTo) {
        redirectTo = '/admin/users/:user_id?tab=oauth-accounts'
    }

    redirectTo = redirectTo.replace(':user_id', props.userId)

    const [error, response] = await $fetch.try('/api/oauth', {
        method: 'POST',
        data: {
            provider,
            action: 'connect',
            success_url: redirectTo,
            error_url: redirectTo,
        }
    })

    if (error) {
        console.error(error)
        loadingOAuth.value = false
        return
    }

    window.location.href = response.url
}

</script>
<template>
    <Card>
        <CardHeader class="flex items-center justify-between">
            <div>
                <CardTitle>{{ $t('OAuth Accounts') }}</CardTitle>
                <CardDescription>
                    {{ $t('Connected OAuth accounts for this user') }}
                </CardDescription>
            </div>
            <div class="flex items-center gap-2">
                <Button
                    :disabled="loadingOAuth"
                    @click="connectOAuth('google')"
                >
                    {{ $t('Add new') }}
                </Button>
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
            </div>
        </CardHeader>

        <CardContent>
            <DataTable 
                ref="tableRef"
                v-model:loading="loading"
                :columns="columns"
                :fetch="url"
            >
                <template #row-actions="{ row }">
                    <div class="flex items-center gap-2 justify-end">
                        <AlertButton
                            variant="ghost"
                            size="sm"
                            :fetch="`/api/users/${props.userId}/oauth-accounts/${row.id}`"
                            @fetched="load"
                        >
                            <Icon name="trash" />
                        </AlertButton>
                    </div>
                </template>
            </DataTable>
        </CardContent>
    </Card>
</template>
