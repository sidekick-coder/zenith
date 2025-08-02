import bcrypt from 'bcrypt'

export default class HashService {
    public static readonly DI_KEY = 'hasher'
    private readonly saltRounds = 12

    public hash(value: string): Promise<string> {
        return bcrypt.hash(value, this.saltRounds)
    }

    async compare(a: string, b: string): Promise<boolean> {
        return bcrypt.compare(a, b)
    }
}
