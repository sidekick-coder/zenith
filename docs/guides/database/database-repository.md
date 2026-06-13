# Database repository 

The `DatabaseRepository` is a class that receives a kyseley database and expose common database operations for a specific table. It is designed to be extended and customized for different tables and use cases.

## Simple usage

The simple way to use the `DatabaseRepository` is to create an instance of it by passing the database and the name of the table you want to access. For example, if you have an `orders` table in your database, you can create a repository for it like this:

```ts
import { DatabaseRepository, database } from '@sidekick-coder/zenith-kit/server';

interface Order {
    id: number;
    user_id: number;
    total: number;
}

const orderRepository = new DatabaseRepository<Order, number>(database, 'orders', 'id');

const orders = await orderRepository.findMany();
```

You will have the basic CRUD operations available on the `orderRepository` instance, such as `findMany`, `findOne`, `create`, `update`, and `delete`. but without any filters or custom logic.

## Custom repository 

To have custom filters you can extend the class and modify the query method, this method is used internally by the other methods to build the query

```ts
import { DatabaseRepository, database } from '@sidekick-coder/zenith-kit/server';

interface Order {
    id: number;
    user_id: number;
    total: number;
}

interface OrderFilters {
    userId?: number;
    minTotal?: number;
    maxTotal?: number;
}

class OrderRepository extends DatabaseRepository<Order, number, OrderFilters> {
    constructor() {
        super(database, 'orders', 'id');
    }

    async query(filters: OrderFilters) {
        let qb = super.query();

        if (filters.userId) {
            qb = query.where('user_id', filters.userId);
        }

        if (filters.minTotal) {
            qb = query.where('total', '>=', filters.minTotal);
        }

        if (filters.maxTotal) {
            qb = query.where('total', '<=', filters.maxTotal);
        }

        return await query.select();
    }
}
````
This enable to to use the methods with the custom filters you defined in the `OrderFilters` interface, for example:

```ts
await orderRepository.findMany({ userId: 1, minTotal: 100 });

await orderRepository.findOne({ minTotal: 100 });

await orderRepository.deleteMany({ maxTotal: 50 });
```

## query

Builds the base query used by all read operations.

```ts
query(options?: { qb?: any } & TOptions)
```

Returns a Kysely query builder instance.

```ts
public query(options?: TOptions) {
    let qb = super.query(options)

    if (options?.active !== undefined) {
        qb = qb.where('active', '=', options.active)
    }

    return qb
}
```

## count

Returns the total number of matching records.

```ts
count(options?: TOptions): Promise<number>
```

```ts
const total = await repository.count()
```

## findMany

Returns multiple records.

```ts
findMany(options?: FindManyOptions & TOptions): Promise<TEntity[]>
```

Supported options:

```ts
{
    limit?: number
    offset?: number
    orderBy?: string | string[]
    orderDirection?: 'asc' | 'desc' | ('asc' | 'desc')[]
}
```

```ts
const users = await repository.findMany({
    limit: 10,
    offset: 0,
    orderBy: 'name',
    orderDirection: 'asc'
})
```

## findOne

Returns the first matching record.

```ts
findOne(options?: TOptions): Promise<TEntity | null>
```

```ts
const user = await repository.findOne()
```

## findById

Finds a record by primary key.

```ts
findById(
    id: TPrimaryKey,
    options?: TOptions
): Promise<TEntity | null>
```

```ts
const user = await repository.findById(1)
```

## findByIdOrFail

Finds a record by primary key.

Throws `BaseException(404)` if not found.

```ts
findByIdOrFail(
    id: TPrimaryKey,
    options?: TOptions
): Promise<TEntity>
```

```ts
const user = await repository.findByIdOrFail(1)
```

## paginate

Returns paginated results.

```ts
paginate(
    options?: PaginateOptions & TOptions
): Promise<Pagination<TEntity>>
```

Supported options:

```ts
{
    page?: number
    limit?: number
    orderBy?: string | string[]
    orderDirection?: 'asc' | 'desc' | ('asc' | 'desc')[]
}
```

```ts
const result = await repository.paginate({
    page: 1,
    limit: 20
})
```

Response:

```ts
{
    items: TEntity[],
    page: number,
    per_page: number,
    total: number,
    total_pages: number
}
```

## create

Creates a new record.

Automatically sets `created_at` when `autoCreatedAt` is enabled.

```ts
create(data: Partial<TEntity>): Promise<TEntity>
```

Hook flow:

```text
beforeCreate -> insert -> afterCreate
```

```ts
const user = await repository.create({
    name: 'John'
})
```

## createMany

Creates multiple records.

Automatically sets `created_at` when `autoCreatedAt` is enabled.

```ts
createMany(
    data: Partial<TEntity>[]
): Promise<TEntity[]>
```

Hook flow:

```text
beforeCreateMany -> insert -> afterCreateMany
```

```ts
await repository.createMany([
    { name: 'John' },
    { name: 'Jane' }
])
```

## updateById

Updates a record by primary key.

Automatically sets `updated_at` when `autoUpdatedAt` is enabled.

Throws `BaseException(404)` if the record does not exist.

```ts
updateById(
    id: TPrimaryKey,
    data: Partial<TEntity>
): Promise<void>
```

Hook flow:

```text
beforeUpdate -> update -> afterUpdate
```

```ts
await repository.updateById(1, {
    name: 'Updated Name'
})
```

## deleteById

Deletes a record by primary key.

Throws `BaseException(404)` if the record does not exist.

```ts
deleteById(id: TPrimaryKey): Promise<void>
```

Hook flow:

```text
beforeDelete -> delete -> afterDelete
```

```ts
await repository.deleteById(1)
```

## deleteMany

Deletes multiple records using filters defined in `query()`.

```ts
deleteMany(
    options?: DeleteManyOptions & TOptions
): Promise<void>
```

Supported options:

```ts
{
    limit?: number
}
```

Hook flow:

```text
beforeDeleteMany -> delete -> afterDeleteMany
```

```ts
await repository.deleteMany({
    limit: 100
})
```

## beforeCreate

Executed before creating a record.

```ts
protected beforeCreate(
    data: Partial<TEntity>
): Promise<Partial<TEntity>>
```

## afterCreate

Executed after creating a record.

```ts
protected afterCreate(
    data: TEntity
): Promise<void>
```

## beforeCreateMany

Executed before creating multiple records.

```ts
protected beforeCreateMany(
    data: Partial<TEntity>[]
): Promise<Partial<TEntity>[]>
```

## afterCreateMany

Executed after creating multiple records.

```ts
protected afterCreateMany(
    data: TEntity[]
): Promise<TEntity[]>
```

## beforeUpdate

Executed before updating a record.

```ts
protected beforeUpdate(
    data: Partial<TEntity>,
    id: TPrimaryKey
): Promise<Partial<TEntity>>
```

## afterUpdate

Executed after updating a record.

```ts
protected afterUpdate(
    data: TEntity
): Promise<TEntity>
```

## beforeDelete

Executed before deleting a record.

```ts
protected beforeDelete(
    id: TPrimaryKey
): Promise<void>
```

## afterDelete

Executed after deleting a record.

```ts
protected afterDelete(
    id: TPrimaryKey
): Promise<void>
```

## beforeDeleteMany

Executed before deleting multiple records.

```ts
protected beforeDeleteMany(
    options?: DeleteManyOptions & TOptions
)
```

## afterDeleteMany

Executed after deleting multiple records.

```ts
protected afterDeleteMany(
    options?: DeleteManyOptions & TOptions
): Promise<void> | void
```
