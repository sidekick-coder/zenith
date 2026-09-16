import type { Theme } from './defineTheme.ts'
import defaultTheme from '../themes/default.ts'
import dracula from '../themes/dracula.ts'
import catppuccin from '../themes/catppuccin.ts'
import nord from '../themes/nord.ts'
import tokyoNight from '../themes/tokyo-night.ts'
import rosePine from '../themes/rose-pine.ts'
import solarized from '../themes/solarized.ts'
import kanagawa from '../themes/kanagawa.ts'
import everforest from '../themes/everforest.ts'
import cyberpunk from '../themes/cyberpunk.ts'
import synthwave from '../themes/synthwave.ts'
import ocean from '../themes/ocean.ts'

export interface ThemeDefinition extends Theme {
    id: string
}

const themes: ThemeDefinition[] = [
    {
        id: 'default',
        ...defaultTheme,
    },
    {
        id: 'dracula',
        ...dracula,
    },
    {
        id: 'catppuccin',
        ...catppuccin,
    },
    {
        id: 'nord',
        ...nord,
    },
    {
        id: 'tokyo-night',
        ...tokyoNight,
    },
    {
        id: 'rose-pine',
        ...rosePine,
    },
    {
        id: 'solarized',
        ...solarized,
    },
    {
        id: 'kanagawa',
        ...kanagawa,
    },
    {
        id: 'everforest',
        ...everforest,
    },
    {
        id: 'cyberpunk',
        ...cyberpunk,
    },
    {
        id: 'synthwave',
        ...synthwave,
    },
    {
        id: 'ocean',
        ...ocean,
    }
]

export function useThemes() {
    return themes 
}
