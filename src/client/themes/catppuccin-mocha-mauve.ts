import { defineTheme } from '#client/composables/defineTheme.ts'
import mocha from './catppuccin-mocha.ts'

export default defineTheme({
    ...mocha.light,
    primary: '#cba6f7',
    ring: '#cba6f7',
    'chart-1': '#cba6f7',
    'sidebar-primary': '#cba6f7',
})
