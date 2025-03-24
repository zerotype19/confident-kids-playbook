import { AuthProvider } from "./contexts/AuthContext"
import { ChildProvider } from "./contexts/ChildContext"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"

export default function App(): JSX.Element {
  console.log("✅ App.tsx stripped render")
  return (
    <AuthProvider>
      <ChildProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </ChildProvider>
    </AuthProvider>
  )
} 