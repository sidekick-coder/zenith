export default class Routine {
    public id: string
    public cron: string
    public handler: Function
    public data: Record<string, any>

    constructor(data: Routine){
        Object.assign(this, data)
    }
}