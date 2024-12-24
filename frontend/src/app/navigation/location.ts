import { PersonLocation } from '@monorepo/functions/src/types/feedback'

const IP_GEO_LOCATION_URL = 'https://ipinfo.io/json'

export const getUserLocation = async (): Promise<PersonLocation> => {
    return {
        country: await fetchCountryFromIP(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
    }
}

const fetchCountryFromIP = async (): Promise<string> => {
    try {
        const response = await fetch(IP_GEO_LOCATION_URL)
        if (!response.ok) {
            throw new Error('status code: ' + response.status)
        }

        return (await response.json()).country || ''
    } catch (err) {
        console.error('Failed to fetch location' + err)
    }
    return ''
}
