# Drive 

Drive is a service responsible for handle files, it is used by other services to store and retrieve files. It provides a simple API to upload, download and delete files. It also provides a way to generate signed URLs for secure access to files.

```ts
import { drive } from '@sidekick-coder/zenith-kit/server';

console.log(drive.selected);
```

By default the current drive will be the one selected by the user

## Drive entry

Drive entry is an object that represents a file or a folder in the drive. It has the following properties:
```ts
class DriveEntry {
    public name: string
    public path: string
    public type: 'file' | 'directory'
    public metas: Record<string, any> = {}
}
```

## List entries

The simple way to use the `Drive` service is to create an instance of it by passing the name of the drive you want to use. For example, if you have a drive named `my-drive`, you can create an instance of it like this:

```ts
const files = await drive.list('my-folder') // DriveEntry[]
```

## Check if a entry exists
To check if a entry exists in the drive, you can use the `exists` method.

```ts
const fileExists = await drive.exists('my-folder/my-file.txt');
```

## Get entry information 

To get information about a file, you can use the `find` method. 

```ts
const fileInfo = await drive.find('my-folder/my-file.txt'); // DriveEntry | null
```

## Read entry content 

To read the content of a file, you can use the `read` method. 

There is also some variations of the `read` method that you can use too

```ts
const data = await drive.read('my-folder/my-file.txt'); // Uint8Array
const text = await drive.readText('my-folder/my-file.txt'); // string 
const stream = await drive.readStream('my-folder/my-file.txt'); // ReadableStream
```

## Write entry content
To write content to a file, you can use the `write` method. This method accepts a path and a content

```ts
// text
await drive.write('my-folder/my-file.txt', 'Hello, world!');

// json 
await drive.write('my-folder/my-file.json', { message: 'Hello, world!' });

// binary data
const data = new Uint8Array([72, 101, 108, 108, 111]);

await drive.write('my-folder/my-file.bin', data);

// stream
await drive.writeStream('my-folder/my-file.txt', stream);
```

## Delete entry
To delete a file or a folder, you can use the `delete` method. 

```ts
await drive.delete('my-folder/my-file.txt');
```

## Upload entry
To upload a file, you can use the `upload` method. This method accepts a path to a local file and the target path in the drive where you want to upload it.

```ts 
const localFilePath = '/path/to/local/file.txt';
const targetPath = 'my-folder/file.txt';

await drive.upload(localFilePath, targetPath);
```

## Download entry
To download a file, you can use the `download` method. This method accepts the path of the file in the drive and the local path where you want to save it.

```ts
const filePathInDrive = 'my-folder/file.txt';
const localTargetPath = '/path/to/local/file.txt';

await drive.download(filePathInDrive, localTargetPath);
```

## Entry URL
To generate a URL for a file to read or download, you can use the `url` method. 

```ts
await drive.url('file.txt');
await drive.url('file.txt', { expires: '1h' }); // valid for 1 hour
```

## Entry upload URL
To generate a URL for uploading a file, you can use the `uploadUrl` method.

```ts 
await drive.uploadUrl('my-folder/file.txt');
await drive.uploadUrl('my-folder/file.txt', { expires: '1h' }); // valid for 1 hour 
```

## List available drives 
To list all the available drives, you can use the `list` method of the `drive` service. This will return an array of drive names that are available for use.

```ts
import { drive } from '@sidekick-coder/zenith-kit/server';

const availableDrives = await drive.list();

console.log(availableDrives);
```

## Use specific drive

If the user has many drives available, you can use the `use` method to switch between them. 

```ts
import { drive } from '@sidekick-coder/zenith-kit/server';

const anotherDrive = drive.use('another-drive');
```

