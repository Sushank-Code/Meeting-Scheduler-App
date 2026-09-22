import { useState, useEffect, useContext, createContext } from 'react'
import { getMeeting, createMeeting } from '../services/meetingApi'

const MeetingContext = createContext()

const MeetingContextProvider = ({ children }) => {

  const [meeting, setMeeting] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // get
  const MeetingGet = async () => {
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
    MeetingGet()
  }, [])

  // post
  const MeetingPost = async (meetingdata) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createMeeting(meetingdata)
      setMeeting((prev) => [...prev, response?.data]);
      return response?.data
    } catch (error) {
      const data = error.response?.data
      // console.log(data)
      setError(data?.non_field_errors?.[0] || data?.detail || 'Failed to create meeting')
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