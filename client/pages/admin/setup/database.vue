<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/valibot'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import Button from '#client/components/Button.vue'
import Card from '#client/components/ui/card/Card.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'
import { tryCatch } from '#shared/tryCatch.ts'
import { $fetch } from '#client/utils/fetcher.ts'
import FormTextField from '#client/components/FormTextField.vue'
import CardContent from '#client/components/ui/card/CardContent.vue'
import { $t } from '#shared/lang.ts'
import FormSelect from '#client/components/FormSelect.vue'

const isLoading = ref(false)
const router = useRouter()

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
        value: 'postgres',
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

const onSubmit = handleSubmit(async (payload) => {
    isLoading.value = true

    const [error] = await tryCatch(() => {
        return $fetch('/setup/database', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(payload),
        })
    })

    if (error) {
        isLoading.value = false
        return
    }

    
    setTimeout(async () => {
        isLoading.value = false
        toast.success('Database setup completed successfully!')
        await router.push('/admin/setup/user')
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
                        value="storage/database.sqlite"
                    />
                </template>
            </CardContent>
            <CardFooter class="flex justify-center">
                <Button
                    type="submit"
                    class="mt-4 w-full"
                    :disabled="isLoading"
                    :loading="isLoading"
                    :tabindex="4"
                >
                    {{ $t('Submit') }}
                </Button>
            </CardFooter>
        </Card>
    </form>
</template>