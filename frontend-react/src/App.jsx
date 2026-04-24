import React from 'react'
import { createBrowserRouter,createRoutesFromElements,Route,RouterProvider } from 'react-router-dom'
import Layout from './Layout'
import { Home,GoogleCallback,Dashboard,Meeting } from './pages/PageCombiner'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<Layout />}>
            <Route path='' element={<Home />} />
            <Route path='auth/google/callback' element={<GoogleCallback />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='meeting' element={<Meeting />} />
        </Route>
    )
)

const App = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default App