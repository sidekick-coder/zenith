<script lang="ts" setup>
import { ZButton, Card, CardHeader, CardFooter, CardTitle, CardDescription } from '@sidekick-coder/zenith-kit/components'
import { useRoute } from 'vue-router'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'

const route = useRoute()

const pluginId = route.params.pluginId as string
</script>
<template>
    <form
        class="space-y-4 py-2"
    >
        <div class="flex-1">
            <PageTitle>{{ $t('Update plugin') }}</PageTitle>
            <PageSubtitle>
                {{ $t('Update plugin') }}
            </PageSubtitle>
        </div>
        <div class="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {{ $t('Remote repository') }}
                    </CardTitle>
                    <CardDescription>
                        {{ $t('Update plugin from git remote repository') }}
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <ZButton
                        type="submit"
                        :to="`/admin/plugins/${pluginId}/update-git`"
                    >
                        {{ $t('Update') }}
                    </ZButton>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>
                        {{ $t('Bundle') }}
                    </CardTitle>
                    <CardDescription>
                        {{ $t('Update plugin from bundle file') }}
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <ZButton
                        type="submit"
                        :to="`/admin/plugins/${pluginId}/update-bundle`"
                    >
                        {{ $t('Update') }}
                    </ZButton>
                </CardFooter>
            </Card>
        </div>
    </form>
</template>
