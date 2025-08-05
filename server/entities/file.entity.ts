export default class FileEntity {
    public filename: string
    public mimetype: string

    constructor(data: FileEntity) {
        Object.assign(this, data)
    }
}
