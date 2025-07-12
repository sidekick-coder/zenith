const locales: Record<string, Record<string, string>> = {
    en: {

    }
}

const current = 'en';


export function $t(key: string, ...args: any[]): string {

    const entries = locales[current] || {};

    let translation = entries[key] || key;

    if (args.length > 0) {
        translation = translation.replace(/{(\d+)}/g, (match, index) => {
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }

    return translation;
}
