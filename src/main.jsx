import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { SupabaseProvider } from './context/SupabaseContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SupabaseProvider>
        <AuthProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </SupabaseProvider>
    </BrowserRouter>
  </StrictMode>,
)