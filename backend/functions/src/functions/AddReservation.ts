import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions/v2'

import { firestore } from '../FirebaseInit'
import { HairSalonReservation, HotelBudget, HotelReservation, Reservation } from '../types/reservations'

functions.setGlobalOptions({ region: 'europe-west3' })

type AddReservationRequest = Omit<Reservation, 'id'>

const mapHotelReservation = (data: HotelReservation): Omit<HotelReservation, 'id'> => ({
    type: 'hotel',
    checkInDate: data.checkInDate,
    checkInTime: data.checkInTime,
    checkOutDate: data.checkOutDate,
    checkOutTime: data.checkOutTime,
    client: {
        name: data.client.name,
        phone: data.client.phone,
        email: data.client.email,
        address: data.client.address,
    },
    pets: data.pets.map(pet => ({
        name: pet.name,
        breed: pet.breed,
        weight: pet.weight,
        size: pet.size,
        sex: pet.sex,
        isNeutered: pet.isNeutered,
    })),
    additionalServices: data.additionalServices,
    shopProducts: data.shopProducts,
    status: data.status,
    totalPrice: data.totalPrice,
    paymentStatus: data.paymentStatus,
    roomNumber: data.roomNumber || '',
})

const mapHotelBudget = (data: HotelBudget): Omit<HotelBudget, 'id'> => ({
    type: 'hotel-budget',
    checkInDate: data.checkInDate,
    checkInTime: data.checkInTime,
    checkOutDate: data.checkOutDate,
    checkOutTime: data.checkOutTime,
    client: {
        name: data.client.name,
        phone: data.client.phone,
        email: data.client.email,
        address: data.client.address,
    },
    pets: data.pets.map(pet => ({
        name: pet.name,
        breed: pet.breed,
        weight: pet.weight,
        size: pet.size,
        sex: pet.sex,
        isNeutered: pet.isNeutered,
    })),
    additionalServices: data.additionalServices,
    shopProducts: data.shopProducts,
    status: data.status,
    totalPrice: data.totalPrice,
    paymentStatus: data.paymentStatus,
    roomNumber: data.roomNumber || '',
})

const mapHairSalonReservation = (data: HairSalonReservation): Omit<HairSalonReservation, 'id'> => ({
    type: 'peluqueria',
    source: data.source,
    date: data.date,
    time: data.time,
    client: {
        name: data.client.name,
        phone: data.client.phone,
        email: data.client.email,
        address: data.client.address,
    },
    pet: {
        name: data.pet.name,
        breed: data.pet.breed,
        weight: data.pet.weight,
        size: data.pet.size,
        sex: data.pet.sex,
        isNeutered: data.pet.isNeutered,
    },
    additionalServices: data.additionalServices,
    shopProducts: data.shopProducts,
    status: data.status,
    totalPrice: data.totalPrice,
    paymentStatus: data.paymentStatus,
    observations: data.observations,
    tasks: data.tasks,
    precioEstimado: data.precioEstimado,
    horaDefinitiva: data.horaDefinitiva,
    finalPrice: data.finalPrice,
    priceNote: data.priceNote,
    hotelCheckIn: data.hotelCheckIn,
    hotelCheckOut: data.hotelCheckOut,
    hotelCheckOutTime: data.hotelCheckOutTime,
    hasDriverService: data.hasDriverService,
    hairdresser: data.hairdresser,
    duration: data.duration,
    requestedTime: data.requestedTime,
    assignedTime: data.assignedTime,
    resultImage: data.resultImage,
    checkoutChangeAccepted: data.checkoutChangeAccepted,
    checkoutChangeRejected: data.checkoutChangeRejected,
})

export const addReservation = functions.https.onCall({ cors: ['*'] }, async (request): Promise<Reservation> => {
    // Validate that the user is authenticated
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.')
    }

    const data = request.data as AddReservationRequest

    try {
        // Map the data based on reservation type
        let reservationData: Omit<Reservation, 'id'>
        switch (data.type) {
            case 'hotel':
                reservationData = mapHotelReservation(data as HotelReservation)
                break
            case 'hotel-budget':
                reservationData = mapHotelBudget(data as HotelBudget)
                break
            case 'peluqueria':
                reservationData = mapHairSalonReservation(data as HairSalonReservation)
                break
            default:
                throw new functions.https.HttpsError('invalid-argument', 'Invalid reservation type.')
        }

        // Add timestamps
        const dataToStore = {
            ...reservationData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }

        // Add to Firestore
        const docRef = await firestore.collection('reservations').add(dataToStore)

        // Get the created document
        const doc = await docRef.get()
        const reservation = {
            id: doc.id,
            ...doc.data(),
        } as Reservation

        return reservation
    } catch (error) {
        console.error('Error adding reservation:', error)
        throw new functions.https.HttpsError('internal', 'An error occurred while adding the reservation.')
    }
})
