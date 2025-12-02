import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styling/index.css'
import App from './App.jsx'
import AddAlbum from "./pages/AddAlbum.jsx";
import Dashboard from "./pages/Dashboard.jsx";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
