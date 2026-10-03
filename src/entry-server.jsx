import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

// Used at build time only: turns the whole page into plain HTML.
export const render = () =>
  renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
