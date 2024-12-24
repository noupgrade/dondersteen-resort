import { useEffect } from 'react'
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router-dom'

import * as Sentry from '@sentry/react'

import { isTestEnvironment } from '../environment'
import { TrackingService } from './types'

const init = () => {
    if (!isTestEnvironment) {
        Sentry.init({
            environment: isTestEnvironment ? 'test' : 'production',
            dsn: 'https://<FILL>@<FILL>.ingest.us.sentry.io/<FILL>',
            integrations: [
                // See docs for support of different versions of variation of react router
                // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
                Sentry.reactRouterV6BrowserTracingIntegration({
                    useEffect,
                    useLocation,
                    useNavigationType,
                    createRoutesFromChildren,
                    matchRoutes,
                }),
                Sentry.replayIntegration(),
                Sentry.browserProfilingIntegration(),
                Sentry.feedbackIntegration({
                    colorScheme: 'system',
                    autoInject: false, // TODO ONLY DISABLE IN CHAT
                }),
            ],

            // Set tracesSampleRate to 1.0 to capture 100%
            // of transactions for tracing.
            tracesSampleRate: 1.0,

            // Set profilesSampleRate to 1.0 to profile every transaction.
            // Since profilesSampleRate is relative to tracesSampleRate,
            // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
            // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
            // results in 25% of transactions being profiled (0.5*0.5=0.25)
            profilesSampleRate: 1.0,

            // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
            tracePropagationTargets: ['localhost', /^https:\/\/us-central1-dondersteen-resort\.cloudfunctions\.net/],

            // Capture Replay for 10% of all sessions,
            // plus for 100% of sessions with an error
            replaysSessionSampleRate: 0,
            replaysOnErrorSampleRate: 1.0,
        })
    }
}

export const SentryService = {
    init,
    setUser: user => {
        Sentry.setUser({
            id: user.id,
            ...(user.email ? { email: user.email } : {}),
            ...(user.name ? { username: user.name } : {}),
        })
    },
    captureException: (...args) => {
        const [exception, hint] = args
        Sentry.captureException(exception, hint)
    },
} satisfies TrackingService
