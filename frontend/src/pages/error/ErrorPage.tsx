export const ErrorPage = () => (
    <div className='flex h-full flex-col items-center justify-center'>
        <h1 className='text-4xl font-bold'>Something went wrong</h1>
        <p className='text-lg'>We are sorry, an error occurred. Please try again later or email us at </p>
        <a href='mailto:info@boothbits.com' className='text-blue-500'>
            info@boothbits.com
        </a>
    </div>
)
