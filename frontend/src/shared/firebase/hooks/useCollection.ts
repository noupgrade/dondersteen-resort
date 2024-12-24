import { useEffect, useState } from 'react'

import { GetCollectionParams, getCollection } from '../getCollection.ts'
import { FSDocument } from '../types.ts'

interface UseCollectionsResponse<T> {
    results: T[]
    hasReachedEnd: boolean
    loadMore: () => void
    isLoading: boolean
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
        const fetchResults = async () => {
            setIsLoading(true)
            await getCollection<T>({ path, orderBy, limit, startAfter, where }, upToDateDocs => {
                if (upToDateDocs.length) setResults(prev => removeDuplicates(prev, upToDateDocs))
                else setHasReachedEnd(true)
            })
            setIsLoading(false)
        }

        fetchResults()
    }, [path, limit, startAfter])

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

    return {
        results,
        hasReachedEnd,
        loadMore,
        isLoading,
    }
}
