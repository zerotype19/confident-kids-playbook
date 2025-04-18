import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./frontend/src/App"
import './index.css';


console.log("✅ main.tsx loaded");

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Failed to find the root element")

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
