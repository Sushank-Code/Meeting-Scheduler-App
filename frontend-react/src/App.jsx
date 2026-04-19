import React from 'react'
import { createBrowserRouter,createRoutesFromElements,Route,RouterProvider } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home/Home'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<Layout />}>
            <Route path='' element={<Home />} />
            <Route path='Hello' element={<Home />} />
        </Route>
    )
)

const App = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default App