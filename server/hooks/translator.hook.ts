import translator from '#server/facades/translator.facade.ts'
import LifecycleHook from '#shared/entities/lifecycleHook.entity.ts'

export default class TrasnlatorLifecycleHook extends LifecycleHook {
    public async onRegister(): Promise<void> {
        translator.discover()

        translator.load('pt-BR')
        
        globalThis.$t = translator.t.bind(translator)
    }
}