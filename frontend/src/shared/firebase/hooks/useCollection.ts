import { useCallback, useEffect, useState } from 'react'

import { deleteDocument, setDocument } from '../DocumentsDAO.ts'
import { GetCollectionParams, getCollection } from '../getCollection.ts'
import { FSDocument } from '../types.ts'

interface UseCollectionsResponse<T extends FSDocument> {
    results: T[]
    hasReachedEnd: boolean
    loadMore: () => void
    isLoading: boolean
    addDocument: (data: Omit<T, 'id' | keyof FSDocument>) => Promise<T>
    updateDocument: (id: string, data: Partial<T>) => Promise<void>
    removeDocument: (id: string) => Promise<void>
}

const removeDuplicates = <T extends FSDocument>(a: T[], b: T[]): T[] => {
    const uniques = new Map()

    a.forEach(value => uniques.set(value.id, value))
    b.forEach(value => uniques.set(value.id, value))

    return Array.from(uniques.values())
}

export const useCollection = <T extends FSDocument>({
    path,
    orderBy,
    limit,
    where,
}: GetCollectionParams): UseCollectionsResponse<T> => {
    const [startAfter, setStartAfter] = useState<number | undefined>(undefined)
    const [hasReachedEnd, setHasReachedEnd] = useState(false)
    const [results, setResults] = useState<T[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        console.log('useCollection: useEffect')
        let unsubscribe = () => {}
        const fetchResults = async () => {
            setIsLoading(true)
            // unsubscribe = await getCollection<T>({ path, orderBy, limit, startAfter, where }, upToDateDocs => {
            //     if (upToDateDocs.length) setResults(prev => removeDuplicates(prev, upToDateDocs))
            //     else setHasReachedEnd(true)
            // })
            setIsLoading(false)
        }

        fetchResults()
        return () => {
            console.log('unsubscribing')
            unsubscribe()
        }
    }, [path, limit, startAfter, where])

    useEffect(() => {
        console.log(`useCollection: useEffect: path: ${path}`)
    }, [path])
    useEffect(() => {
        console.log(`useCollection: useEffect: limit: ${limit}`)
    }, [limit])
    useEffect(() => {
        console.log(`useCollection: useEffect: startAfter: ${startAfter}`)
    }, [startAfter])
    useEffect(() => {
        console.log(`useCollection: useEffect: where: ${where}`)
    }, [where])
    useEffect(() => {
        console.log(`useCollection: useEffect: orderBy: ${orderBy}`)
    }, [orderBy])
    useEffect(() => {
        setResults([])
    }, [path])

    const loadMore = () => {
        if (!results.length) setHasReachedEnd(true)
        else {
            const orderByField = orderBy![0] as string
            const lastElementTime = results[results.length - 1][orderByField] as number
            setStartAfter(lastElementTime)
        }
    }

    const addDocument = useCallback(
        async (data: Omit<T, 'id' | keyof FSDocument>) => {
            const timestamp = Date.now()
            const docWithTimestamps = {
                ...data,
                createdAt: timestamp,
                updatedAt: timestamp,
            }
            const newDoc = await setDocument<typeof docWithTimestamps>({
                collectionName: path,
                data: docWithTimestamps,
            })
            const typedDoc = newDoc as unknown as T
            setResults([...results, typedDoc])
            return typedDoc
        },
        [path],
    )

    const updateDocument = useCallback(
        async (id: string, data: Partial<T>) => {
            const updatedData = {
                ...data,
                updatedAt: Date.now(),
            }
            await setDocument<Partial<T>>({
                collectionName: path,
                id,
                data: updatedData,
            })
            setResults(prev => prev.map(doc => (doc.id === id ? ({ ...doc, ...updatedData } as T) : doc)))
        },
        [path],
    )

    const removeDocument = useCallback(
        async (id: string) => {
            await deleteDocument({
                collectionName: path,
                id,
            })
            setResults(prev => prev.filter(doc => doc.id !== id))
        },
        [path],
    )

    return {
        results,
        hasReachedEnd,
        loadMore,
        isLoading,
        addDocument,
        updateDocument,
        removeDocument,
    }
}
