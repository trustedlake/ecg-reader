import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider, ExamDraftProvider } from 'shared'
import { webStorageAdapter } from './platform/storage'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider storage={webStorageAdapter} apiBaseUrl={import.meta.env.VITE_API_BASE_URL as string}>
        <ExamDraftProvider>
          <App />
        </ExamDraftProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)