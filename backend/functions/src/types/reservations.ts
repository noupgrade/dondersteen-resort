import { AdditionalService } from './services';

export interface ExampleType {
    id: string;
    name: string;
    description: string;
}
export type HotelReservation = {
    id: string;
    type: 'hotel';
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime?: string;
    client: Client;
    pets: Pet[];
    additionalServices: AdditionalService[];
    shopProducts?: ShopProduct[];
    status: 'confirmed' | 'pending' | 'cancelled' | 'propuesta peluqueria';
    totalPrice: number;
    paymentStatus: string;
    roomNumber?: string;
    createdAt?: string;
    updatedAt?: string;
};
export type ShopProduct = {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
};
export type Client = {
    id?: string;
    name: string;
    phone: string;
    email: string;
    address?: string;
};
export type Pet = {
    id?: string;
    name: string;
    breed: string;
    size: 'pequeño' | 'mediano' | 'grande';
    weight: number;
    sex?: 'M' | 'F';
    isNeutered?: boolean;
    additionalServices?: AdditionalService[]; // TODO DO NOT USE THIS UNTIL WE MIGRATE FROM THE RESERVATION TYPE. THIS IS JUST TO BE USED IN THE CUSTOMER PROFILE
};
export type HotelBudget = Omit<HotelReservation, 'type'> & {
    type: 'hotel-budget';
};
export type HairSalonTask = {
    id: string;
    reservationId: string;
    service: AdditionalService;
    date: string;
    time: string;
    duration: number;
};
export type HairSalonReservation = {
    id: string;
    type: 'peluqueria';
    source: 'hotel' | 'external';
    date: string;
    time: string;
    client: Client;
    pet: Pet;
    additionalServices: AdditionalService[];
    shopProducts?: ShopProduct[];
    status: 'confirmed' | 'pending' | 'cancelled' | 'propuesta peluqueria';
    totalPrice: number;
    paymentStatus: string;
    observations?: string;
    tasks?: HairSalonTask[];
    precioEstimado?: number;
    horaDefinitiva?: string;
    finalPrice?: number;
    priceNote?: string;
    // Campos para reservas de hotel
    hotelCheckIn?: string;
    hotelCheckOut?: string;
    hotelCheckOutTime?: string;
    hasDriverService?: boolean;
    // Campo para asignar peluquera
    hairdresser?: 'hairdresser1' | 'hairdresser2';
    duration?: number;
    // Campo para hora solicitada en reservas externas
    requestedTime?: string;
    // Campo para hora asignada
    assignedTime?: string;
    // Campo para foto del resultado
    resultImage?: string;
    // Campos para cambios de checkout
    checkoutChangeAccepted?: boolean;
    checkoutChangeRejected?: boolean;
};
export type Reservation = HotelReservation | HairSalonReservation | HotelBudget;
