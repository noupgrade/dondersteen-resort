import { httpsCallable } from 'firebase/functions'

import { functions } from '@/shared/firebase/firebase.ts'
import { ExampleType } from '@monorepo/functions/src/types/reservations'

export const exampleRequest = httpsCallable<void, ExampleType>(functions, 'exampleRequest')
