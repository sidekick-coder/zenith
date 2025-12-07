export class El {
    public name: string
    private attrs: Map<string, string>
    private children: El[]
    private innerText: string | null = null

    constructor(name: string) {
        this.name = name
        this.attrs = new Map()
        this.children = []
    }

    public toString() {
        let output = `<${this.name}`

        for (const [key, value] of this.attrs.entries()) {
            output += ` ${key}="${value}"`
        }

        output += '>'

        if (this.innerText) {
            output += this.innerText
        }

        if (!this.innerText) {
            for (const child of this.children) {
                output += child.toString()
            }
        }

        output += `</${this.name}>`
        
        return output
    }
}
