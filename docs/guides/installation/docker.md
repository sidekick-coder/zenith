# Docker 

There are multiple ways to use the framework with docker that will change depending of your setup and plugins you will use

> This is only for production

## Volumes (recommended)

The most basic way is using volumes, this will persist your data in local files

> This will show a setup wizard to configure the app on the first run

```yml
services:
    app:
        image: sidekickcoder/zenith:latest
        ports:
            - 3000:3000
        volumes:
            - .volumes/app/plugins:/app/plugins
            - .volumes/app/config:/app/config
            - .volumes/app/storage:/app/storage
```

## Stateless 

This is a way to run the app without any local files, useful for simple setups like with `zenith-backup`, where you can define backups directly via config and run they without needing to access the dashboard

```yaml 
services:
    backup:
        image: sidekickcoder/zenith:latest
        restart: unless-stopped
    command:
         # download plugin
        - "@config:plugins.downloads[0].repository=https://github.com/sidekick-coder/zenith-backup.git"
        - "@config:plugins.downloads[0].destination=/app/plugins/zenith-backup"
        - "@config:plugins.downloads[0].version=branch:releases"
        
        # enable plugin
        - "@config:zbackups.registry.01KRKSDD5BFHDMCKKD2C53DGBA.enabled=true"

        # ...configure backups
```

In case you want to access the dashboard in this setup you just need to add a user via config and expose the port

```yaml
services:
    backup:
        image: sidekickcoder/zenith:latest
        restart: unless-stopped
    ports:
        - 3000:3000
    command:
         # download plugin
        - "@config:plugins.downloads[0].repository=https://github.com/sidekick-coder/zenith-backup.git"
        - "@config:plugins.downloads[0].destination=/app/plugins/zenith-backup"
        - "@config:plugins.downloads[0].version=branch:releases"
        
        # enable plugin
        - "@config:zbackups.registry.01KRKSDD5BFHDMCKKD2C53DGBA.enabled=true"

        # auto-create users
        - "@config:users_auto=true"
        - "@config:users[1].username=admin"
        - "@config:users[1].email=admin@dev.com"
        - "@config:users[1].password=admin-123"
        - "@config:users[1].permissions=admin"

        # ...configure backups

````



## S3 or other remote storage 

This is a way to run the app without any local data files, useful if you want to store configuration and storage in a s3 for example

```yml 
services:
    app:
        image: sidekickcoder/zenith:latest
        restart: unless-stopped
        ports:
            - "3000:3000"
        environment:
            CONFIG_DRIVER: s3 
            CONFIG_S3_BUCKET: my-bucket
            CONFIG_S3_REGION: us-east-1
            CONFIG_S3_ACCESS_KEY_ID: ${CONFIG_S3_ACCESS_KEY_ID}
            CONFIG_S3_SECRET_ACCESS_KEY: ${CONFIG_S3_SECRET_ACCESS_KEY}
```

To use plugins in this setup you can make use of the auto download feature

```yaml 
services:
    app:
        image: sidekickcoder/zenith:latest
        restart: unless-stopped
        ports:
            - "3000:3000"
        environment:
            CONFIG_DRIVER: s3 
            CONFIG_S3_BUCKET: my-bucket
            CONFIG_S3_REGION: us-east-1
            CONFIG_S3_ACCESS_KEY_ID: ${CONFIG_S3_ACCESS_KEY_ID}
            CONFIG_S3_SECRET_ACCESS_KEY: ${CONFIG_S3_SECRET_ACCESS_KEY}
    command:
        - "@config:plugins.downloads[0].repository=https://github.com/sidekick-coder/zenith-backup.git"
        - "@config:plugins.downloads[0].destination=/app/plugins/zenith-backup"
        - "@config:plugins.downloads[0].version=branch:releases"
```
