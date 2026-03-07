import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './app/router'
import { AppStoreProvider } from './state/store'
import './styles/app.css'

function App() {
  return (
    <AppStoreProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppStoreProvider>
  )
}

export default App
