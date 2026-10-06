import { defineTheme } from '@sidekick-coder/zenith-kit/client'
import mocha from './catppuccin-mocha.ts'

export default defineTheme({
    ...mocha.light,
    primary: '#94e2d5',
    ring: '#94e2d5',
    'chart-1': '#94e2d5',
    'sidebar-primary': '#94e2d5',
})
