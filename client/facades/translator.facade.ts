import di from '#client/utils/di.ts'
import TranslatorService from '#shared/services/translator.service.ts'

const translator = di.proxy<TranslatorService>(TranslatorService)

export const $t: TranslatorService['t'] = (key, args = {}) => {
    return translator.t(key, args)
}

export default translator