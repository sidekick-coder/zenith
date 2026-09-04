self.addEventListener('install', (event) => {
    console.log('sw installed')
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    console.log('sw activated')
})
