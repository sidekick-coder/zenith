export default class DriveConfig {
    public id: string
    public name: string
    public driver: string
    public config: Record<string, any>

    constructor(data: DriveConfig){
        Object.assign(this, data)
    }
}