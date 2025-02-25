import { useCallback, useEffect, useState } from 'react'

import { deleteDocument, setDocument } from '../DocumentsDAO'
import { CollectionCache } from '../cache/CollectionCache'
import { GetCollectionParams, getCollection } from '../getCollection'
import { FSDocument } from '../types'

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
    const params = { path, orderBy, limit, where }
    const [startAfter, setStartAfter] = useState<number | undefined>(undefined)
    const [hasReachedEnd, setHasReachedEnd] = useState(false)
    const [results, setResults] = useState<T[]>(() => CollectionCache.get<T>(params) || [])
    const [isLoading, setIsLoading] = useState(() => !CollectionCache.contains(params))

    useEffect(() => {
        setResults(CollectionCache.get<T>(params) || [])
        let unsubscribe = () => {}
        const fetchResults = async () => {
            unsubscribe = await getCollection<T>({ ...params, startAfter }, upToDateDocs => {
                if (upToDateDocs.length) {
                    setResults(prev => {
                        const newResults = removeDuplicates(prev ?? [], upToDateDocs)
                        // Update cache with new results
                        CollectionCache.set(params, newResults)
                        return newResults
                    })
                } else {
                    setHasReachedEnd(true)
                    CollectionCache.set(params, results)
                }
                setIsLoading(false)
            })
        }

        fetchResults()
        return () => {
            unsubscribe()
        }
    }, [path, limit, startAfter, where])

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
            setResults(prev => prev?.map(doc => (doc.id === id ? ({ ...doc, ...updatedData } as T) : doc)) ?? null)
        },
        [path],
    )

    const removeDocument = useCallback(
        async (id: string) => {
            await deleteDocument({
                collectionName: path,
                id,
            })
            setResults(prev => prev?.filter(doc => doc.id !== id) ?? null)
        },
        [path],
    )

    return {
        results: results ?? [],
        hasReachedEnd,
        loadMore,
        isLoading,
        addDocument,
        updateDocument,
        removeDocument,
    }
}
