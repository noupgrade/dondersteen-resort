import { useParams } from 'react-router-dom'

export const useEventId = () => {
    const { eventId } = useParams()
    return eventId ?? 'demo'
}
