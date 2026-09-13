import AuthContextProvider from './AuthContextProvider'

const ContextCombiner = ({children}) => {
  return (
    <AuthContextProvider>
      {children}
    </AuthContextProvider>
  )
}

export default ContextCombiner