// Works correctly
export {}

declare global {
    var imports: Record<string, any>
    var importAsync: (id: string) => Promise<any>
    var __INITIAL_STATE__: Record<string, any> | undefined
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t(key: string, ...args: any[]): string;
  }
}

