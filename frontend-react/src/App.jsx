import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout'
import { Home, GoogleCallback, Dashboard, Meeting, Login, MeetingDetail, MyRsvp, Rsvp } from './pages/PageCombiner'
import PrivateRoute from './routes/PrivateRoute'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<Layout />}>
            <Route path='' element={<Home />} />
            <Route path='login' element={<Login />} />
            <Route path='auth/google/callback' element={<GoogleCallback />} />
            <Route path='dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path='meeting' element={<PrivateRoute><Meeting /></PrivateRoute>} />
            <Route path='meeting/:id' element={<PrivateRoute><MeetingDetail /></PrivateRoute>} />
            <Route path='my-rsvp' element={<PrivateRoute><MyRsvp /></PrivateRoute>} />
            <Route path='rsvp/:id' element={<PrivateRoute><Rsvp /></PrivateRoute>} />
        </Route>
    )
)

const App = () => {
    return (
        <RouterProvider router={router} />
    )
}

export default App