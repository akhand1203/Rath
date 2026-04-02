import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'
import UserContext from './context/UserContext.jsx'
import CaptainContext from './context/CaptainContext.jsx'
import SocketContext from './context/SocketContext.jsx'
import axiosInstance from './utils/axiosInstance.js'

// Initialize axios interceptor
console.log('🔧 Initializing axios interceptor');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SocketContext>
      <CaptainContext>
        <UserContext>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UserContext>
      </CaptainContext>
    </SocketContext>
 </StrictMode>
)
