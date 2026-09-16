import defaultTheme from '../themes/default.css?inline'
import dracula from '../themes/dracula.css?inline'
import catppuccin from '../themes/catppuccin.css?inline'
import nord from '../themes/nord.css?inline'
import tokyoNight from '../themes/tokyo-night.css?inline'
import rosePine from '../themes/rose-pine.css?inline'
import solarized from '../themes/solarized.css?inline'
import kanagawa from '../themes/kanagawa.css?inline'
import everforest from '../themes/everforest.css?inline'
import cyberpunk from '../themes/cyberpunk.css?inline'
import synthwave from '../themes/synthwave.css?inline'
import ocean from '../themes/ocean.css?inline'

interface Theme {
    id: string 
    image?: string
    css: string 
}

const themes: Theme[] = [
    {
        id: 'default',
        image: '/images/theme-default.png',
        css: defaultTheme
    },
    {
        id: 'dracula',
        image: '/images/theme-dracula.png',
        css: dracula
    },
    {
        id: 'catppuccin',
        css: catppuccin,
    },
    {
        id: 'nord',
        css: nord,
    },
    {
        id: 'tokyo-night',
        css: tokyoNight,
    },
    {
        id: 'rose-pine',
        css: rosePine,
    },
    {
        id: 'solarized',
        css: solarized,
    },
    {
        id: 'kanagawa',
        css: kanagawa,
    },
    {
        id: 'everforest',
        css: everforest,
    },
    {
        id: 'cyberpunk',
        css: cyberpunk,
    },
    {
        id: 'synthwave',
        css: synthwave,
    },
    {
        id: 'ocean',
        css: ocean,
    }
]

export function useThemes() {
    return themes 
}
