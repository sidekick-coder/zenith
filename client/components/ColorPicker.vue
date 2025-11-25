<script setup lang="ts">
import { ref, computed } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '#client/components/ui/popover'
import { Input } from '#client/components/ui/input'
import TextField from '#client/components/TextField.vue'
import { cn } from '#client/lib/utils'

const props = defineProps({
    class: {
        type: String,
        required: false
    },
    label: {
        type: String,
        required: false
    },
    variant: {
        type: String,
        required: false
    },
    placeholder: {
        type: String,
        required: false
    },
    readonly: {
        type: Boolean,
        default: true
    }
})

const open = ref(false)
const color = defineModel({
    type: String,
    default: '#ff0000',
})

const hue = ref(0)
const saturation = ref(100)
const lightness = ref(50)

const updateFromHex = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    
    if (!result) {
        return
    }

    const r = parseInt(result[1], 16) / 255
    const g = parseInt(result[2], 16) / 255
    const b = parseInt(result[3], 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2

    if (max === min) {
        hue.value = 0
        saturation.value = 0
    }

    if (max !== min) {
        const d = max - min
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        saturation.value = s * 100

        switch (max) {
        case r:
            hue.value = ((g - b) / d + (g < b ? 6 : 0)) * 60
            break
        case g:
            hue.value = ((b - r) / d + 2) * 60
            break
        case b:
            hue.value = ((r - g) / d + 4) * 60
            break
        }
    }

    lightness.value = l * 100
}

const updateFromHSL = () => {
    const h = hue.value / 360
    const s = saturation.value / 100
    const l = lightness.value / 100

    let r: number
    let g: number
    let b: number

    if (s === 0) {
        r = g = b = l
    }

    if (s !== 0) {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) {
                t += 1
            }
            if (t > 1) {
                t -= 1
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t
            }
            if (t < 1 / 2) {
                return q
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6
            }
            return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q

        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }

    color.value = `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const handleHexInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    let value = target.value

    if (!value.startsWith('#')) {
        value = '#' + value
    }

    if (/^#[0-9A-F]{6}$/i.test(value)) {
        color.value = value
        updateFromHex(value)
    }
}

const presetColors = [
    '#000000',
    '#ffffff',
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
    '#64748b'
]

// Initialize HSL from current color
updateFromHex(color.value)
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
                <!-- Saturation/Lightness Picker -->
                <div class="relative w-full h-48 rounded-md overflow-hidden cursor-crosshair">
                    <div
                        class="absolute inset-0"
                        :style="{
                            background: `linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
                        }"
                    />
                    <div
                        class="absolute inset-0"
                        style="background: linear-gradient(to bottom, transparent, #000)"
                        @click="(e) => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                            saturation = ((e.clientX - rect.left) / rect.width) * 100
                            lightness = 100 - ((e.clientY - rect.top) / rect.height) * 100
                            updateFromHSL()
                        }"
                    >
                        <div
                            class="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            :style="{
                                left: `${saturation}%`,
                                top: `${100 - lightness}%`
                            }"
                        />
                    </div>
                </div>

                <!-- Hue Slider -->
                <div class="space-y-2">
                    <label class="text-sm font-medium">Hue</label>
                    <div class="relative h-3 rounded-md overflow-hidden cursor-pointer">
                        <div
                            class="absolute inset-0"
                            style="background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)"
                            @click="(e) => {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                                hue = ((e.clientX - rect.left) / rect.width) * 360
                                updateFromHSL()
                            }"
                        >
                            <div
                                class="absolute w-1 h-full bg-white shadow-lg -translate-x-1/2 pointer-events-none"
                                :style="{ left: `${(hue / 360) * 100}%` }"
                            />
                        </div>
                    </div>
                </div>

                <!-- Hex Input -->
                <div class="space-y-2">
                    <label class="text-sm font-medium">Hex</label>
                    <Input
                        :model-value="color"
                        class="uppercase font-mono"
                        placeholder="#000000"
                        @input="handleHexInput"
                    />
                </div>

                <!-- Preset Colors -->
                <div class="space-y-2">
                    <label class="text-sm font-medium">Presets</label>
                    <div class="grid grid-cols-10 gap-2">
                        <button
                            v-for="preset in presetColors"
                            :key="preset"
                            type="button"
                            class="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                            :style="{ backgroundColor: preset }"
                            @click="() => {
                                color = preset
                                updateFromHex(preset)
                            }"
                        />
                    </div>
                </div>
            </div>
        </PopoverContent>
    </Popover>
</template>
