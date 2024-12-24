import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'

import {ErrorPage} from '@/pages/error/ErrorPage'
import {TrackingService} from '@/shared/lib/tracking'
import * as Sentry from '@sentry/react'

import '../i18n/i18n.ts'
import {RoutingComponent} from '../navigation/RoutingComponent'
import {UnauthenticatedProviders} from '../providers'
import '../styles/index.css'
import '../versions/versionListener.ts'

TrackingService.init()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Sentry.ErrorBoundary fallback={<ErrorPage />} showDialog>
            <UnauthenticatedProviders>
                <BrowserRouter>
                    <RoutingComponent />
                </BrowserRouter>
            </UnauthenticatedProviders>
        </Sentry.ErrorBoundary>
    </React.StrictMode>,
)
