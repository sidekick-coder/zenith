# Client Entities

Client entities live in `mymodule/client/entities/` and extend their [shared counterpart](/modules/shared/entities) with UI-specific logic — computed display properties, formatting helpers, or reactive state that only makes sense in the browser.

They never contain server-only dependencies and are safe to import in any Vue component.

## When to Create a Client Entity

In most cases the shared entity is already enough. Only reach for a client entity when you have logic that **truly belongs to the UI layer**, for example:

- Formatting a value for display (labels, colors, badges)
- Deriving state from multiple fields for a component
- Adding UI-only flags like `isExpanded` or `isSelected`

## Creating a Client Entity

Place the file in `mymodule/client/entities/` using the naming convention `<name>.entity.ts`. Extend the shared entity directly:

```ts
// mymodule/client/entities/item.entity.ts
import Base from '#mymodule/shared/entities/item.entity.ts'
import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'

export default class Item extends composeWith(Base) {
    public get displayName(): string {
        return `[${this.id}] ${this.name}`
    }
}
```

Since the shared entity already includes `BaseEntity`, the client entity inherits `from()` and `merge()` without any extra setup.

## Hydrating API Responses

Use the static `from()` method inherited from `BaseEntity` to turn a raw API response into a typed client entity instance:

```ts
import Item from '#mymodule/client/entities/item.entity.ts'

const response = await $fetch('/api/mymodule/items/1')
const item = Item.from(response)

console.log(item.displayName) // '[1] My Item'
console.log(item.created_at)  // inherited from the shared entity
```

## Using with Reactive State

Client entities work naturally with Vue's reactivity system. Wrap them in `ref` or `reactive` as needed:

```ts
import { ref } from 'vue'
import Item from '#mymodule/client/entities/item.entity.ts'

const item = ref<Item | null>(null)

async function loadItem(id: number) {
    const response = await $fetch(`/api/mymodule/items/${id}`)
    item.value = Item.from(response)
}
```

For lists, hydrate each item using `Array.map`:

```ts
import Item from '#mymodule/client/entities/item.entity.ts'

const response = await $fetch('/api/mymodule/items')
const items = response.map(Item.from.bind(Item))
```

## Adding Display Helpers

Keep formatting logic in the entity instead of scattering it across components:

```ts
// mymodule/client/entities/item.entity.ts
import Base from '#mymodule/shared/entities/item.entity.ts'
import { composeWith } from '@sidekick-coder/zenith-kit/shared/utils/compose'

export default class Item extends composeWith(Base) {
    public get statusColor(): string {
        const map: Record<string, string> = {
            pending: 'yellow',
            active: 'green',
            archived: 'gray',
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
<Badge :color="item.statusColor">{{ item.status }}</Badge>
```
