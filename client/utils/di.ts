import DIService from '#shared/services/di.service.ts'

const di = new DIService()

if (import.meta.env.DEV) {
    globalThis.di = di
}

export default di