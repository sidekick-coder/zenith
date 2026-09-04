import ArteService from './arte.service.ts'
import di from '#server/facades/di.facade.ts'

export default class ArteTesterService extends ArteService {
    constructor() {
        super() 

        this.exitOverride()

        this.configureOutput({
            writeOut: () => {
                // Suppress command output during tests
            },
            writeErr: () => {
                // Suppress error output during tests
            },
        })

        di.set(ArteService, this)

        return
    }

    public async add(path: string) {
        await import(path)
    }

    public async execute(args: string[]) {
        await this.parseAsync(['node', 'arte', ...args])
    }
}
