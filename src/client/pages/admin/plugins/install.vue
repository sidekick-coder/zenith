<script lang="ts" setup>
import { ZButton, Card, CardHeader, CardFooter, CardContent, CardTitle, CardDescription } from '@sidekick-coder/zenith-kit/components'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'
</script>
<template>
    <form
        class="space-y-4 py-2"
        @submit.prevent="onSubmit"
    >
        <div class="flex-1">
            <PageTitle>{{ $t('Install plugin') }}</PageTitle>
            <PageSubtitle>
                {{ $t('Instlal new plugin') }}
            </PageSubtitle>
        </div>
        <div class="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {{ $t('Remote repository') }}
                    </CardTitle>
                    <CardDescription>
                        {{ $t('Install plugin from git remote repository') }}
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <ZButton
                        type="submit"
                        to="/admin/plugins/install-git"
                    >
                        {{ $t('Install') }}
                    </ZButton>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {{ $t('Bundle') }}
                    </CardTitle>
                    <CardDescription>
                        {{ $t('Install plugin from bundle file') }}
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <ZButton
                        type="submit"
                        to="/admin/plugins/install-bundle"
                    >
                        {{ $t('Install') }}
                    </ZButton>
                </CardFooter>
            </Card>
        </div>
    </form>
</template>
