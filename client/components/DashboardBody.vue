<script setup lang="ts">
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import DashboardWidget from '#client/components/DashboardWidget.vue'

const props = defineProps({
    widgets: {
        type: Array as () => any[],
        required: false,
        default: () => []
    }
})

const emit = defineEmits(['add-widget', 'update:widgets'])

function removeWidget(index: number) {
    const updated = props.widgets.filter((_, i) => i !== index)
    emit('update:widgets', updated)
}
</script>

<template>
    <div>
        <div
            v-if="widgets.length"
            class="grid grid-cols-3 gap-4"
        >
            <DashboardWidget
                v-for="(widget, index) in widgets"
                :key="index"
                :model-value="widget"
                class="h-48"
                @update:model-value="(v) => emit('update:widgets', widgets.map((w, i) => i === index ? v : w))"
                @remove="removeWidget(index)"
            />
        </div>

        <div
            v-else
            class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-20 text-center"
        >
            <Icon
                name="LayoutDashboard"
                class="mb-3 size-12 text-muted-foreground"
            />
            <p class="mb-4 text-sm text-muted-foreground">
                {{ $t('No widgets added yet') }}
            </p>
            <Button
                type="button"
                variant="outline"
                @click="emit('add-widget')"
            >
                <Icon name="Plus" />
                {{ $t('Add widget') }}
            </Button>
        </div>
    </div>
</template>
