import { container, config, themeToCss } from '@sidekick-coder/zenith-kit/client'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { ResolvableHead } from '@unhead/vue'
import kitCss from '@sidekick-coder/zenith-kit/styles.css?inline'
import css from '../assets/styles.css?inline'
import { useThemes } from '#client/composables/useThemes.ts'
import { useFonts } from '#client/composables/useFonts.ts'
import { useRadii } from '#client/composables/useRadii.ts'

export default class extends LifecycleHook {
    public registerTheme() {
        const themes = useThemes()
        const themeId = config.get('branding.theme', 'default')

        let theme = themes.find(theme => theme.id === themeId)

        if (!theme) {
            theme = themes.find(theme => theme.id === 'default')!
        }

        container.set('theme', theme)

        if (!import.meta.env.SSR) return

        const head = container.get<ResolvableHead[]>('head')

        head.push({
            style: [{
                id: 'theme',
                innerHTML: themeToCss(theme),
                title: theme.id,
            }],
        })
    }

    public async registerAdminCss() {
        const head = container.get<ResolvableHead[]>('head')

        const style: ResolvableHead['style'] = []

        style.push({
            id: 'zenith-kit',
            innerHTML: kitCss,
        })

        style.push({
            id: 'admin',
            innerHTML: css,
        })

        const fonts = useFonts()
        const radii = useRadii()

        const fontId = config.get('branding.fontFamily', 'inter')
        const radiusId = config.get('branding.radius', 'md')

        const currentFont = fonts.find(font => font.id === fontId) || fonts.find(font => font.id === 'inter')!
        const currentRadius = radii.find(radius => radius.id === radiusId || radius.value === radiusId)
            || radii.find(radius => radius.id === 'md')!


        style.push({
            id: 'branding-preferences',
            innerHTML: `:root { --radius: ${currentRadius.value}; --font-sans: ${currentFont.family}; }`,
        })

        head.push({
            style,
            link: [{
                rel: 'stylesheet',
                href: currentFont.url,
            }],
        })
    }


    public async register() {
        if (import.meta.env.SSR) {
            this.registerAdminCss()
        }

        this.registerTheme()

    }

}
