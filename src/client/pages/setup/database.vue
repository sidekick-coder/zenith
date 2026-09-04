<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/valibot'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import Button from '#client/components/Button.vue'
import Card from '#client/components/ui/card/Card.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'
import { tryCatch } from '#shared/utils/tryCatch.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import FormTextField from '#client/components/FormTextField.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'

import FormSelect from '#client/components/FormSelect.vue'

const isLoading = ref(false)
const isTestLoading = ref(false)

const types = [
    {
        value: 'sqlite',
        label: $t('SQLite') 
    },
    {
        value: 'mysql',
        label: $t('MySQL') 
    },
    {
        value: 'postgresql',
        label: $t('PostgreSQL') 
    },
]

const { handleSubmit, values } = useForm({
    validationSchema: toTypedSchema(
        v.object({
            type: v.picklist(types.map(t => t.value), $t('Database Type')),
            options: v.any()
        })),
})


const onTestConnection = handleSubmit(async (data) => {
    isTestLoading.value = true

    const [error, response] = await $fetch.try('/api/setup/database/test', {
        method: 'POST',
        data,
    })

    isTestLoading.value = false

    if (error) {
        return
    }

    toast.success(response.message || $t('Database connection test successful'))
})

const onSubmit = handleSubmit(async (data) => {
    isLoading.value = true

    const [error] = await tryCatch(() => {
        return $fetch('/api/setup/database', {
            method: 'POST',
            data
        })
    })

    if (error) {
        isLoading.value = false
        return
    }

    
    setTimeout(async () => {
        isLoading.value = false
        toast.success('Database setup completed successfully!')
        window.location.href = '/setup/user' // Redirect to the next step
    }, 1000)
})
</script>

<template>
    <form
        class="h-dvh w-dvw flex items-center justify-center"
        @submit.prevent="onSubmit"
    >
        <Card
            class="w-full max-w-md"
        >
            <CardHeader>
                <CardTitle>
                    {{ $t('Database') }}
                </CardTitle>
                <CardDescription>
                    {{ $t('Configure your database settings below.') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-6">
                <FormSelect
                    name="type"
                    :label="$t('Database Type')"
                    :options="types"
                    label-key="label"
                    value-key="value"
                />

                <template v-if="values.type === 'sqlite'">
                    <FormTextField
                        name="options.database"
                        type="text"
                        :label="$t('SQLite Database Path')"
                        placeholder="/path/to/database.sqlite"
                        autocomplete="off"
                        value="zenith.db"
                    />
                </template>

                <template v-if="values.type === 'mysql'">
                    <FormTextField
                        name="options.host"
                        type="text"
                        :label="$t('Host')"
                        placeholder="localhost"
                        autocomplete="off"
                    />
                    <FormTextField
                        name="options.port"
                        type="number"
                        :label="$t('Port')"
                        placeholder="3306"
                        autocomplete="off"
                    />
                    <FormTextField
                        name="options.database"
                        type="text"
                        :label="$t('Database Name')"
                        placeholder="my_database"
                        autocomplete="off"
                    />
                    <FormTextField
                        name="options.user"
                        type="text"
                        :label="$t('User')"
                        placeholder="root"
                        autocomplete="off"
                    />
                    <FormTextField
                        name="options.password"
                        type="password"
                        :label="$t('Password')"
                        placeholder="••••••••"
                        autocomplete="off"
                    />
                </template>

                <template v-if="values.type === 'postgresql'">
                    <FormTextField
                        name="options.host"
                        type="text"
                        :label="$t('Host')"
                        placeholder="localhost"
                        autocomplete="off"
                    />
                    <FormTextField
                        name="options.port"
                        type="number"
                        :label="$t('Port')"
                        placeholder="5432"
                        autocomplete="off"
                    />
                    <FormTextField
                        name="options.database"
                        type="text"
                        :label="$t('Database Name')"
                        placeholder="my_database"
                        autocomplete="off"
                    />
                    <FormTextField
                        name="options.user"
                        type="text"
                        :label="$t('User')"
                        placeholder="postgres"
                        autocomplete="off"
                    />
                    <FormTextField
                        name="options.password"
                        type="password"
                        :label="$t('Password')"
                        placeholder="••••••••"
                        autocomplete="off"
                    />
                </template>
            </CardContent>
            <CardFooter class="flex gap-3 mt-4">
                <Button
                    type="button"
                    variant="outline"
                    class="flex-1"
                    :disabled="isLoading || isTestLoading"
                    :loading="isTestLoading"
                    @click="onTestConnection"
                >
                    {{ $t('Test Connection') }}
                </Button>
                <Button
                    type="submit"
                    class="flex-1"
                    :disabled="isLoading || isTestLoading"
                    :loading="isLoading"
                    :tabindex="4"
                >
                    {{ $t('Submit') }}
                </Button>
            </CardFooter>
        </Card>
    </form>
</template>
