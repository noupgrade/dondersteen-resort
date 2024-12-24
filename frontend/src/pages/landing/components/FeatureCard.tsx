import React from 'react'

interface FeatureCardProps {
    title: string
    description: string
}

export const FeatureCard = ({ title, description }: FeatureCardProps) => (
    <div className='rounded-lg bg-card p-6 shadow-lg transition-transform hover:scale-105'>
        <h3 className='mb-3 text-xl font-semibold text-foreground'>{title}</h3>
        <p className='text-muted-foreground'>{description}</p>
    </div>
)