import { defineTheme } from '@sidekick-coder/zenith-kit/client'
import mocha from './catppuccin-mocha.ts'

export default defineTheme({
    ...mocha.light,
    primary: '#f5c2e7',
    ring: '#f5c2e7',
    'chart-1': '#f5c2e7',
    'sidebar-primary': '#f5c2e7',
})
