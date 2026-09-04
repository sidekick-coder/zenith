<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import * as v from 'valibot'
import { toTypedSchema } from '@vee-validate/valibot'
import { toast } from 'vue-sonner'
import { $fetch } from '#client/utils/fetcher.ts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#client/components/ui/card'
import FormTextarea from '#client/components/FormTextarea.vue'
import Button from '#client/components/Button.vue'

const props = defineProps({
    module: {
        type: Object,
        required: true,
    },
})

interface GitRepoInfo {
    remotes: string[]
}

const remotes = ref<string[]>([])
const loadingRemotes = ref(false)

const schema = v.object({ ssh_key: v.nullable(v.string()), })

const { handleSubmit, resetForm } = useForm({
    name: 'module-git-config',
    validationSchema: toTypedSchema(schema),
    initialValues: { ssh_key: null as string | null, },
})

async function loadGitInfo() {
    loadingRemotes.value = true

    const [, data] = await $fetch.try(`/api/modules/${props.module.id}/git-info`)

    if (data && typeof data === 'object' && 'remotes' in data) {
        remotes.value = (data as GitRepoInfo).remotes
    }

    loadingRemotes.value = false
}

async function loadGitConfig() {
    const [, data] = await $fetch.try(`/api/modules/${props.module.id}/git-config`)

    if (data && typeof data === 'object') {
        resetForm({ values: { ssh_key: (data as any).ssh_key ?? null, }, })
    }
}

const onSubmit = handleSubmit(async (data) => {
    const [error] = await $fetch.try(`/api/modules/${props.module.id}/git-config`, {
        method: 'PUT',
        data,
    })

    if (error) return

    toast.success($t('Git configuration saved'))
})

onMounted(async () => {
    await Promise.all([loadGitInfo(), loadGitConfig()])
})
</script>

<template>
    <div class="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>{{ $t('Remotes') }}</CardTitle>
                <CardDescription>{{ $t('Configured git remotes for this module') }}</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    v-if="loadingRemotes"
                    class="text-sm text-muted-foreground"
                >
                    {{ $t('Loading...') }}
                </div>
                <div
                    v-else-if="remotes.length === 0"
                    class="text-sm text-muted-foreground"
                >
                    {{ $t('No remotes configured') }}
                </div>
                <ul
                    v-else
                    class="flex flex-col gap-2"
                >
                    <li
                        v-for="remote in remotes"
                        :key="remote"
                        class="font-mono text-sm px-3 py-2 rounded-md bg-muted"
                    >
                        {{ remote }}
                    </li>
                </ul>
            </CardContent>
        </Card>

        <form @submit.prevent="onSubmit">
            <Card>
                <CardHeader>
                    <CardTitle>{{ $t('SSH Key') }}</CardTitle>
                    <CardDescription>{{ $t('Path to the SSH private key used for git operations on this module') }}</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <FormTextarea
                        name="ssh_key"
                        :label="$t('SSH Key Path')"
                        :hint="$t('Optional: Path to the SSH private key file (e.g. /home/user/.ssh/id_rsa)')"
                        :rows="3"
                    />
                    <div class="flex justify-end">
                        <Button type="submit">
                            {{ $t('Save') }}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    </div>
</template>
