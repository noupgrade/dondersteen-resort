import { httpsCallable } from 'firebase/functions'

import { functions } from '@/shared/firebase/firebase.ts'
import { Reservation } from '@monorepo/functions/src/types/reservations'

type AddReservationRequest = Omit<Reservation, 'id'>

export const addReservation = httpsCallable<AddReservationRequest, Reservation>(functions, 'addReservation')
