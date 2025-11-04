// Works correctly
export {}

declare global {
    var imports: Record<string, any>
    var importAsync: (id: string) => Promise<any>
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t(key: string, ...args: any[]): string;
  }
}

