import { Timestamp } from 'firebase/firestore'

export type Version = {
    id: string // ID of the document
    commitHash: string
    createdAt: Timestamp
    isBreaking: boolean
}
