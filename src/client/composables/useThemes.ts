import type { Theme } from './defineTheme.ts'

export interface ThemeDefinition extends Theme {
    id: string
}

const files = import.meta.glob<ThemeDefinition>('../themes/*.ts', {
    eager: true,
    import: 'default' 
})

const themes: ThemeDefinition[] = []

Object.entries(files).forEach(([path, module]) => {
    const themeId = path.split('/').pop()
        ?.replace('.ts', '') || 'default'

    themes.push({
        ...module,
        id: themeId,
    })
})

// make default be first in the list
themes.sort((a, b) => {
    if (a.id === 'default') return -1
    if (b.id === 'default') return 1
    return 0
})

export function useThemes() {
    return themes 
}
