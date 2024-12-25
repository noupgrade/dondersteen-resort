export const isTestEnvironment =
    window.location.hostname !== 'app.boothbits.com' &&
    window.location.hostname !== 'dondersteen-resort.web.app' &&
    window.location.hostname !== 'dondersteen-resort.firebaseapp.com'
export const isLocalEnvironment = false // window.location.hostname === 'localhost' // || process.env.NODE_ENV === 'development'
