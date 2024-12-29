import { Route, Routes } from 'react-router-dom'

import { ReservationProvider } from '@/components/ReservationContext'

import BookingPage from '../../pages/BookingPage.tsx'
import Home from '../../pages/HomePage.tsx'
import ClientDetailsPage from '../../pages/ClientPage.tsx'
import ClientesPage from '../../pages/ClientsPage.tsx'
import PanelInternoLayout from '@/pages/panel-interno/layout'
import PanelInterno from '@/pages/panel-interno/page'
import PeluqueriaPage from '../../pages/panel-interno/HairSalonInternalPanelPage.tsx'
import PlanningPage from '@/pages/panel-interno/PlanningPage.tsx'
import EditReservationPage from '@/pages/panel-interno/EditReservationPage.tsx'
import ReservationDetailsPage from '@/pages/panel-interno/ReservationDetailsPage.tsx'
import TiendaPage from '@/pages/panel-interno/tienda/page'
import PeluqueriaBookingPage from '../../pages/PeluqueriaBooking.tsx'
import PerfilClientesPage from '../../pages/PerfilClientesPage.tsx'
import { LoginPage } from '@/pages/login/LoginPage'
import { ProtectedPage } from './ProtectedPage'
import { WithAnonymousUser } from './WithAnonymousUser'

export const RoutingComponent = () => (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route
            path='/booking'
            element={
                <ReservationProvider>
                    <BookingPage />
                </ReservationProvider>
            }
        />
        <Route path='/login' element={<LoginPage />} />
        <Route
            path='/peluqueria-booking'
            element={
                <ReservationProvider>
                    <PeluqueriaBookingPage />
                </ReservationProvider>
            }
        />
        <Route
            path='/perfil-clientes'
            element={
                <ReservationProvider>
                    <PerfilClientesPage />
                </ReservationProvider>
            }
        />
        <Route
            path='/panel-interno/*'
            element={
                <WithAnonymousUser userType='admin'>
                    <PanelInternoLayout>
                        <Routes>
                            <Route index element={<PanelInterno />} />
                            <Route path='peluqueria' element={<PeluqueriaPage />} />
                            <Route path='tienda' element={<TiendaPage />} />
                            <Route path='planning' element={<PlanningPage />} />
                            <Route path='clientes' element={<ClientesPage />} />
                            <Route path='clientes/:id' element={<ClientDetailsPage />} />
                            <Route path='reservas/:id' element={<ReservationDetailsPage />} />
                            <Route path='reservas/:id/edit' element={<EditReservationPage />} />
                        </Routes>
                    </PanelInternoLayout>
                </WithAnonymousUser>
            }
        />
        <Route path='*' element={<div>404 - Page not found</div>} />
    </Routes>
)
