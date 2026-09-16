export type ThemeColors = Record<string, string>

export interface Theme {
    light: ThemeColors
    dark: ThemeColors
}

export function defineTheme(light: ThemeColors = {}, dark: ThemeColors = light): Theme {
    return {
        light,
        dark 
    }
}

function cssVariables(colors: ThemeColors) {
    return Object.entries(colors)
        .map(([name, value]) => `--${name}: ${value};`)
        .join('\n')
}

export function themeToCss(theme: Theme) {
    return `:root {\n${cssVariables(theme.light)}\n}\n\n.dark {\n${cssVariables(theme.dark)}\n}`
}
