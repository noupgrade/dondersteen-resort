import { Route, Routes } from 'react-router-dom'

import { ReservationProvider } from '@/components/ReservationContext'
import { LoginPage } from '@/pages/login/LoginPage'
import PlanningPage from '@/pages/panel-interno/PlanningPage'
import ReservationDetailsPage from '@/pages/panel-interno/ReservationDetailsPage'
import BillingPage from '@/pages/panel-interno/facturacion/page'
import PanelInternoLayout from '@/pages/panel-interno/layout'
import MobilePanelInterno from '@/pages/panel-interno/mobile/page'
import SetupPage from '@/pages/panel-interno/setup/page'
import EmployeeSelection from '@/pages/panel-interno/tienda/employee-selection'
import StorePage from '@/pages/panel-interno/tienda/store'
import { useIsMobile } from '@/shared/lib/hooks/useIsMobile'

import HotelManagementPage from '@/pages/panel-interno/HotelManagementPage'
import BookingConfirmationPage from '../../pages/BookingConfirmationPage'
import BookingPage from '../../pages/BookingPage'
import ClientDetailsPage from '../../pages/ClientPage'
import ClientesPage from '../../pages/ClientsPage'
import Home from '../../pages/HomePage'
import PeluqueriaBookingPage from '../../pages/PeluqueriaBooking'
import PerfilClientesPage from '../../pages/PerfilClientesPage'
import PeluqueriaPage from '../../pages/panel-interno/HairSalonInternalPanelPage'
import { ProtectedStaffPage } from './ProtectedPage'
import { WithAnonymousUser } from './WithAnonymousUser'

export const RoutingComponent = () => {
    const isMobile = useIsMobile()

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route
                path='/booking'
                element={
                    <WithAnonymousUser>
                        <ReservationProvider>
                            <BookingPage />
                        </ReservationProvider>
                    </WithAnonymousUser>
                }
            />
            <Route
                path='/booking/confirmation/:reservationId'
                element={
                    <WithAnonymousUser>
                        <ReservationProvider>
                            <BookingConfirmationPage />
                        </ReservationProvider>
                    </WithAnonymousUser>
                }
            />
            <Route path='/login' element={<LoginPage />} />
            <Route
                path='/peluqueria-booking'
                element={
                    <WithAnonymousUser>
                        <ReservationProvider>
                            <PeluqueriaBookingPage />
                        </ReservationProvider>
                    </WithAnonymousUser>
                }
            />
            <Route
                path='/perfil-clientes'
                element={
                    <WithAnonymousUser>
                        <ReservationProvider>
                            <PerfilClientesPage />
                        </ReservationProvider>
                    </WithAnonymousUser>
                }
            />
            <Route
                path='/panel-interno/*'
                element={
                    <ProtectedStaffPage>
                        <ReservationProvider>
                            {isMobile ? (
                                <MobilePanelInterno />
                            ) : (
                                <PanelInternoLayout>
                                    <Routes>
                                        <Route index element={<HotelManagementPage   />} />
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
                    </ProtectedStaffPage>
                }
            />
            <Route path='*' element={<div>404 - Page not found</div>} />
        </Routes>
    )
}
