# Logger

Logs are managed by a `LoggerService` that show logs in the console and also save them in a `logs/app.log` file.

To use the logger, you can inject it into your service or controller like this:

```ts
import { logger } from '@sidekick-coder/zenith-kit/server'

logger.info('This is an info message')
```

## Info 
The `info` method is used to log informational messages.

```ts 
logger.info('This is an info message')
```

## Warn 
The `warn` method is used to log warning messages.

```ts 
logger.warn('This is a warning message')
```

## Error 
The `error` method is used to log error messages.

```ts
logger.error('This is an error message')

logger.error(new Error('Something went wrong')

logger.error('An error occurred', new Error('Something went wrong'))
```

## Debug 
The `debug` method is used to log debug messages.

Theses messages are only logged when the `ZENITH_LOG_LEVEL` environment variable is set to `debug`.

```ts
logger.debug('This is a debug message')
```
