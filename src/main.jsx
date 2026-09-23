import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import { DataProvider } from './hooks/useData'
import './index.css'
import './fonts.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

import '@fontsource/metropolis/latin-400.css'
import '@fontsource/metropolis/latin-500.css'
import '@fontsource/metropolis/latin-600.css'
import '@fontsource/metropolis/latin-700.css'
import '@fontsource/birthstone/latin-400.css'
