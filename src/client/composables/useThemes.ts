import defaultTheme from '../themes/default.css?inline'
import dracula from '../themes/dracula.css?inline'

interface Theme {
    id: string 
    image: string
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
    }
]

export function useThemes() {
    return themes 
}
