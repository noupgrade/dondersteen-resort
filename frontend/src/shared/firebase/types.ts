import { DocumentData } from 'firebase/firestore'

export interface FSDocument extends DocumentData {
    id: string
}
