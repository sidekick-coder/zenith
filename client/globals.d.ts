// Works correctly
export {}

declare global {
    var imports: Record<string, any>
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t(key: string, ...args: any[]): string;
  }
}

