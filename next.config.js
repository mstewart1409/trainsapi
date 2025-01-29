const withPWA = require('next-pwa')({
    dest: 'public',  // The directory to generate the service worker
    register: true,  // Automatically register the service worker
    skipWaiting: true,  // Force service worker to activate immediately
    sw: '/sw.js',  // Specify a custom service worker script
})

module.exports = withPWA({
    // next.js config
})