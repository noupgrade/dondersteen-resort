import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { ErrorPage } from '@/pages/error/ErrorPage'
import { TrackingService } from '@/shared/lib/tracking'
import * as Sentry from '@sentry/react'

import '../i18n/i18n.ts'
import { RoutingComponent } from '../navigation/RoutingComponent'
import { UnauthenticatedProviders } from '../providers'
import '../styles/index.css'
import '../versions/versionListener.ts'
import { DocumentsProvider } from '@/shared/firebase/hooks/useDocument.tsx'
import { HotelAvailabilityProvider } from '@/components/HotelAvailabilityContext.tsx'

TrackingService.init()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Sentry.ErrorBoundary fallback={<ErrorPage />} showDialog>
            <DocumentsProvider>
                <UnauthenticatedProviders>
                    <HotelAvailabilityProvider>
                        <BrowserRouter>
                            <RoutingComponent />
                        </BrowserRouter>
                    </HotelAvailabilityProvider>
                </UnauthenticatedProviders>
            </DocumentsProvider>
        </Sentry.ErrorBoundary>
    </React.StrictMode>,
)
