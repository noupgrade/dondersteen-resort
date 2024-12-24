import * as functions from 'firebase-functions'
import { ExampleType } from '../types/types'


export const exampleRequest = functions.https.onCall(
    async (): Promise<ExampleType> => {
        return {
            id: '123',
            name: 'Example Name',
            description: 'Example Description',
        }
    },
)
