export interface Font {
    id: string
    name: string
    family: string
    url: string
}

const fonts: Font[] = [
    {
        id: 'roboto',
        name: 'Roboto',
        family: '"Roboto", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap',
    },
    {
        id: 'inter',
        name: 'Inter',
        family: '"Inter", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
    {
        id: 'open-sans',
        name: 'Open Sans',
        family: '"Open Sans", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap',
    },
    {
        id: 'jetbrains-mono',
        name: 'JetBrains Mono',
        family: '"JetBrains Mono", monospace',
        url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    },
    {
        id: 'poppins',
        name: 'Poppins',
        family: '"Poppins", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
    },
    {
        id: 'montserrat',
        name: 'Montserrat',
        family: '"Montserrat", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
    },
    {
        id: 'lato',
        name: 'Lato',
        family: '"Lato", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap',
    },
    {
        id: 'nunito',
        name: 'Nunito',
        family: '"Nunito", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap',
    },
    {
        id: 'source-sans-3',
        name: 'Source Sans 3',
        family: '"Source Sans 3", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&display=swap',
    },
    {
        id: 'merriweather',
        name: 'Merriweather',
        family: '"Merriweather", serif',
        url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700;900&display=swap',
    },
    {
        id: 'playfair-display',
        name: 'Playfair Display',
        family: '"Playfair Display", serif',
        url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
    },
    {
        id: 'dm-sans',
        name: 'DM Sans',
        family: '"DM Sans", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
    },
    {
        id: 'manrope',
        name: 'Manrope',
        family: '"Manrope", sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
    },
    {
        id: 'fira-code',
        name: 'Fira Code',
        family: '"Fira Code", monospace',
        url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap',
    },
]

export function useFonts() {
    return fonts
}
