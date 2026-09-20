import AuthContextProvider from './AuthContextProvider'
import MeetingContextProvider from './MeetingContextProvider'

const ContextCombiner = ({ children }) => {
  return (
    <AuthContextProvider>
      <MeetingContextProvider>
        {children}
      </MeetingContextProvider>
    </AuthContextProvider>
  )
}

export default ContextCombiner