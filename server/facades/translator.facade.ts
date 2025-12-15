import di from './di.facade.ts'
import TranslatorService from '#server/services/translator.service.ts'

const translator = di.proxy<TranslatorService>(TranslatorService)

export const $t: TranslatorService['t'] = (key, args = {}) => {
    return translator.t(key, args)
}

export default translator