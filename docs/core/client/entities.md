# Client Entities

Client entities live in `client/entities/` and extend their [shared counterpart](/modules/shared/entities) with UI-specific logic — computed display properties, formatting helpers, or reactive state that only makes sense in the browser.

They never contain server-only dependencies and are safe to import in any Vue component.

## When to Create a Client Entity

In most cases the shared entity is already enough. Only reach for a client entity when you have logic that **truly belongs to the UI layer**, for example:

- Formatting a value for display (labels, colors, badges)
- Deriving state from multiple fields for a component
- Adding UI-only flags like `isExpanded` or `isSelected`

## Creating a Client Entity

Place the file in `client/entities/` using the naming convention `<name>.entity.ts`. Extend the shared entity directly:

```ts
import Base from '#shared/entities/user.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class User extends composeWith(Base) {
    public get displayName(): string {
        return `${this.name} (${this.username})`
    }
}
```

Since the shared entity already includes `BaseEntity`, the client entity inherits `from()` and `merge()` without any extra setup.

## Hydrating API Responses

Use the static `from()` method inherited from `BaseEntity` to turn a raw API response into a typed client entity instance:

```ts
import User from '#client/entities/user.entity.ts'

const response = await $fetch('/api/users/1')
const user = User.from(response)

console.log(user.displayName) // 'John Doe (johndoe)'
console.log(user.initials)    // 'JD' — inherited from the shared entity
```

## Using with Reactive State

Client entities work naturally with Vue's reactivity system. Wrap them in `ref` or `reactive` as needed:

```ts
import { ref } from 'vue'
import User from '#client/entities/user.entity.ts'

const user = ref<User | null>(null)

async function loadUser(id: number) {
    const response = await $fetch(`/api/users/${id}`)
    user.value = User.from(response)
}
```

For lists, hydrate each item using `Array.map`:

```ts
import User from '#client/entities/user.entity.ts'

const response = await $fetch('/api/users')
const users = response.map(User.from.bind(User))
```

## Adding Display Helpers

Keep formatting logic in the entity instead of scattering it across components:

```ts
// client/entities/job.entity.ts
import Base from '#shared/entities/job.entity.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Job extends composeWith(Base) {
    public get statusColor(): string {
        const map: Record<string, string> = {
            pending: 'yellow',
            running: 'blue',
            completed: 'green',
            failed: 'red',
        }

        return map[this.status] ?? 'gray'
    }

    public get formattedCreatedAt(): string {
        return new Date(this.created_at).toLocaleDateString()
    }
}
```

Components stay clean and reference only the entity property:

```vue
<Badge :color="job.statusColor">{{ job.status }}</Badge>
```
