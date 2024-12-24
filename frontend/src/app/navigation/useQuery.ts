import { useLocation } from 'react-router-dom'

export const useQuery = (paramName: string) => {
    const urlSearchParams = new URLSearchParams(useLocation().search)
    return urlSearchParams.get(paramName)
}
