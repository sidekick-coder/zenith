export default class Meta {
    public name: string
    public value: string | null

    constructor(data: Meta){
        Object.assign(this, data)
    }
}