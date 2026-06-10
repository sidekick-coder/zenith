### Config via S3

You can use a S3 bucket as a persistent storage backend for the server config. 

This is useful in distributed deployments where multiple instances need to share the same config state.

To use S3 bucket as you persistent storage set the `CONFIG_DRIVER` environment variable to `s3` and provide the necessary S3 credentials and bucket information.

Required environment variables:

| Variable | Required | Description |
|---|---|---|
| `CONFIG_S3_BUCKET` | ✅ | S3 bucket name |
| `CONFIG_S3_REGION` | ✅ | AWS region |
| `CONFIG_S3_ACCESS_KEY_ID` | ✅ | Access key ID |
| `CONFIG_S3_SECRET_ACCESS_KEY` | ✅| Secret access key |
| `CONFIG_S3_ENDPOINT` | | Custom endpoint (for S3-compatible services) |
| `CONFIG_S3_PREFIX` | | Key prefix inside the bucket |
| `CONFIG_S3_SESSION_TOKEN` | | Session token |

Example:

```sh
CONFIG_DRIVER=s3
CONFIG_S3_BUCKET=my-config-bucket
CONFIG_S3_REGION=us-east-1
CONFIG_S3_ACCESS_KEY_ID=AKIA...
CONFIG_S3_SECRET_ACCESS_KEY=...
CONFIG_S3_PREFIX=config/
```
