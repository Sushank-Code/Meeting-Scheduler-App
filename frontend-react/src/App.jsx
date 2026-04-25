import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout'
import { Home, GoogleCallback, Dashboard, Meeting } from './pages/PageCombiner'
import PrivateRoute from './routes/PrivateRoute'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<Layout />}>
            <Route path='' element={<Home />} />
            <Route path='auth/google/callback' element={<GoogleCallback />} />
            <Route path='dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path='meeting' element={<PrivateRoute><Meeting /></PrivateRoute>} />
        </Route>
    )
)

const App = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default App