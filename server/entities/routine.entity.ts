import { Job } from 'node-schedule'

export default class Routine {
    public id: string
    public cron: string
    public handler: Function
    public data: Record<string, any>
    public job?: Job

    constructor(data: Routine){
        Object.assign(this, data)
    }
}