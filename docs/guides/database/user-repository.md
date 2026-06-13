# User repository 

The `userRepository` is a facade that is an instace of the `UserRepository` class. It provides a simplified interface for accessing user data and performing operations related to users.

```ts
import { userRepository } from '@sidekick-coder/zenith-kit/server';

const users = await userRepository.findMany();
```

## Filters 

The `userRepository` supports various filters that can be used to query user data. Some of the available filters include:
- `id: number | number[]`: Filter users by their unique identifier(s).
- `email: string`: Filter users by their email address(es).
- `username: string`: Filter users by their name(s).
- `showDeleted: boolean`: Include deleted users in the results when set to `true`.
