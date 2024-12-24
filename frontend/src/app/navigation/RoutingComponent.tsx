import {Route, Routes} from 'react-router-dom'


export const RoutingComponent = () => (
    <Routes>
        <Route path='*' element={<div> hello </div>} />
    </Routes>
)
