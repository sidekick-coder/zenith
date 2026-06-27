<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
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

export interface Widget {
    name?: string
    order?: number
    cols?: { base?: number, sm?: number, md?: number, lg?: number, xl?: number }
    height?: { base?: string, sm?: string, md?: string, lg?: string, xl?: string }
}

import { useDashboard } from '#client/composables/useDashboard.ts'

const widget = defineModel<Widget>({ default: () => ({}) })

const props = defineProps({
    index: {
        type: Number,
        required: true,
    },
})

const emit = defineEmits(['remove', 'duplicate'])

const dashboard = useDashboard()

// --- col-span classes ---
const colSpanMap: Record<string, string[]> = {
    base: ['','col-span-1','col-span-2','col-span-3','col-span-4','col-span-5','col-span-6','col-span-7','col-span-8','col-span-9','col-span-10','col-span-11','col-span-12'],
    sm:   ['','sm:col-span-1','sm:col-span-2','sm:col-span-3','sm:col-span-4','sm:col-span-5','sm:col-span-6','sm:col-span-7','sm:col-span-8','sm:col-span-9','sm:col-span-10','sm:col-span-11','sm:col-span-12'],
    md:   ['','md:col-span-1','md:col-span-2','md:col-span-3','md:col-span-4','md:col-span-5','md:col-span-6','md:col-span-7','md:col-span-8','md:col-span-9','md:col-span-10','md:col-span-11','md:col-span-12'],
    lg:   ['','lg:col-span-1','lg:col-span-2','lg:col-span-3','lg:col-span-4','lg:col-span-5','lg:col-span-6','lg:col-span-7','lg:col-span-8','lg:col-span-9','lg:col-span-10','lg:col-span-11','lg:col-span-12'],
    xl:   ['','xl:col-span-1','xl:col-span-2','xl:col-span-3','xl:col-span-4','xl:col-span-5','xl:col-span-6','xl:col-span-7','xl:col-span-8','xl:col-span-9','xl:col-span-10','xl:col-span-11','xl:col-span-12'],
}

const colClasses = computed(() =>
    Object.entries(widget.value.cols || {})
        .filter(([, v]) => v && v >= 1 && v <= 12)
        .map(([bp, v]) => colSpanMap[bp]?.[v as number] ?? '')
        .filter(Boolean)
)

const heightStyle = computed(() => {
    const h = widget.value.height?.base
    return h ? { height: h } : {}
})

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

function setCol(bp: string, value: number) {
    colsDraft.value = {
        ...colsDraft.value,
        [bp]: value 
    }
}

function clearCol(bp: string) {
    const updated = { ...colsDraft.value }
    delete updated[bp as keyof typeof updated]
    colsDraft.value = updated
}

function commitSize() {
    widget.value = { ...widget.value, cols: colsDraft.value }
    sizeOpen.value = false
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
    heightDraft.value = { ...heightDraft.value, [bp]: value }
}

function clearHeight(bp: string) {
    const updated = { ...heightDraft.value }
    delete updated[bp as keyof typeof updated]
    heightDraft.value = updated
}

function commitHeight() {
    widget.value = { ...widget.value, height: heightDraft.value }
    heightOpen.value = false
}
</script>

<template>
    <div
        class="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm"
        :class="colClasses"
        :style="heightStyle"
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
                            :title="$t('Clear')"
                            :class="[
                                'h-8 w-8 shrink-0 rounded-sm border text-xs transition-colors',
                                !colsDraft?.[bp]
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-muted hover:bg-muted-foreground/20',
                            ]"
                            @click="clearCol(bp)"
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
                            :title="`${col}`"
                            :class="[
                                'h-8 flex-1 rounded-sm border text-xs transition-colors',
                                col <= (colsDraft?.[bp] ?? 0)
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-muted hover:bg-muted-foreground/20',
                            ]"
                            @click="setCol(bp, col)"
                        >
                            {{ col }}
                        </button>
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button
                    variant="outline"
                    @click="sizeOpen = false"
                >
                    {{ $t('Cancel') }}
                </Button>
                <Button @click="commitSize">
                    {{ $t('Save') }}
                </Button>
            </DialogFooter>
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
                            :title="$t('Clear')"
                            :class="[
                                'h-8 w-8 shrink-0 rounded-sm border text-xs transition-colors',
                                !heightDraft?.[bp]
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-muted hover:bg-muted-foreground/20',
                            ]"
                            @click="clearHeight(bp)"
                        >
                            <Icon
                                name="X"
                                class="mx-auto size-3"
                            />
                        </button>
                        <button
                            v-for="preset in heightPresets"
                            :key="preset"
                            type="button"
                            :class="[
                                'h-8 rounded-sm border px-3 text-xs transition-colors',
                                heightDraft?.[bp] === preset
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-muted hover:bg-muted-foreground/20',
                            ]"
                            @click="setHeight(bp, preset)"
                        >
                            {{ preset }}
                        </button>
                        <input
                            :value="heightDraft?.[bp] && !heightPresets.includes(heightDraft[bp]!) ? heightDraft[bp] : ''"
                            type="text"
                            :placeholder="$t('Custom')"
                            class="h-8 w-24 rounded-sm border border-border bg-muted px-2 text-xs outline-none focus:border-primary"
                            @input="(e) => setHeight(bp, (e.target as HTMLInputElement).value)"
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
