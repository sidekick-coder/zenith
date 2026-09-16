import { container, config } from '@sidekick-coder/zenith-kit/client'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { ResolvableHead } from '@unhead/vue'
import kitCss from '@sidekick-coder/zenith-kit/styles.css?inline'
import css from '../assets/styles.css?inline'
import { useThemes } from '#client/composables/useThemes.ts'
import { useFonts } from '#client/composables/useFonts.ts'
import { useRadii } from '#client/composables/useRadii.ts'

export default class extends LifecycleHook {
    public async register() {
        if (!import.meta.env.SSR) return
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


        const themes = useThemes()
        const fonts = useFonts()
        const radii = useRadii()

        const themeId = config.get('branding.theme', 'default')
        const fontId = config.get('branding.fontFamily', 'inter')
        const radiusId = config.get('branding.radius', 'md')

        const currentTheme = themes.find(theme => theme.id === themeId)
        const currentFont = fonts.find(font => font.id === fontId) || fonts.find(font => font.id === 'inter')!
        const currentRadius = radii.find(radius => radius.id === radiusId || radius.value === radiusId)
            || radii.find(radius => radius.id === 'md')!

        if (currentTheme) {
            style.push({
                id: `theme-${currentTheme.id}`,
                innerHTML: currentTheme.css,
            })
        }

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

}
