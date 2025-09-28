import { BaseEntity, SoftDelete, Timestamp } from '#shared/mixins/index.ts'
import { compose } from '#shared/utils/compose.ts'

export default class User extends compose(BaseEntity, Timestamp, SoftDelete) {  
    public id: number
    public email: string
    public name: string
    public username: string

    public get initials(){
        const [firstName, secondName] = this.name.split(' ')

        if (!secondName) {
            return firstName[0].toUpperCase()
        }

        const a = firstName[0].toUpperCase()
        const b = secondName[0].toUpperCase()

        return a + b
    }
}