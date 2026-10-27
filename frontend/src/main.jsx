import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider, useApp } from '@/context/AppContext'
import App from './App.jsx'
import './index.css'

function ThemedToaster() {
  const { state } = useApp()
  return (
    <Toaster
      position="bottom-right"
      theme={state.theme}
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
        },
      }}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
        <ThemedToaster />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>
)
