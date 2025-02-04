import mixpanel from 'mixpanel-browser'

import { isLocalEnvironment, isTestEnvironment } from '@/shared/lib/environment'

import { TrackingService } from './types'

const projectToken = isTestEnvironment
    ? 'e91d927f0809f24a65b41781d880e976' // Testing
    : 'a2743892826810d20188dd1b873df440' // Production

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
