# Shell 

This is a wrapper around the `child_process` module of Node.js, that allows you to run shell commands in a more convenient way and it is integrated with app features like logging and error handling.


```ts
import { shell } from '@sidekick-coder/zenith-kit/server'

await shell.command('git', ["pull", "origin", "HEAD"], {
    cwd: "/home/user/plugins/my-plugin",
})
```
