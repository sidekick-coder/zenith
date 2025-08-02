const locales: Record<string, Record<string, string>> = { en: {} }

const current = 'en'

export function $t(key: string, args: any = {}): string {

    const entries = locales[current] || {}

    let translation = entries[key] || key

    if (Object.keys(args).length > 0) {
        Object.entries(args).forEach((e) => {
            const [argKey, argValue] = e as [string, string]
            translation = translation.replace(`:${argKey}`, argValue)
        })
    }

    return translation
}
