import AuthContextProvider from './AuthContextProvider'
import MeetingContextProvider from './MeetingContextProvider'
import ParticipantContextProvider from './ParticipantContextProvider'

const ContextCombiner = ({ children }) => {
  return (
    <AuthContextProvider>
      <MeetingContextProvider>
        <ParticipantContextProvider>
          {children}
        </ParticipantContextProvider>
      </MeetingContextProvider>
    </AuthContextProvider>
  )
}

export default ContextCombiner