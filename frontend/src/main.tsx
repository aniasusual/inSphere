import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@material-tailwind/react'
import { Provider } from "@components/ui/provider"

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <ThemeProvider>
    <Provider>
      <App />
    </Provider>
  </ThemeProvider>
  // </StrictMode>,
)
