import { readdirSync } from 'fs'
import { join } from 'path'
import { defineConfig } from 'vitepress'

function getMarkdownFiles(folder: string) {
    const docsPath = join(__dirname, '..', folder)
    const files = readdirSync(docsPath)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const name = file.replace('.md', '')
            const text = name.charAt(0).toUpperCase() + name.slice(1)
            return {
                text: text.replace(/-/g, ' '),
                link: `/${folder}/${name}`
            }
        })
        .sort((a, b) => a.text.localeCompare(b.text))
  
    return files
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'Zenith',
    description: 'A CMS to conquer it all',
    locales: {
        root: {
            label: 'English',
            lang: 'en',
            themeConfig: {
                nav: [
                    { 
                        text: 'Home',
                        link: '/' 
                    },
                    { 
                        text: 'Installation',
                        link: '/installation/docker' 
                    },
                    { 
                        text: 'Server',
                        link: '/server/setup' 
                    },
                    { 
                        text: 'Client',
                        link: '/client/setup' 
                    },
                ],
                sidebar: [
                    {
                        text: 'Installation',
                        items: getMarkdownFiles('installation'),
                    },
                    {
                        text: 'Server',
                        items: getMarkdownFiles('server'),
                    },
                    {
                        text: 'Client',
                        items: getMarkdownFiles('client'),
                    },
                ],
            }
        },

        'pt-BR': {
            label: 'Português (Brasil)',
            lang: 'pt-BR',
            themeConfig: {
                nav: [
                    { text: 'Início',
                        link: '/pt-BR/' },
                ],
                sidebar: [
                    {
                        text: 'Introdução',
                        items: getMarkdownFiles('pt-BR'),
                    },
                ],
            }
        },
    },

    themeConfig: {
        socialLinks: [
            { 
                icon: 'github',
                link: 'https://github.com/sidekick-coder/zenith' 
            }
        ]
    }
})
