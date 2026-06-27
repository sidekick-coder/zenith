<script setup lang="ts">
import { nextTick, ref } from 'vue'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '#client/components/ui/dropdown-menu'

const widget = defineModel<{ name?: string }>({ default: () => ({}) })

const emit = defineEmits(['remove'])

const editing = ref(false)
const inputRef = ref<HTMLInputElement>()

async function startEdit() {
    editing.value = true
    await nextTick()
    if (!inputRef.value) return 

    inputRef.value.value = widget.value.name || 'Widget'
    // inputRef.value.setSelectionRange(0, inputRef.value?.value.length || 0)
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
</script>

<template>
    <div class="bg-card text-card-foreground flex flex-col rounded-xl border shadow-sm">
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
</template>
