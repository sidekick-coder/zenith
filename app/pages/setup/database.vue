<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/valibot'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import Button from '#app/components/Button.vue'
import LogoIcon from '#app/components/LogoIcon.vue'
import Card from '#app/components/ui/card/Card.vue'
import CardDescription from '#app/components/ui/card/CardDescription.vue'
import CardFooter from '#app/components/ui/card/CardFooter.vue'
import CardHeader from '#app/components/ui/card/CardHeader.vue'
import CardTitle from '#app/components/ui/card/CardTitle.vue'
import { tryCatch } from '#common/tryCatch.ts'
import { $fetch } from '#app/utils/fetcher.ts'
import FormTextField from '#app/components/FormTextField.vue'
import CardContent from '#app/components/ui/card/CardContent.vue'
import { $t } from '#common/lang.ts'
import FormSelect from '#app/components/FormSelect.vue'

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

    toast.success('Database setup completed successfully!')

    setTimeout(async () => {
        isLoading.value = false
        router.push('/admin/setup/user')
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
            <CardHeader class="text-center">
                <div class="flex aspect-square size-20 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground mx-auto mb-5">
                    <LogoIcon class="size-10 fill-current text-white dark:text-black" />
                </div>
                <CardTitle>
                    {{ $t('Setup') }}
                </CardTitle>
                <CardDescription>
                    {{ $t('Let\'s get started with the setup process.') }}
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