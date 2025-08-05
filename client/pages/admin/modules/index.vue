<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from '#client/components/Button.vue'
import Dashboard from '#client/layouts/AppLayout.vue'

import Card from '#client/components/ui/card/Card.vue'
import CardDescription from '#client/components/ui/card/CardDescription.vue'
import CardFooter from '#client/components/ui/card/CardFooter.vue'
import CardHeader from '#client/components/ui/card/CardHeader.vue'
import CardTitle from '#client/components/ui/card/CardTitle.vue'
import Switch from '#client/components/ui/switch/Switch.vue'

import { $t } from '#shared/lang.ts'
import { $fetch } from '#client/utils/fetcher'
import { tryCatch } from '#shared/tryCatch.ts'
import Dialog from '#client/components/ui/dialog/Dialog.vue'
import DialogContent from '#client/components/ui/dialog/DialogContent.vue'
import DialogHeader from '#client/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '#client/components/ui/dialog/DialogTitle.vue'
import DialogDescription from '#client/components/ui/dialog/DialogDescription.vue'
import Icon from '#client/components/Icon.vue'

const items = ref<any[]>([])

async function load() {
    const response = await fetch('/api/modules', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', },
    })

    const json = await response.json()

    items.value = json
}

onMounted(load)

const toggling = ref(false)

async function toggle(item: any) {
    toggling.value = true

    // Prevent full reload in development mode
    if (import.meta.hot) {
        import.meta.hot.on('vite:beforeFullReload', () => {
            throw '(skipping full reload)'
        })
        import.meta.hot.on('vite:beforeUpdate', () => {
            throw '(skipping full reload)'
        })
    }

    const [error] = await tryCatch(() => $fetch(`/api/modules/${item.id}/toggle`, { method: 'POST', }))

    if (error) {
        console.error('Failed to toggle module:', item.name)
        console.error(error)
        toggling.value = false
        return
    }

    setTimeout(() => {
        toggling.value = false
        window.location.reload()
    }, 1000)

}

</script>
<template>
    <Dashboard>
        <Dialog :open="toggling">
            <DialogContent
                class="sm:max-w-[425px]"
                hide-close
            >
                <DialogHeader>
                    <DialogTitle>{{ $t('Updating module status') }}</DialogTitle>
                    <DialogDescription>
                        {{ $t('Please wait while the module status is being updated.') }}
                    </DialogDescription>
                </DialogHeader>
                <div class="flex items-center justify-center">
                    <Icon
                        name="LoaderCircle"
                        class="size-10 animate-spin text-gray-500"
                    />
                </div>
            </DialogContent>
        </Dialog>

        <div class="flex flex-wrap gap-4">
            <Card
                v-for="(item, index) in items"
                :key="index"
                class="w-full lg:w-3/12 xl:w-2/12"
            >
                <CardHeader class="mb-auto">
                    <CardTitle>
                        {{ item.name }}
                    </CardTitle>
                    <CardDescription>
                        {{ item.description || $t('No description available') }}
                    </CardDescription>
                </CardHeader>

                <CardFooter class="flex justify-end gap-2">
                    <Button :to="`/admin/modules/${item.id}`">
                        {{ $t('Configure') }}
                    </Button>
                    <div class="flex-1" />
                    <Switch
                        :model-value="item.enabled"
                        @click="toggle(item)"
                    />
                </CardFooter>
            </Card>
        </div>
    </Dashboard>
</template>
