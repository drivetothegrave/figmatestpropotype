import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import TestPreview from './preview/TestPreview.tsx'
import './index.css'

const isTest = window.location.hash === '#test' || window.location.pathname === '/test'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isTest ? <TestPreview /> : <App />}
  </React.StrictMode>,
)
