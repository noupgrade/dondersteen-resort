import { useCallback, useState } from 'react'
import {
    AdditionalService,
    DriverService,
    SpecialFoodService,
    MedicationService,
    SpecialCareService,
    HairdressingService,
    ServicesState,
    DriverServiceType,
    SpecialFoodType,
    HairdressingServiceType,
} from '@/shared/types/additional-services'

export const useServices = (initialServices: AdditionalService[] = []) => {
    const [state, setState] = useState<ServicesState>({ services: initialServices })

    const addOrUpdateDriverService = useCallback((
        serviceType: DriverServiceType,
        pickupTime?: string,
        dropoffTime?: string,
        isOutOfHours?: boolean
    ) => {
        setState(current => {
            const services = current.services.filter(s => s.type !== 'driver')
            const driverService: DriverService = {
                type: 'driver',
                serviceType,
                pickupTime,
                dropoffTime,
                isOutOfHours
            }
            return { services: [...services, driverService] }
        })
    }, [])

    const removeDriverService = useCallback(() => {
        setState(current => ({
            services: current.services.filter(s => s.type !== 'driver')
        }))
    }, [])

    const addOrUpdateSpecialFoodService = useCallback((petIndex: number, foodType: SpecialFoodType) => {
        setState(current => {
            const services = current.services.filter(
                s => !(s.type === 'special_food' && s.petIndex === petIndex)
            )
            const foodService: SpecialFoodService = {
                type: 'special_food',
                petIndex,
                foodType
            }
            return { services: [...services, foodService] }
        })
    }, [])

    const removeSpecialFoodService = useCallback((petIndex: number) => {
        setState(current => ({
            services: current.services.filter(
                s => !(s.type === 'special_food' && s.petIndex === petIndex)
            )
        }))
    }, [])

    const addOrUpdateMedicationService = useCallback((petIndex: number, comment?: string) => {
        setState(current => {
            const services = current.services.filter(
                s => !(s.type === 'medication' && s.petIndex === petIndex)
            )
            const medicationService: MedicationService = {
                type: 'medication',
                petIndex,
                comment
            }
            return { services: [...services, medicationService] }
        })
    }, [])

    const removeMedicationService = useCallback((petIndex: number) => {
        setState(current => ({
            services: current.services.filter(
                s => !(s.type === 'medication' && s.petIndex === petIndex)
            )
        }))
    }, [])

    const addOrUpdateSpecialCareService = useCallback((petIndex: number, comment?: string) => {
        setState(current => {
            const services = current.services.filter(
                s => !(s.type === 'special_care' && s.petIndex === petIndex)
            )
            const specialCareService: SpecialCareService = {
                type: 'special_care',
                petIndex,
                comment
            }
            return { services: [...services, specialCareService] }
        })
    }, [])

    const removeSpecialCareService = useCallback((petIndex: number) => {
        setState(current => ({
            services: current.services.filter(
                s => !(s.type === 'special_care' && s.petIndex === petIndex)
            )
        }))
    }, [])

    const addOrUpdateHairdressingService = useCallback((
        petIndex: number,
        services: HairdressingServiceType[]
    ) => {
        setState(current => {
            const currentServices = current.services.filter(
                s => !(s.type === 'hairdressing' && s.petIndex === petIndex)
            )
            const hairdressingService: HairdressingService = {
                type: 'hairdressing',
                petIndex,
                services
            }
            return { services: [...currentServices, hairdressingService] }
        })
    }, [])

    const removeHairdressingService = useCallback((petIndex: number) => {
        setState(current => ({
            services: current.services.filter(
                s => !(s.type === 'hairdressing' && s.petIndex === petIndex)
            )
        }))
    }, [])

    // Helper functions to get services
    const getDriverService = useCallback(() =>
        state.services.find(s => s.type === 'driver') as DriverService | undefined
        , [state.services])

    const getSpecialFoodService = useCallback((petIndex: number) =>
        state.services.find(
            s => s.type === 'special_food' && s.petIndex === petIndex
        ) as SpecialFoodService | undefined
        , [state.services])

    const getMedicationService = useCallback((petIndex: number) =>
        state.services.find(
            s => s.type === 'medication' && s.petIndex === petIndex
        ) as MedicationService | undefined
        , [state.services])

    const getSpecialCareService = useCallback((petIndex: number) =>
        state.services.find(
            s => s.type === 'special_care' && s.petIndex === petIndex
        ) as SpecialCareService | undefined
        , [state.services])

    const getHairdressingService = useCallback((petIndex: number) =>
        state.services.find(
            s => s.type === 'hairdressing' && s.petIndex === petIndex
        ) as HairdressingService | undefined
        , [state.services])

    return {
        services: state.services,
        addOrUpdateDriverService,
        removeDriverService,
        addOrUpdateSpecialFoodService,
        removeSpecialFoodService,
        addOrUpdateMedicationService,
        removeMedicationService,
        addOrUpdateSpecialCareService,
        removeSpecialCareService,
        addOrUpdateHairdressingService,
        removeHairdressingService,
        getDriverService,
        getSpecialFoodService,
        getMedicationService,
        getSpecialCareService,
        getHairdressingService,
    }
} 