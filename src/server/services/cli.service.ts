import { printTable, printObject } from '@sidekick-coder/zenith-kit/server'

interface TableColumn {
    label: string
    value: string | ((item: any) => string)
    width?: number
    realWidth?: number
}

interface ObjectOptions {
    keyWidth?: number
}

export class UI {
    public object(output: any = {}, options: ObjectOptions = {}) {
        printObject(output, options)
    }

    public table(items: any[], columns?: TableColumn[]) {
        printTable(items, columns)
    }

    
}

type Capability = 'config' 
    | 'db' 
    | 'drive' 
    | 'encrypt' 
    | 'emmitter' 
    | 'modules'
    | 'all'

export class CLIService {
    public ui: UI

    constructor() {
        this.ui = new UI()
    }

    public with(capabilities: Capability | Capability[], fn: (...args: any[]) => Promise<any>) {
        let caps = Array.isArray(capabilities) ? capabilities : [capabilities]

        if (caps.includes('all')) {
            caps = [
                'config', 
                'db',
                'drive',
                'encrypt',
                'emmitter',
                'modules'
            ]
        }

        return async (...args: any[]) => {
            try {
                if (caps.includes('config')) {
                    await import('@sidekick-coder/zenith-kit/server/facades/config')
                }

                if (caps.includes('db')) {
                    await import('#server/facades/db.facade.ts')
                }

                if (caps.includes('drive')) {
                    await import('#server/facades/drive.facade.ts')
                }

                if (caps.includes('encrypt')) {
                    await import('#server/facades/encrypt.facade.ts')
                }

                if (caps.includes('emmitter')) {
                    await import('#server/facades/emmitter.facade.ts')
                }

                if (caps.includes('modules')) {
                    await import('#server/facades/modules.facade.ts')
                }

                await fn(...args)

                if (caps.includes('db')) {
                    await import('#server/facades/db.facade.ts')
                }

                process.exit(0)

            } catch (error) {

                if (caps.includes('db')) {
                    await import('#server/facades/db.facade.ts')
                }
                
                console.error(error)
                process.exit(1)
            }
        }

    }
}

const cli = new CLIService()

export default cli
