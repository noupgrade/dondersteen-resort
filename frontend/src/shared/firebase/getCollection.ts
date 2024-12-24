import {
    Unsubscribe,
    collection,
    limit as fLimit,
    orderBy as fOrderBy,
    query as fQuery,
    startAfter as fStartAfter,
    where as fWhere,
    onSnapshot,
} from 'firebase/firestore'

import { firestore } from './firebase.ts'
import { FSDocument } from './types.ts'

export interface GetCollectionParams {
    path: string
    orderBy?: Parameters<typeof fOrderBy>
    limit?: number
    startAfter?: number
    where?: Parameters<typeof fWhere>
}

export const getCollection = async <T extends FSDocument>(
    { path, orderBy, limit, startAfter, where }: GetCollectionParams,
    onCollectionChange: (docs: T[]) => void,
): Promise<Unsubscribe> => {
    const ref = collection(firestore, path)
    const query = fQuery(
        ref,
        ...[
            ...(where ? [fWhere(...where)] : []),
            ...(orderBy ? [fOrderBy(...orderBy)] : []),
            ...(limit ? [fLimit(limit)] : []),
            ...(startAfter ? [fStartAfter(startAfter)] : []),
        ],
    )

    return onSnapshot(query, snapshot => {
        const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as T)
        onCollectionChange(docs)
    })
}
