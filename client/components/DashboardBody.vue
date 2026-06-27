<script setup lang="ts">
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import DashboardWidget from '#client/components/DashboardWidget.vue'
import type { Widget } from '#client/components/DashboardWidget.vue'

const props = defineProps({
    widgets: {
        type: Array as () => Widget[],
        required: false,
        default: () => []
    }
})

const emit = defineEmits(['add-widget', 'update:widgets'])

function removeWidget(index: number) {
    emit('update:widgets', props.widgets.filter((_, i) => i !== index))
}

function duplicateWidget(index: number) {
    const copy = JSON.parse(JSON.stringify(props.widgets[index]))
    const updated = [...props.widgets]
    updated.splice(index + 1, 0, copy)
    emit('update:widgets', updated)
}
</script>

<template>
    <div>
        <div
            v-if="widgets.length"
            class="grid grid-cols-12 gap-4 items-baseline"
        >
            <DashboardWidget
                v-for="(widget, index) in widgets"
                :key="index"
                :model-value="widget"
                @update:model-value="(v) => emit('update:widgets', widgets.map((w, i) => i === index ? v : w))"
                @duplicate="duplicateWidget(index)"
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
