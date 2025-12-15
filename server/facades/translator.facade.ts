import TranslatorService from '#server/services/translator.service.ts'

const translator = new TranslatorService()

export const $t: TranslatorService['t'] = (key, args = {}) => {
    return translator.t(key, args)
}

export default translator