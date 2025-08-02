import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export function basePath(...args: string[]): string {
    const root = path.resolve(__dirname, '..');

    return path.join(root, ...args);
}

export function configPath(...args: string[]): string {
    return basePath('config', ...args);
}
