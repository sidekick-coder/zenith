# Encrypt 

This is a simple service to handle encryption and decryption of data. It uses the `crypto` module of Node.js to encrypt and decrypt data.

It uses a key from config `app.key`


```ts
import { encrypt } from '@sidekick-coder/zenith-kit/server'

const encrypted = encrypt.encrypt("Hello World")

const decrypted = encrypt.decrypt(encrypted)
```
