import { Router } from 'express'

export const router = Router()

router.get('/users', (_req, res) => {
    // Simulate fetching users from a database
    const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
    ]
    
    res.json(users)
})
