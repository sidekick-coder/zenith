import { ref, watch, toValue, isRef, computed } from 'vue'
import type { Ref, MaybeRef } from 'vue'

export interface RGB {
    r: number
    g: number
    b: number
}

export interface HSL {
    h: number
    s: number
    l: number
}

export function extracRGB(color: string): RGB {
    const rgbMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/.exec(color)

    if (!rgbMatch) {
        throw new Error('Invalid RGB color format: ' + color)
    }    
    
    return {
        r: parseInt(rgbMatch[1]),
        g: parseInt(rgbMatch[2]),
        b: parseInt(rgbMatch[3])
    }
}

export function hexToRGB(hex: string): RGB {
    const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

    if (!hexMatch) {
        throw new Error('Invalid HEX color format: ' + hex)
    }

    return {
        r: parseInt(hexMatch[1], 16),
        g: parseInt(hexMatch[2], 16),
        b: parseInt(hexMatch[3], 16)
    }
}

export function hslToRgb(hsl: string): RGB {
    const hslMatch = /hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*[\d.]+)?\)/.exec(hsl)

    if (!hslMatch) {
        throw new Error('Invalid HSL color format: ' + hsl)
    }

    const h = parseInt(hslMatch[1]) / 360
    const s = parseInt(hslMatch[2]) / 100
    const l = parseInt(hslMatch[3]) / 100

    let r: number
    let g: number
    let b: number

    if (s === 0) {
        r = g = b = l
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q

        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2

    if (max === min) {
        return {
            h: 0,
            s: 0,
            l: Math.round(l * 100)
        }
    }

    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h = 0

    switch (max) {
    case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60
        break
    case g:
        h = ((b - r) / d + 2) * 60
        break
    case b:
        h = ((r - g) / d + 4) * 60
        break
    }

    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    }
}

export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
        const hex = n.toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function useColorType(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    
    return computed(() => {
        if (!color.value) {
            return null
        }
        // Determine color type logic here
        if (color.value.startsWith('#')) {
            return 'hex'
        }

        if (/^rgb/.test(color.value)) {
            return 'rgb'
        }

        if (/^hsla/.test(color.value)) {
            return 'hsla'
        }

        if (/^hsl/.test(color.value)) {
            return 'hsl'
        }

        return 'unknown'
    })
}

export function useRGB(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    
    const type = useColorType(color)

    return computed<RGB | null>({
        get() {
            if (!color.value) {
                return null
            }

            if (type.value === 'rgb') {
                return extracRGB(color.value)
            }

            if (type.value === 'hex' && color.value.length === 7) {
                return hexToRGB(color.value)
            }

            if (type.value === 'hsl') {
                return hslToRgb(color.value)
            }

            return null
        },
        set(){
            if (!color.value) {
                return
            }

            if (type.value === 'rgb') {
                const rgb = extracRGB(color.value)

                color.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
            }
        }
    })
}

export function useHSL(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    
    const type = useColorType(color)
    const rgb = useRGB(color)

    return computed<HSL | null>({
        get() {
            if (!rgb.value) {
                return null
            }

            return rgbToHsl(rgb.value.r, rgb.value.g, rgb.value.b)
        },
        set(value) {
            if (!value || !color.value) {
                return
            }

            if (type.value === 'hsl') {
                color.value = `hsl(${value.h}, ${value.s}%, ${value.l}%)`
                return
            }
            
            if (type.value === 'hsla') {
                color.value = `hsla(${value.h}, ${value.s}%, ${value.l}%)`
                return
            }

            if (type.value === 'hex') {
                const rgb = hslToRgb(`hsl(${value.h}, ${value.s}%, ${value.l}%)`)
                color.value = rgbToHex(rgb.r, rgb.g, rgb.b)
                return
            }

        }
    })
}

export function useHex(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))
    
    const type = useColorType(color)
    const rgb = useRGB(color)

    return computed<string | null>({
        get() {
            if (!rgb.value) {
                return null
            }

            return rgbToHex(rgb.value.r, rgb.value.g, rgb.value.b)
        },
        set(value) {
            if (!value) {
                return
            }

            if (type.value === 'hex') {
                color.value = value.startsWith('#') ? value : `#${value}`
                return
            }

        }
    })
}

export function useColor(payload?: MaybeRef<string | null | undefined>) {
    const color = isRef(payload) ? payload : ref<string | null | undefined>(toValue(payload))    
    const type = useColorType(color)
    const hex = useHex(color)
    const rgb = useRGB(color)
    const hsl = useHSL(color)    

    return {
        type,
        color,
        hex,
        rgb,
        hsl,
    }
}
