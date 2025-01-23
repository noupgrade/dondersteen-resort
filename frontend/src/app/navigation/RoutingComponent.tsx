import { Route, Routes } from 'react-router-dom'

import { ReservationProvider } from '@/components/ReservationContext'
import { useIsMobile } from '@/shared/lib/hooks/useIsMobile'

import { LoginPage } from '@/pages/login/LoginPage'
import PanelInternoLayout from '@/pages/panel-interno/layout'
import PanelInterno from '@/pages/panel-interno/page'
import MobilePanelInterno from '@/pages/panel-interno/mobile/page'
import PlanningPage from '@/pages/panel-interno/PlanningPage'
import ReservationDetailsPage from '@/pages/panel-interno/ReservationDetailsPage'
import SetupPage from '@/pages/panel-interno/setup/page'
import TiendaPage from '@/pages/panel-interno/tienda/page'
import StorePage from '@/pages/panel-interno/tienda/store'
import EmployeeSelection from '@/pages/panel-interno/tienda/employee-selection'
import BillingPage from '@/pages/panel-interno/facturacion/page'
import BookingPage from '../../pages/BookingPage'
import ClientDetailsPage from '../../pages/ClientPage'
import ClientesPage from '../../pages/ClientsPage'
import Home from '../../pages/HomePage'
import PeluqueriaPage from '../../pages/panel-interno/HairSalonInternalPanelPage'
import PeluqueriaBookingPage from '../../pages/PeluqueriaBooking'
import PerfilClientesPage from '../../pages/PerfilClientesPage'
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
                                        <Route path='tienda' element={<EmployeeSelection />} />
                                        <Route path='tienda/store' element={<StorePage />} />
                                        <Route path='planning' element={<PlanningPage />} />
                                        <Route path='clientes' element={<ClientesPage />} />
                                        <Route path='clientes/:id' element={<ClientDetailsPage />} />
                                        <Route path='reservas/:id' element={<ReservationDetailsPage />} />
                                        <Route path='setup' element={<SetupPage />} />
                                        <Route path='facturacion' element={<BillingPage />} />
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
