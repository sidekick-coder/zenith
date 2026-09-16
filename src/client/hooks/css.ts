import { container, config } from '@sidekick-coder/zenith-kit/client'
import { LifecycleHook } from '@sidekick-coder/zenith-kit/shared'
import { ResolvableHead } from '@unhead/vue'
import kitCss from '@sidekick-coder/zenith-kit/styles.css?inline'
import css from '../assets/styles.css?inline'
import { useThemes } from '#client/composables/useThemes.ts'

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

        const themeId = config.get('branding.theme', 'default')

        const currentTheme = themes.find(theme => theme.id === themeId)

        if (currentTheme) {
            style.push({
                id: `theme-${currentTheme.id}`,
                innerHTML: currentTheme.css,
            })
        }



        head.push({ style: style })
    }

}
