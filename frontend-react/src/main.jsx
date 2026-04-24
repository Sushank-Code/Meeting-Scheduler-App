import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ContextCombiner from './context/ContextCombiner.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContextCombiner>
      <App />
    </ContextCombiner>
  </StrictMode>,
)
