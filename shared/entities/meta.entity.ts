export default class Meta {
    public name: string
    public value: string | null

    constructor(data: Meta){
        Object.assign(this, data)
    }

    public static metasToObjects(args: Meta[]){
        const result = {} as Record<string, any>

        args.forEach(m => {
            result[m.name] = m.value
        })

        return result
    }
}