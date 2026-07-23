# Hasher 

This service is used to hash data, it uses the `bycrypt` module of Node.js to hash data. It is useful for hashing passwords and other sensitive data.


```ts
import { hasher } from '@sidekick-coder/zenith-kit/server'

const password = "my-password"

const hashedPassword = await hasher.hash(password)

const isMatch = await hasher.compare(password, hashedPassword)
```
