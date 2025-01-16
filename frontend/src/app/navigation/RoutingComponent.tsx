import { Route, Routes } from 'react-router-dom'

import { ReservationProvider } from '@/components/ReservationContext'
import { useIsMobile } from '@/shared/lib/hooks/useIsMobile'

import { LoginPage } from '@/pages/login/LoginPage'
import PanelInternoLayout from '@/pages/panel-interno/layout'
import PanelInterno from '@/pages/panel-interno/page'
import MobilePanelInterno from '@/pages/panel-interno/mobile/page'
import PlanningPage from '@/pages/panel-interno/PlanningPage.tsx'
import ReservationDetailsPage from '@/pages/panel-interno/ReservationDetailsPage.tsx'
import SetupPage from '@/pages/panel-interno/setup/page'
import TiendaPage from '@/pages/panel-interno/tienda/page'
import BookingPage from '../../pages/BookingPage.tsx'
import ClientDetailsPage from '../../pages/ClientPage.tsx'
import ClientesPage from '../../pages/ClientsPage.tsx'
import Home from '../../pages/HomePage.tsx'
import PeluqueriaPage from '../../pages/panel-interno/HairSalonInternalPanelPage.tsx'
import PeluqueriaBookingPage from '../../pages/PeluqueriaBooking.tsx'
import PerfilClientesPage from '../../pages/PerfilClientesPage.tsx'
import { WithAnonymousUser } from './WithAnonymousUser'

export const RoutingComponent = () => {
    const isMobile = useIsMobile()

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route
                path='/booking'
                element={
                    <WithAnonymousUser userType='endUser'>
                        <ReservationProvider>
                            <BookingPage />
                        </ReservationProvider>
                    </WithAnonymousUser>
                }
            />
            <Route path='/login' element={<LoginPage />} />
            <Route
                path='/peluqueria-booking'
                element={
                    <WithAnonymousUser userType='endUser'>
                        <ReservationProvider>
                            <PeluqueriaBookingPage />
                        </ReservationProvider>
                    </WithAnonymousUser>
                }
            />
            <Route
                path='/perfil-clientes'
                element={
                    <WithAnonymousUser userType='endUser'>
                        <ReservationProvider>
                            <PerfilClientesPage />
                        </ReservationProvider>
                    </WithAnonymousUser>
                }
            />
            <Route
                path='/panel-interno/*'
                element={
                    <WithAnonymousUser userType='admin'>
                        <ReservationProvider>
                            {isMobile ? (
                                <MobilePanelInterno />
                            ) : (
                                <PanelInternoLayout>
                                    <Routes>
                                        <Route index element={<PanelInterno />} />
                                        <Route path='peluqueria' element={<PeluqueriaPage />} />
                                        <Route path='tienda' element={<TiendaPage />} />
                                        <Route path='planning' element={<PlanningPage />} />
                                        <Route path='clientes' element={<ClientesPage />} />
                                        <Route path='clientes/:id' element={<ClientDetailsPage />} />
                                        <Route path='reservas/:id' element={<ReservationDetailsPage />} />
                                        <Route path='setup' element={<SetupPage />} />
                                    </Routes>
                                </PanelInternoLayout>
                            )}
                        </ReservationProvider>
                    </WithAnonymousUser>
                }
            />
            <Route path='*' element={<div>404 - Page not found</div>} />
        </Routes>
    )
}
