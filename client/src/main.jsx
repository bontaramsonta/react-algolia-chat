import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

window.log = (label,...a) => console.log(
  `%c${label}`,
  'border: 2px solid blue; padding: 2px',
  ...a
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
