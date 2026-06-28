<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import DashboardDrawer from './DashboardDrawer.vue'
import DashboardGridUnitInput from './DashboardGridUnitInput.vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '#client/components/ui/dropdown-menu'

import { useDashboard } from '#client/composables/useDashboard.ts'
import type DashboardWidget from '#client/entities/DashboardWidget.ts'

const emit = defineEmits(['remove', 'duplicate'])

const widget = defineModel<DashboardWidget>({ default: () => ({}) })

const dashboard = useDashboard()
const styles = ref()
const layout = ref(false)

function loadStyles() {
    styles.value = widget.value.computeStyles({ contianerWidth: dashboard.value.containerWidth ?? 0, })
}

onMounted(loadStyles)

widget.value.emmitter.on('widget:updated', loadStyles)

// --- title editing ---
const editing = ref(false)
const inputRef = ref<HTMLInputElement>()

async function startEdit() {
    editing.value = true
    await nextTick()
    if (!inputRef.value) return
    inputRef.value.value = widget.value.name || 'Widget'
    inputRef.value.focus()
    inputRef.value.select()
}

function commitEdit(e: Event) {
    widget.value = {
        ...widget.value,
        name: (e.target as HTMLInputElement).value
    }
    editing.value = false
}

function cancelEdit() {
    editing.value = false
}

// --- size dialog ---
const sizeOpen = ref(false)

const breakpoints = ['base', 'sm', 'md', 'lg', 'xl'] as const

// --- height dialog ---

const heightOpen = ref(false)
const heightDraft = ref<Widget['height']>({})

function openHeight() {
    heightDraft.value = { ...widget.value.height }
    heightOpen.value = true
}

function createOptions(from: number, to: number) {
    const options = []

    for (let i = from; i <= to; i++) {
        options.push({
            label: i.toString(),
            value: i
        })
    }

    return options
}
</script>

<template>
    <div 
        :style="styles"
        class="p-2"
    >
        <div
            class="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm h-full overflow-hidden"
        >
            <div class="flex items-center gap-2 border-b px-4 py-3">
                <input
                    v-if="editing"
                    ref="inputRef"
                    placeholder="Widget"
                    class="flex-1 bg-transparent text-sm font-medium outline-none"
                    @keydown.enter="commitEdit"
                    @keydown.esc="cancelEdit"
                    @blur="commitEdit"
                >
                <span
                    v-else
                    class="flex-1 text-sm font-medium"
                    @click="startEdit"
                >
                    {{ widget.name || $t('Widget') }}
                </span>

                <Button
                    variant="ghost"
                    size="icon"
                    class="h-7 w-7"
                    @click="layout = true"
                >
                    <Icon name="LayoutGrid" />
                </Button>


                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="h-7 w-7"
                        >
                            <Icon name="EllipsisVertical" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <slot name="options" />
                        <DropdownMenuItem @click="emit('duplicate')">
                            <Icon name="Copy" />
                            {{ $t('Duplicate') }}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            class="text-destructive focus:text-destructive"
                            @click="emit('remove')"
                        >
                            <Icon name="Trash" />
                            {{ $t('Remove') }}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div class="flex-1 p-4">
                <slot />
            </div>
        </div>
    </div>

    <DashboardDrawer
        v-model:open="layout"
        :title="$t('Layout')"
    >
        <div class="px-4 py-3">
            <DashboardGridUnitInput
                v-model="widget.x"
                :label="$t('Position X')"
                :options="createOptions(0, 11)"
            />

            <DashboardGridUnitInput
                v-model="widget.y"
                :label="$t('Position Y')"
                :options="createOptions(0, 10)"
                custom
            />

            <DashboardGridUnitInput
                v-model="widget.columns"
                :label="$t('Columns')"
                :options="createOptions(1, 12)"
                filled
            />

            <DashboardGridUnitInput
                v-model="widget.rows"
                :label="$t('Rows')"
                :options="createOptions(1, 10)"
                filled
                custom
            />
        </div>
    </DashboardDrawer>
</template>
