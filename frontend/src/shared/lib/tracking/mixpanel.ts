import mixpanel from 'mixpanel-browser'

import { isLocalEnvironment, isTestEnvironment } from '@/shared/lib/environment'

import { TrackingService } from './types'

const projectToken = isTestEnvironment
    ? '352d226ab918fde801ce6c5cb3b0e333' // Testing
    : 'bbb91f1604af9c3f3bf8a96c9663c472' // Production

export const MixpanelService = {
    init: () => {
        console.log('INIT!')
        mixpanel.init(projectToken, {
            api_host: 'https://mixpanel-tracking-proxy-7tducinnmq-uc.a.run.app', // TODO : <FILL> use a proxy from this project instead the botwhirl one
            debug: isLocalEnvironment,
        })
    },
    identify: id => mixpanel.identify(id),
    setUser: user => {
        mixpanel.people.set({
            'User ID': user.id,
            type: 'customer',
            $email: user.email,
            $name: user.name,
            $phone: user.phone,
            $avatar: user.avatar,
            $created: new Date(),
        })
    },
    trackPageView: properties => {
        mixpanel.track_pageview(properties)
    },
    trackLinks: (...args) => {
        const [query, eventName, properties] = args
        mixpanel.track_links(query, eventName, properties)
    },
    trackEvent: (...args) => {
        const [eventName, properties, config] = args
        mixpanel.track(eventName, properties, config)
    },
} satisfies TrackingService