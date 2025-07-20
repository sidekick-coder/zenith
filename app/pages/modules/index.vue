<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Button from '#app/components/Button.vue'
import Dashboard from '#app/layouts/Dashboard.vue'

import Card from '#app/components/ui/card/Card.vue'
import CardDescription from '#app/components/ui/card/CardDescription.vue'
import CardFooter from '#app/components/ui/card/CardFooter.vue'
import CardHeader from '#app/components/ui/card/CardHeader.vue'
import CardTitle from '#app/components/ui/card/CardTitle.vue'
import Switch from '#app/components/ui/switch/Switch.vue'

import { $t } from '#app/utils/lang'
import { $fetch } from '#app/utils/fetcher'
import { tryCatch } from '#common/tryCatch'
import Dialog from '#app/components/ui/dialog/Dialog.vue'
import DialogContent from '#app/components/ui/dialog/DialogContent.vue'
import DialogHeader from '#app/components/ui/dialog/DialogHeader.vue'
import DialogTitle from '#app/components/ui/dialog/DialogTitle.vue'
import DialogDescription from '#app/components/ui/dialog/DialogDescription.vue'
import Icon from '#app/components/Icon.vue'

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
                    <Button :to="`/modules/${item.id}`">
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
