import { isTestEnvironment } from '@/shared/lib/environment'
import Hotjar from '@hotjar/browser'

import { TrackingService } from './types'

export const HotjarService = {
    init: () => {
        if (!isTestEnvironment) Hotjar.init(5135022, 6)
    },
} satisfies TrackingService
