import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CartProvider } from './cart/CartContext'
import { MusicProvider } from './music/MusicContext'
import { MusicDock } from './components/MusicDock'
// Self-hosted faces: no third-party font request, and no fallback flash.
import '@fontsource-variable/inter'
import '@fontsource-variable/archivo/wdth.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CartProvider>
      <MusicProvider>
        <App />
        {/* Beside App, not inside it: App swaps whole view trees, and the
            player must survive every navigation to keep the music going. */}
        <MusicDock />
      </MusicProvider>
    </CartProvider>
  </React.StrictMode>
)
