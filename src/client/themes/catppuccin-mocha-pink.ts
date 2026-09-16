import { defineTheme } from '#client/composables/defineTheme.ts'
import mocha from './catppuccin-mocha.ts'

export default defineTheme({
    ...mocha.light,
    primary: '#f5c2e7',
    ring: '#f5c2e7',
    'chart-1': '#f5c2e7',
    'sidebar-primary': '#f5c2e7',
})
