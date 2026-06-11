### Config Filesystem 

By default, the app config persistence layer uses the local filesystem to store config entries as JSON files.

The config files are store in a directory that defaults to `config/` inside the base path. 

Each file corresponds to a top-level config key, with the filename (minus the `.json` extension) as the key name.

```bash
config/
  app.json        → config.get('app')
  database.json   → config.get('database')
  smtp.json       → config.get('smtp')
```

You can change the config directory by setting the `CONFIG_FS_PATH` environment variable.

```bash
CONFIG_FS_PATH=/path/to/config
```

You can also change the file formats to yaml files instead of json too

```bash
ZENITH_CONFIG_FS_FORMAT=yml # or yaml
```

If you want to configure the format of files, you can set the `ZENITH_CONFIG_FS_FORMAT_OPTIONS` environment variable it is a `key=value` list separated by `;` or newlines. 

For example, to set the indentation to 4 spaces:

```bash
ZENITH_CONFIG_FS_FORMAT_OPTIONS="indent=4"
```
