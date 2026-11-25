/* global self, console */

self.addEventListener('install', (_event) => {
    console.log('sw installed')
    self.skipWaiting()
})

self.addEventListener('activate', (_event) => {
    console.log('sw activated')
})
