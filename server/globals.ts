import type TranslatorService from './services/translator.service.ts'

// Works correctly
export {}

declare global {
    var $t: TranslatorService['t']
}