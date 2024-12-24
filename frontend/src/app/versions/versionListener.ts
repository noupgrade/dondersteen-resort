import { QuerySnapshot, Timestamp, collection, getDocs, limit, orderBy, query } from 'firebase/firestore'
import mixpanel from 'mixpanel-browser'

import { firestore } from '@/shared/firebase/firebase.ts'
import { getCollection } from '@/shared/firebase/getCollection.ts'
import { isLocalEnvironment } from '@/shared/lib/environment.ts'
import { TrackingService } from '@/shared/lib/tracking/index.ts'

import { Version } from './Version.ts'

const getCurrentVersionFromDb = async () => {
    if (isLocalEnvironment) {
        return {
            id: 'test',
            commitHash: 'test',
            createdAt: Timestamp.now(),
            isBreaking: false,
        } as Version
    }

    const versionsRef = collection(firestore, 'app_versions')
    const versions = (await getDocs(
        query(versionsRef, orderBy('createdAt', 'desc'), limit(1)),
    )) as QuerySnapshot<Version>
    return { ...versions.docs[0].data(), id: versions.docs[0].id } as Version
}

async function listenToVersionChanges() {
    let currentVersion: Version = await getCurrentVersionFromDb()

    function setCurrentLocalVersion(latestBreakingVersion: Version) {
        console.log('Setting current version to', { latestBreakingVersion })
        currentVersion = latestBreakingVersion
        localStorage.setItem('version', JSON.stringify(latestBreakingVersion))
    }

    setCurrentLocalVersion(currentVersion)

    getCollection<Version>(
        {
            orderBy: ['createdAt', 'desc'],
            where: ['isBreaking', '==', true],
            path: 'app_versions',
            limit: 1,
        },
        ([latestBreakingVersion]) => {
            try {
                console.log('Listener received a new version:', { latestBreakingVersion })
                if (
                    latestBreakingVersion &&
                    latestBreakingVersion.createdAt.toMillis() > currentVersion.createdAt.toMillis()
                ) {
                    mixpanel.track('Client version updated', {
                        latestBreakingVersion,
                        currentVersion,
                    })
                    setCurrentLocalVersion(latestBreakingVersion)
                    window.location.reload()
                }
            } catch (e) {
                console.error(e)
                TrackingService.captureException(e)
            }
        },
    )
}

try {
    listenToVersionChanges()
} catch (e) {
    console.error(e)
    TrackingService.captureException(e)
}
