import { GetCollectionParams } from '../getCollection'
import { FSDocument } from '../types'

interface CacheEntry<T> {
    data: T[]
    timestamp: number
}

export class CollectionCache {
    private static cache = new Map<string, CacheEntry<any>>()
    private static CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds
    private static STORAGE_KEY = 'collection_cache'
    private static cleanupInterval: NodeJS.Timeout | null = null

    private static generateCacheKey(params: Omit<GetCollectionParams, 'startAfter'>): string {
        const { path, orderBy, limit, where } = params
        return JSON.stringify({ path, orderBy, limit, where })
    }

    private static async saveToStorage(): Promise<void> {
        const serializedCache = JSON.stringify(Array.from(this.cache.entries()))
        try {
            localStorage.setItem(this.STORAGE_KEY, serializedCache)
        } catch (error) {
            console.error('Error saving cache to localStorage:', error)
        }
    }

    private static async loadFromStorage(): Promise<void> {
        try {
            const serializedCache = localStorage.getItem(this.STORAGE_KEY)
            if (serializedCache) {
                const entries = JSON.parse(serializedCache)
                this.cache = new Map(entries)
                await this.cleanup()
            }
        } catch (error) {
            console.error('Error loading cache from localStorage:', error)
        }
    }

    private static async cleanup(): Promise<void> {
        const now = Date.now()
        let hasChanges = false

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.CACHE_TTL) {
                this.cache.delete(key)
                hasChanges = true
            }
        }

        if (hasChanges) {
            await this.saveToStorage()
        }
    }

    static async initialize(): Promise<void> {
        await this.loadFromStorage()

        if (!this.cleanupInterval) {
            this.cleanupInterval = setInterval(() => {
                void this.cleanup()
            }, this.CACHE_TTL)
        }
    }

    static contains(params: Omit<GetCollectionParams, 'startAfter'>): boolean {
        const key = this.generateCacheKey(params)
        return this.cache.has(key)
    }

    static get<T extends FSDocument>(params: Omit<GetCollectionParams, 'startAfter'>): T[] | null {
        const key = this.generateCacheKey(params)
        const entry = this.cache.get(key)

        if (!entry) return null

        const isExpired = Date.now() - entry.timestamp > this.CACHE_TTL
        if (isExpired) {
            this.cache.delete(key)
            // Fire and forget storage update
            void this.saveToStorage()
            return null
        }

        return entry.data
    }

    static set<T extends FSDocument>(params: Omit<GetCollectionParams, 'startAfter'>, data: T[]): void {
        const key = this.generateCacheKey(params)
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        })
        // Fire and forget storage update
        void this.saveToStorage()
    }

    static clear(): void {
        this.cache.clear()
        // Fire and forget storage update
        void this.saveToStorage()
    }

    static destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
            this.cleanupInterval = null
        }
    }
}

// Initialize the cache when the module loads
void CollectionCache.initialize()
