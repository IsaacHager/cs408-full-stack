import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Auth0Provider } from "@auth0/auth0-react"
import { UserProvider } from './context/UserContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-fcw1vz5kbtoha1ev.us.auth0.com"
      clientId="TICFxSdDfZrDIQW7pFfSVKVVXAXpEmoE"
      authorizationParams={{ redirect_uri: window.location.origin }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <UserProvider>
        <App />
      </UserProvider>
    </Auth0Provider>
  </StrictMode>,
)
