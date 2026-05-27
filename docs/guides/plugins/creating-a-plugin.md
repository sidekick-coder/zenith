# Creating a plugin

## Zenith source code

Before starting to create a plugin you will need to have the zenith source code in some place of your machine

```sh 
git clone https://github.com/sidekick-coder/zenith /home/user/projects/zenith
```

This is just to run the plugin you wont need change anything directly in the source code

## Clone plugin starter repo

To start creating a plugin you can start by cloning the [pluging starter repo](https://github.com/sidekick-coder/zenith-plugin-starter)

```sh
git clone https://github.com/sidekick-coder/zenith-plugin-starter /home/user/projects/my-plugin
``` 

Install the dependencies

```sh
npm install
```

## Plugin ulid

You will have generate a new ulid and add to update the `zenith.config.yml`

This is a unique id that will be used to identify the plugin in the app and also in the future marketplace, so make sure to generate a new one and not use the one in the starter repo

You can generate a new ulid with the following command

```sh
npx zkit ulid 
````

```yaml
id: "01KRKSDD5BFHDMCKKD2C53DGBA" # replace this with a new ulid
name: "My Plugin" 
...
```
## Link plugin to zenith source code 

Now you just need to link the plugin to the zenith source code, you can do this just by adding a `.env` file in the root of the plugin with the following content

```sh
ZKIT_ZENITH_BASE_PATH=/home/user/projects/zenith
```

This will tell zenith-kit package where the zenith source code is located so it can use it to run the plugin

## Runing

With everything set up you can now run the plugin with the following command

```sh
npm run dev  # alias to npx zenith serve
```

## Executing zenith commands 

To execute zenith commands you can use `npx`

```sh
npx zenith route:list # list all routes
```

zenith-kit package will automatically map to zenith

Your custom commands will also be available this way

```sh
npx zenith my-command # run my custom command
```

## Building for production 
To build the plugin for production you can use the following command

```sh
npm run build # alias to npx zkit build
```

## Notes

- `config` folder is stored the zenith config files
- `storage` folder is zenith storage folder
- `src` folder that is loaded in development
- `dist` folder that is loaded in production
