/** @type {import('tailwindcss').Config} */
import * as daisyui from 'daisyui'
import * as tailwindAnimate from 'tailwindcss-animate'
import * as colors from 'tailwindcss/colors'

export default {
    darkMode: ['class'],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    safelist: [
        {
            pattern: /(text|bg)-(red|yellow|orange|green|lime)-500/,
        },
    ],
    theme: {
        extend: {
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    1: 'hsl(var(--chart-1))',
                    2: 'hsl(var(--chart-2))',
                    3: 'hsl(var(--chart-3))',
                    4: 'hsl(var(--chart-4))',
                    5: 'hsl(var(--chart-5))',
                },
                water: 'hsl(var(--water))',
            },
            keyframes: {
                crossAnimation: {
                    '0%': { transform: 'translateX(100%) rotate(0deg)' },
                    '25%': { transform: 'translateX(50vw) rotate(180deg)' },
                    '75%': { transform: 'translateX(-100%) rotate(360deg)' },
                    '100%': { transform: 'translateX(100%) rotate(0deg)' },
                },
            },
        },
        colors: {
            ...colors,
            main: {
                50: '#effcfc',
                100: '#d7f5f6',
                200: '#b4ebed',
                300: '#80dce0',
                400: '#3fc1c9',
                500: '#2aa7b0',
                600: '#258795',
                700: '#246d7a',
                800: '#265a64',
                900: '#234c56',
                950: '#12323a',
            },
        },
    },
    daisyui: {
        themes: [
            {
                mytheme: {
                    primary: '#3fc1c9',
                    secondary: '#3F7CC9',
                    accent: '#3FC98C',
                    neutral: '#12323a',
                    'base-100': '#effcfc',
                    info: '#b7f0fe',
                    success: '#00aa6f',
                    warning: '#ffc000',
                    error: '#FECACA',
                },
            },
        ], // TODO add dark theme
    },
    plugins: [daisyui, tailwindAnimate],
}