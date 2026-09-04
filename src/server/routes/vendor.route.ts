import path from 'path'
import fs from 'fs'
import mime from 'mime'
import router from '#server/facades/router.facade.ts'
import BaseException from '#server/exceptions/base.ts'
import { basePath } from '#server/utils/paths.ts'

// Route to stream Vue bundle and other vendor assets
// router.get('/static/vendor/*', async ({ params, response }) => {
//     const assetPath = params['*'] as string
//
//     if (!assetPath) {
//         throw new BaseException('Asset path is required', 400)
//     }
//
//     const basename = path.basename(assetPath)
//
//     // Construct the full path to the vendor asset
//     const fullPath = path.join(basePath(), 'node_modules', assetPath)
//
//     if (!fs.existsSync(fullPath)) {
//         throw new BaseException('Vendor asset not found', 404)
//     }
//
//     const stats = fs.statSync(fullPath)
//
//     if (!stats.isFile()) {
//         throw new BaseException('Not a file', 400)
//     }
//
//     // Get appropriate MIME type
//     const mimetype = mime.getType(basename) || 'application/javascript'
//
//     // Set appropriate headers for streaming
//     response.set('Content-Type', mimetype)
//     response.set('Content-Length', stats.size.toString())
//     // response.set('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
//     response.set('Content-Disposition', `inline; filename="${basename}"`)
//
//     // Stream the file
//     const stream = fs.createReadStream(fullPath)
//
//     // Pipe the file stream to the response
//     stream.pipe(response)
//
//     return new Promise<void>((resolve, reject) => {
//         // Optional: Handle when the stream finishes
//         stream.on('error', reject)
//         stream.on('end', resolve)
//
//     })
// })
