import config from './facades/config.facade.ts'
import { defineServerSetup } from '#server/utils/defineServerSetup.ts'

export default defineServerSetup(({ assets }) => {
    let vars = ''
    const branding = config.get('branding', {})

    for (const [key, value] of Object.entries(branding?.cssVars || {})) {
        vars += `--${key}: ${value};\n`
    }

    assets.set('branding', {
        content: `body {
            ${vars}
        }`
    })
})