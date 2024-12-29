import { Route, Routes } from 'react-router-dom'

import { ReservationProvider } from '@/components/ReservationContext'

import BookingPage from '../booking/BookingPage'
import Home from '../page'
import ClientDetailsPage from '../panel-interno/clientes/[id]/page'
import ClientesPage from '../panel-interno/clientes/page'
import PanelInternoLayout from '../panel-interno/layout'
import PanelInterno from '../panel-interno/page'
import PeluqueriaPage from '../panel-interno/peluqueria/page'
import PlanningPage from '../panel-interno/planning/page'
import EditReservationPage from '../panel-interno/reservas/[id]/edit/page'
import ReservationDetailsPage from '../panel-interno/reservas/[id]/page'
import TiendaPage from '../panel-interno/tienda/page'
import PeluqueriaBookingPage from '../peluqueria-booking/PeluqueriaBooking'
import PerfilClientesPage from '../perfil-clientes/PerfilClientesPage'
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
