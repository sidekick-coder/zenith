<script setup lang="ts">
import { TextField, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sidekick-coder/zenith-kit/components'

defineOptions({ inheritAttrs: false, })

defineProps({
    plugin: {
        type: Object,
        required: true,
    },
})

</script>

<template>
    <div class="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>
                    {{ $t('Details') }}
                </CardTitle>
                <CardDescription>
                    {{ $t('Plugin general information') }}
                </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
                <TextField
                    :label="$t('ID')"
                    :model-value="plugin.id"
                    :readonly="true"
                />
                <TextField
                    :label="$t('Name')"
                    :model-value="plugin.name"
                    :readonly="true"
                />
                <TextField
                    :label="$t('Version')"
                    :model-value="plugin.version || '-'"
                    :readonly="true"
                />
                <TextField
                    :label="$t('Directory')"
                    :model-value="plugin.directory"
                    :readonly="true"
                />
                <TextField
                    :label="$t('Status')"
                    :model-value="plugin.enabled ? $t('Enabled') : $t('Disabled')"
                    :readonly="true"
                />
            </CardContent>
        </Card>
    </div>
</template>
