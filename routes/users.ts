import router from "../services/router.service.ts"

router.get('/users', () => {
    // Simulate fetching users from a database
    const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
    ]
    
    return users
})
