import { AdditionalService, DriverService } from '@monorepo/functions/src/types/services'
import { HairdressingService } from '@monorepo/functions/src/types/services'

export const isDriverService = (service: AdditionalService): service is DriverService => service.type === 'driver'

export const isHairdressingService = (service: AdditionalService): service is HairdressingService =>
    service.type === 'hairdressing'
