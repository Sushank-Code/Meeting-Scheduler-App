import { useState, useEffect, useContext, createContext } from 'react'
import { getMeeting, createMeeting } from '../services/meetingApi'
import { useAuth } from './AuthContextProvider'

const MeetingContext = createContext()

const MeetingContextProvider = ({ children }) => {
  const { isLoggedIn } = useAuth()

  const [meeting, setMeeting] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // get
  const MeetingGet = async () => {

    if (!localStorage.getItem('access_token')) {
      setMeeting([])
      setLoading(false)
      return
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getMeeting()
      setMeeting(response?.data)
      setLoading(false)
      setError(null)
    } catch (error) {
      const data = error.response?.data
      setError(data?.non_field_errors?.[0] || data?.detail || 'Failed to fetch meetings')
      setLoading(false)
      setMeeting([])   
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      MeetingGet()
    }
  }, [isLoggedIn])

  // post
  const MeetingPost = async (meetingdata) => {

    setLoading(true);
    setError(null);
    
    try {
      const response = await createMeeting(meetingdata)
      setMeeting((prev) => [...prev, response?.data]);
      return response?.data
    } catch (error) {
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  const value = {
    meeting,
    loading,
    error,
    MeetingGet,
    MeetingPost
  }
  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  )
}

export default MeetingContextProvider
export const useMeeting = () => useContext(MeetingContext)
