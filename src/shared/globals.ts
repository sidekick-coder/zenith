import type TranslatorService from './services/translator.service.ts'

// Works correctly
export {}

declare global {
    var $translator: TranslatorService
    var $t: TranslatorService['t']
    var $d: TranslatorService['date']
    var $dt: TranslatorService['datetime']
}