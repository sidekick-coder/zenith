import bcrypt from 'bcrypt'

export default class HashService {
    public hash(value: string): Promise<string> {
        return bcrypt.hash(value, 12)
    }

    async compare(a: string, b: string): Promise<boolean> {
        return bcrypt.compare(a, b)
    }
}
