import { HotjarService } from './hotjar'
import { MixpanelService } from './mixpanel'
import { SentryService } from './sentry'
import type { TrackingService as TrackingServiceType } from './types'

export const TrackingService: Required<TrackingServiceType> = {
    init: () => {
        MixpanelService.init()
        HotjarService.init()
    },
    setUser: user => {
        MixpanelService.setUser(user)
        SentryService.setUser(user)
    },
    identify: id => {
        MixpanelService.identify(id)
    },
    trackPageView: properties => {
        MixpanelService.trackPageView(properties)
    },
    trackLinks: (...args) => {
        MixpanelService.trackLinks(...args)
    },
    trackEvent: (...args) => {
        MixpanelService.trackEvent(...args)
    },
    captureException: (...args) => {
        SentryService.captureException(...args)
    },
}
