import fs from 'fs'

export async function importAll(directory: string): Promise<Record<string, any>> {
    const files = fs.readdirSync(directory, { withFileTypes: true })

    const modules = {}

    for (const file of files) {
        if (file.isFile()) {
            modules[file.name] = await import(`${directory}/${file.name}`)
        }
    }

    return modules
}
