import { defineTheme } from '#client/composables/defineTheme.ts'
import mocha from './catppuccin-mocha.ts'

export default defineTheme({
    ...mocha.light,
    primary: '#89dceb',
    ring: '#89dceb',
    'chart-1': '#89dceb',
    'sidebar-primary': '#89dceb',
})
