import { useState, useEffect, useContext, createContext } from 'react'
import { getMeeting } from '../services/meetingApi'

const MeetingContext = createContext()

const MeetingContextProvider = ({ children }) => {

  const [meeting, setMeeting] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // get
  const MeetingGet = async () => {
    try {
      const response = await getMeeting()
      setMeeting(response?.data)
      setLoading(false)
      setError(null)
    } catch (error) {
      setError("Error occured")
      setLoading(false)
      setMeeting(null)
    }
  }

  useEffect(() => {
    MeetingGet()
  }, [])

  // post

  const value = {
    meeting,
    loading,
    error,
    MeetingGet,
  }
  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  )
}

export default MeetingContextProvider
export const useMeeting = () => useContext(MeetingContext)