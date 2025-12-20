export default class El {
    public name: string
    public attrs: Map<string, string | undefined>
    public children: El[]
    public innerText: string | null = null

    constructor(name: string) {
        this.name = name
        this.attrs = new Map()
        this.children = []
    }

    public child(name: string): El {
        const child = new El(name)
        this.children.push(child)
        return child
    }

    public attr(key: string, value?: string) {
        this.attrs.set(key, value)

        return this
    }

    public text(value: string) {
        this.innerText = value

        return this
    }

    public html(value: string) {
        this.innerText = value

        return this
    }

    public toString() {        
        let output = `<${this.name}`


        for (const [key, value] of this.attrs.entries()) {
            if (value === undefined) {
                output += ` ${key}`
                continue
            }
            
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
