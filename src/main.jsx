import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import { AuthProvider, getGoogleClientId } from './context/AuthContext.jsx'
import './index.css'

// Google OAuth client_id 는 .env.local 의 VITE_GOOGLE_CLIENT_ID 로 주입.
// 미설정 시 GoogleOAuthProvider 는 빈 문자열로도 동작은 하지만 실제 버튼은 작동하지 않음 →
// Login 페이지에서 testmode fallback 안내 출력.
const clientId = getGoogleClientId()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={clientId}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
