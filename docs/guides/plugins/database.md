# Database

For database interactions you can use the `database` facade, that is an instance of Kysely, a type-safe SQL query builder for TypeScript.

[Kysely documentation](https://kysely.dev/)

```ts 
import { database } from '@sidekick-coder/zenith-kit/server'

const orders = await database
    .selectFrom('orders')
    .selectAll()
    .execute()
```

## DatabaseContract 

Kysely works using a `Database` interface that defines the structure of the database. 

The framework already defines a `DatabaseContract` interface that contains the default tables of the system.

But you can extend this interface to add your own tables and columns using the `DatabaseContract` interface provided by Zenith Kit.

```ts
import { DatabaseContract } from '@sidekick-coder/zenith-kit/server'

interface OrdersTable {
    id: number
    user_id: number
    total: number
}

declare module '@sidekick-coder/zenith-kit/server' {
    export interface DatabaseContract {
        orders: OrdersTable
    }
}
```

