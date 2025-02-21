import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions/v2'

import { firestore } from '../FirebaseInit'
import { HairSalonReservation, HotelBudget, HotelReservation, Reservation } from '../types/reservations'

functions.setGlobalOptions({ region: 'europe-west3' })

type AddReservationRequest = Omit<Reservation, 'id'>

const mapHotelReservation = (data: HotelReservation, totalPrice: number): Omit<HotelReservation, 'id'> => ({
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
        roomNumber: pet.roomNumber,
    })),
    additionalServices: data.additionalServices,
    status: 'pending',
    totalPrice: totalPrice,
    paymentStatus: 'pending',
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
                reservationData = mapHotelReservation(data as HotelReservation, calculateHotelTotalPrice(data))
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

function calculateHotelTotalPrice(data: AddReservationRequest): number {
    if (data.type !== 'hotel') {
        throw new Error('Invalid reservation type for hotel price calculation')
    }

    const hotelData = data as HotelReservation
    const checkInDate = new Date(hotelData.checkInDate)
    const checkOutDate = new Date(hotelData.checkOutDate)

    // Calculate number of nights
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    // Base prices per size
    const BASE_PRICES: Record<string, number> = {
        pequeño: 32,
        mediano: 35,
        grande: 39,
    }

    // Calculate base price for each pet
    let totalPrice = 0
    const hasMultiplePets = hotelData.pets.length > 1

    // Calculate base price for each pet
    hotelData.pets.forEach(pet => {
        const basePrice = (BASE_PRICES[pet.size] || BASE_PRICES.mediano) * (nights || 1) // Use 1 for daycare
        totalPrice += basePrice
    })

    // Calculate service costs
    hotelData.additionalServices.forEach(service => {
        let servicePrice = 0

        switch (service.type) {
            case 'medication':
                servicePrice = service.frequency === 'multiple' ? 3.5 * nights : 2.5 * nights
                break
            case 'special_care':
                servicePrice = 3 * nights
                break
            case 'special_food':
                servicePrice = 2 * nights
                break
            case 'driver':
                switch (service.serviceType) {
                    case 'pickup':
                        servicePrice = 15
                        break
                    case 'dropoff':
                        servicePrice = 15
                        break
                    case 'both':
                        servicePrice = 25
                        break
                }
                break
            case 'hairdressing':
                if (service.services) {
                    service.services.forEach(hairdressingService => {
                        const petSize = hotelData.pets[service.petIndex || 0].size
                        switch (hairdressingService) {
                            case 'bath_and_brush':
                                servicePrice += petSize === 'pequeño' ? 25 : petSize === 'mediano' ? 30 : 35
                                break
                            case 'bath_and_trim':
                                servicePrice += petSize === 'pequeño' ? 35 : petSize === 'mediano' ? 40 : 45
                                break
                            case 'stripping':
                            case 'deshedding':
                                servicePrice += petSize === 'pequeño' ? 50 : petSize === 'mediano' ? 60 : 70
                                break
                            case 'brushing':
                                servicePrice += petSize === 'pequeño' ? 15 : petSize === 'mediano' ? 20 : 25
                                break
                            case 'spa':
                                servicePrice += petSize === 'pequeño' ? 30 : petSize === 'mediano' ? 35 : 40
                                break
                            case 'spa_ozone':
                                servicePrice += petSize === 'pequeño' ? 40 : petSize === 'mediano' ? 45 : 50
                                break
                        }
                    })
                }
                break
        }

        totalPrice += servicePrice
    })

    // Apply multi-pet discount if applicable (10% discount)
    if (hasMultiplePets) {
        totalPrice = totalPrice * 0.9
    }

    // Apply any additional discounts
    if (hotelData.discounts) {
        const totalDiscounts = hotelData.discounts.reduce((sum, discount) => sum + discount.amount, 0)
        totalPrice -= totalDiscounts
    }

    // Add IVA (21%)
    const iva = 0.21
    totalPrice = totalPrice * (1 + iva)
    return parseFloat(totalPrice.toFixed(2))
}
