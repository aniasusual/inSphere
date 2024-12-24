import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@material-tailwind/react'
import { Provider } from "@components/ui/provider"
import { GlobalProvider } from '@lib/GlobalContext.tsx'
import { Provider as StateProvider } from "react-redux"
import store from './store.ts'


createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <StateProvider store={store}>

    <ThemeProvider>
      <Provider>
        <GlobalProvider>
          <App />
        </GlobalProvider>
      </Provider>
    </ThemeProvider>
  </StateProvider>
  // </StrictMode>,
)
