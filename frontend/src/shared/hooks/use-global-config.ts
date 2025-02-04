import { useDocument } from '@/shared/firebase/hooks/useDocument'

export interface Employee {
    id: string
    name: string
}

export interface GlobalPrivateConfig {
    employees?: Employee[]
    id: string
}

export interface GlobalPublicConfig {
    phoneNumber: string
    id: string
}

export function useGlobalPrivateConfig() {
    const {
        document: data,
        isLoading: loading,
        error,
    } = useDocument<GlobalPrivateConfig>({
        collectionName: 'configs',
        id: 'global_configs_private',
    })

    return {
        data,
        loading,
        error,
    }
}

export function useGlobalPublicConfig() {
    const {
        document: data,
        isLoading: loading,
        error,
    } = useDocument<GlobalPublicConfig>({
        collectionName: 'configs',
        id: 'global_configs_public',
    })

    return {
        data,
        loading,
        error,
    }
}
