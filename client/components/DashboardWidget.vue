<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '#client/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '#client/components/ui/dialog'

import { useDashboard } from '#client/composables/useDashboard.ts'
import type DashboardWidget from '#client/entities/DashboardWidget.ts'

const widget = defineModel<DashboardWidget>({ default: () => ({}) })

const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
})

const emit = defineEmits(['remove', 'duplicate'])

const dashboard = useDashboard()

const styles = ref()

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
const colsDraft = ref<Widget['cols']>({})

const breakpoints = ['base', 'sm', 'md', 'lg', 'xl'] as const

function openSize() {
    colsDraft.value = { ...widget.value.cols }
    sizeOpen.value = true
}

// --- height dialog ---
const heightPresets = ['auto', '150px', '250px', '400px', '600px']

const heightOpen = ref(false)
const heightDraft = ref<Widget['height']>({})

function openHeight() {
    heightDraft.value = { ...widget.value.height }
    heightOpen.value = true
}

function setHeight(bp: string, value: string) {
    heightDraft.value = {
        ...heightDraft.value,
        [bp]: value
    }
}

function clearHeight(bp: string) {
    const updated = { ...heightDraft.value }
    delete updated[bp as keyof typeof updated]
    heightDraft.value = updated
}

function commitHeight() {
    widget.value = {
        ...widget.value,
        height: heightDraft.value
    }
    heightOpen.value = false
}
</script>

<template>
    <div
        class="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm"
        :style="styles"
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
                    <DropdownMenuItem
                        :disabled="props.index === 0"
                        @click="dashboard?.moveUp(props.index)"
                    >
                        <Icon name="ArrowUp" />
                        {{ $t('Move up') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        :disabled="props.index === (dashboard?.widgets.length ?? 1) - 1"
                        @click="dashboard?.moveDown(props.index)"
                    >
                        <Icon name="ArrowDown" />
                        {{ $t('Move down') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="emit('duplicate')">
                        <Icon name="Copy" />
                        {{ $t('Duplicate') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="openSize">
                        <Icon name="LayoutGrid" />
                        {{ $t('Columns') }}
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="openHeight">
                        <Icon name="ArrowUpDown" />
                        {{ $t('Height') }}
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

    <Dialog v-model:open="sizeOpen">
        <DialogContent class="max-w-lg">
            <DialogHeader>
                <DialogTitle>{{ $t('Columns') }}</DialogTitle>
            </DialogHeader>

            <div class="space-y-5 py-2">
                <div
                    v-for="bp in breakpoints"
                    :key="bp"
                >
                    <p class="mb-2 text-xs font-medium uppercase text-muted-foreground">
                        {{ bp }}
                    </p>
                    <div class="flex gap-1">
                        <button
                            v-if="bp !== 'base'"
                            type="button"
                            :class="[
                                'h-8 w-8 shrink-0 rounded-sm border text-xs transition-colors',
                                !widget.columns[bp]
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-muted hover:bg-muted-foreground/20',
                            ]"
                            @click="widget.setColumn(bp)"
                        >
                            <Icon
                                name="X"
                                class="mx-auto size-3"
                            />
                        </button>
                        <button
                            v-for="col in 12"
                            :key="col"
                            type="button"
                            :class="[
                                'h-8 flex-1 rounded-sm border text-xs transition-colors',
                                col <= (widget.columns[bp] ?? 0)
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-muted hover:bg-muted-foreground/20',
                            ]"
                            @click="widget.setColumn(bp, col)"
                        >
                            {{ col }}
                        </button>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>

    <Dialog v-model:open="heightOpen">
        <DialogContent class="max-w-lg">
            <DialogHeader>
                <DialogTitle>{{ $t('Height') }}</DialogTitle>
            </DialogHeader>

            <div class="space-y-5 py-2">
                <div
                    v-for="bp in breakpoints"
                    :key="bp"
                >
                    <p class="mb-2 text-xs font-medium uppercase text-muted-foreground">
                        {{ bp }}
                    </p>
                    <div class="flex flex-wrap gap-1">
                        <button
                            v-if="bp !== 'base'"
                            type="button"
                            :class="[
                                'h-8 w-8 shrink-0 rounded-sm border text-xs transition-colors',
                                !widget.rows[bp]
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-muted hover:bg-muted-foreground/20',
                            ]"
                            @click="widget.setRow(bp)"
                        >
                            <Icon
                                name="X"
                                class="mx-auto size-3"
                            />
                        </button>
                        <button
                            v-for="r in 10"
                            :key="r"
                            type="button"
                            :class="[
                                'h-8 rounded-sm border px-3 text-xs transition-colors',
                                (widget.rows[bp] || 0) >= r
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-muted hover:bg-muted-foreground/20',
                            ]"
                            @click="widget.setRow(bp, r)"
                        >
                            {{ r }}
                        </button>
                        <input
                            :value="widget.rows[bp]"
                            type="number"
                            class="h-8 w-12 rounded-sm border border-border bg-muted px-2 text-xs outline-none focus:border-primary"
                            @input="(e) => widget.setRow(bp, Number((e.target as HTMLInputElement).value))"
                        >
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button
                    variant="outline"
                    @click="heightOpen = false"
                >
                    {{ $t('Cancel') }}
                </Button>
                <Button @click="commitHeight">
                    {{ $t('Save') }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
