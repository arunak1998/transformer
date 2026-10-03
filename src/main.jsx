import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import 'katex/dist/katex.min.css'
import './styles.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// The production build ships pre-rendered HTML (see prerender.js), so React
// attaches to it. In `npm run dev` the root is empty, so it renders from scratch.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
