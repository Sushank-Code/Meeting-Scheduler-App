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
      setError(error.response?.data?.message || 'Failed to fetch meetings');
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
      const response = await createMeeting(meetingdata)  // axios automatically check status
      setMeeting((prev) => [...prev, response?.data]);
      return response?.data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create meeting');
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