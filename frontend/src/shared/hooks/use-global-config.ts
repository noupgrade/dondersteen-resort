import { useDocument } from '@/shared/firebase/hooks/useDocument'

interface Employee {
    id: string
    name: string
}

interface GlobalConfig {
    phoneNumber: string
    employees?: Employee[]
    id: string
}

export function useGlobalConfig() {
    const { document: data, isLoading: loading } = useDocument<GlobalConfig>({
        collectionName: 'configs',
        id: 'global_configs',
    })

    return {
        data,
        loading,
    }
}
