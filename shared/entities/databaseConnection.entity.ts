export default class DatabaseConnection {
    public id: string
    public active: boolean

    constructor(data: DatabaseConnection){
        Object.assign(this, data)
    }
}