<script setup lang="ts">
import { ref, computed } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '#client/components/ui/popover'
import { Input } from '#client/components/ui/input'
import TextField from '#client/components/TextField.vue'
import ColorWheel from '#client/components/ColorWheel.vue'
import { useColor, useHex, useRGB, useHSL   } from '#client/composables/useColor'
import type { RGB, HSL } from '#client/composables/useColor'

const props = defineProps({
    class: {
        type: String,
        default: null
    },
    label: {
        type: String,
        default: null
    },
    variant: {
        type: String,
        default: null
    },
    placeholder: {
        type: String,
        default: null
    },
    readonly: {
        type: Boolean,
        default: true
    },
    presets: {
        type: Array as () => string[],
        default: () => [
            '#ef4444',
            '#f97316',
            '#f59e0b',
            '#eab308',
            '#84cc16',
            '#22c55e',
            '#10b981',
            '#14b8a6',
            '#06b6d4',
            '#0ea5e9',
            '#3b82f6',
            '#6366f1',
            '#8b5cf6',
            '#a855f7',
            '#d946ef',
            '#ec4899',
            '#f43f5e',
            '#64748b',
            '#000000',
            '#ffffff'
        ]
    }
})

const open = ref(false)
const color = defineModel({
    type: String,
    default: '#ff0000',
})

const format = ref<'hex' | 'rgb' | 'hsl'>('hex')
const { hex, rgb, hsl } = useColor(color)

const colorInput = computed({
    get() {
        if (format.value === 'hex') {
            return hex.value
        }
        
        if (format.value === 'rgb' && rgb.value) {
            return `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`
        }
        
        if (format.value === 'hsl' && hsl.value) {
            return `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`
        }
        
        return ''
    },
    set(value: string | null) {
        if (!value) {
            return
        }
        
        color.value = value
    }
})

const cycleFormat = () => {
    if (format.value === 'hex') {
        format.value = 'rgb'
        return
    }
    
    if (format.value === 'rgb') {
        format.value = 'hsl'
        return
    }
    
    format.value = 'hex'
}

</script>

<template>
    <Popover v-model:open="open">
        <PopoverTrigger as-child>
            <slot
                name="activator"
                :color="color"
                :open="open"
            >
                <TextField
                    v-model="color"
                    :label="label"
                    :variant="variant"
                    :placeholder="placeholder"
                    :readonly="readonly"
                    :class="props.class"
                    class="cursor-pointer"
                    input-class="text-left rounded-l-none"
                >
                    <template #prepend>
                        <div
                            class="size-10 border rounded-l shrink-0"
                            :style="{ backgroundColor: color }"
                        />
                    </template>
                </TextField>
            </slot>
        </PopoverTrigger>

        <PopoverContent
            class="w-72 p-4"
            align="start"
        >
            <div class="space-y-4">
                <ColorWheel v-model="color" />

                <!-- Color Format Input -->
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label class="text-sm font-medium">Color</label>
                        <button
                            type="button"
                            class="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 font-medium uppercase"
                            @click="cycleFormat"
                        >
                            {{ format }}
                        </button>
                    </div>
                    <Input
                        :model-value="colorInput"
                        :class="{ 'uppercase': format === 'hex' }"
                        class="font-mono"
                        :placeholder="format === 'hex' ? '#000000' : format === 'rgb' ? 'rgb(0, 0, 0)' : 'hsl(0, 0%, 0%)'"
                        @change="(e: any) => {
                            colorInput = e.target.value
                        }"
                    />
                </div>

                <!-- Preset Colors -->
                <div class="space-y-2">
                    <label class="text-sm font-medium">Presets</label>
                    <div class="grid grid-cols-10 gap-2">
                        <button
                            v-for="preset in presets"
                            :key="preset"
                            type="button"
                            class="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                            :style="{ backgroundColor: preset }"
                            @click="() => {
                                color = preset
                            }"
                        />
                    </div>
                </div>
            </div>
        </PopoverContent>
    </Popover>
</template>
