import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom'

import {GlobalContext} from './context/GlobalContext.jsx'
import { CardContext } from './context/CardContext.jsx'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <GlobalContext>
    <CardContext>
    <App />
    </CardContext>
    </GlobalContext>
  </BrowserRouter>
)
