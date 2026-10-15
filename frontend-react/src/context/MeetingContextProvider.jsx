import { useState, useEffect, useContext, createContext } from 'react'
import {
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getSingleMeeting,
  cancelMeetingApi,
  completeMeetingApi,
} from '../services/meetingApi'
import { useAuth } from './AuthContextProvider'

const MeetingContext = createContext()

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data
  return (
    data?.non_field_errors?.[0] ||
    data?.error ||
    data?.detail ||
    error.message ||
    fallback
  )
}

const MeetingContextProvider = ({ children }) => {
  const { isLoggedIn } = useAuth()

  const [meeting, setMeeting] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // single-meeting detail state 
  const [singleMeeting, setSingleMeeting] = useState(null)
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleError, setSingleError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null) // 'cancel' | 'complete' | null

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
      const message = getErrorMessage(error, 'Failed to fetch meeting')
      setError(message)
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

  // update
  const MeetingUpdate = async (id, meetingdata) => {

    setLoading(true);
    setError(null);

    try {
      const response = await updateMeeting(id, meetingdata)
      setMeeting((prev) => prev.map((m) => String(m.meeting_id) === String(id) ? response?.data : m));
      setSingleMeeting((prev) => prev && String(prev.meeting_id) === String(id) ? response?.data : prev);
      return response?.data
    } catch (error) {
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  // delete
  const MeetingDelete = async (id) => {

    setLoading(true);
    setError(null);

    try {
      await deleteMeeting(id)
      setMeeting((prev) => prev.filter((m) => String(m.meeting_id) !== String(id)));
      setSingleMeeting((prev) => prev && String(prev.meeting_id) === String(id) ? null : prev);
    } catch (error) {
      throw error
    }
    finally {
      setLoading(false)
    }
  }

  //  single meeting retrieval 
  const MeetingSingleGet = async (id) => {

    if (!id) return null
    setSingleLoading(true)
    setSingleError(null)

    try {
      const response = await getSingleMeeting(id)
      setSingleMeeting(response?.data)
      setSingleLoading(false)
      setSingleError(null)
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch meeting')
      setSingleError(message)
      setSingleLoading(false)
      setSingleMeeting(null)
      throw error
    } finally {
      setSingleLoading(false)
    }
  }

  const clearSingleMeeting = () => {
    setSingleMeeting(null)
    setSingleError(null)
    setSingleLoading(false)
  }

  // keep the list + detail in sync without forcing callers to refetch
  const syncMeetingStatus = (id, status) => {
    setSingleMeeting((prev) =>
      prev && String(prev.meeting_id) === String(id) ? { ...prev, status } : prev
    )
    setMeeting((prev) =>
      Array.isArray(prev)
        ? prev.map((m) =>
          String(m.meeting_id) === String(id) ? { ...m, status } : m
        )
        : prev
    )
  }

  // cancel meeting 
  const MeetingCancel = async (id) => {
    setActionLoading('cancel')
    try {
      const response = await cancelMeetingApi(id)
      syncMeetingStatus(id, 'cancelled')
      return response?.data
    } finally {
      setActionLoading(null)
    }
  }

  // complete meeting 
  const MeetingComplete = async (id) => {
    setActionLoading('complete')
    try {
      const response = await completeMeetingApi(id)
      syncMeetingStatus(id, 'completed')
      return response?.data
    } finally {
      setActionLoading(null)
    }
  }

  const value = {
    meeting,
    loading,
    error,
    singleMeeting,
    singleLoading,
    singleError,
    actionLoading,
    MeetingGet,
    MeetingPost,
    MeetingUpdate,
    MeetingDelete,
    MeetingSingleGet,
    MeetingCancel,
    MeetingComplete,
    clearSingleMeeting,
  }
  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  )
}

export default MeetingContextProvider
export const useMeeting = () => useContext(MeetingContext)
