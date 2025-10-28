import config from './facades/config.facade.ts'
import LongJob from './jobs/long.job.ts'
import { defineServerSetup } from '#server/utils/defineServerSetup.ts'

export default defineServerSetup(async ({ assets }) => {
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