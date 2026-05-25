import type { tryCatch } from '@sidekick-coder/zenith-kit/shared'
import type TranslatorService from './services/translator.service.ts'

// Works correctly
export {}

declare global {
    var $t: TranslatorService['t']
    var $try: typeof tryCatch
}
