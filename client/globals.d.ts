import type ConfigService from '#shared/services/config.service.ts'
import type DIService from '#shared/services/di.service.ts'

// Works correctly
export {}

declare global {
    var imports: Record<string, any>
    var importAsync: (id: string) => Promise<any>
    var __CONFIG__: any | undefined
    var __CONTAINER__: Record<string, any> | undefined
    var __STATE__: Record<string, any> | undefined
    var config: ConfigService | undefined // only on dev
    var di: DIService | undefined // only on dev
    var $t: (key: string, ...args: any[]) => string
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t(key: string, ...args: any[]): string;
  }
}

