import React from 'react'

import { FeatureCard } from './FeatureCard'

export const Features = () => {
    return (
        <div className='grid gap-8 md:grid-cols-3'>
            <FeatureCard
                title='Premium Comfort'
                description='Spacious rooms and premium bedding for your furry friend'
            />
            <FeatureCard
                title='24/7 Care'
                description='Professional staff available around the clock'
            />
            <FeatureCard
                title='Daily Activities'
                description='Engaging playtime and supervised activities'
            />
        </div>
    )
}