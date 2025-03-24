import { AuthProvider } from "./contexts/AuthContext"
import { ChildProvider } from "./contexts/ChildContext"
import { BrowserRouter, Routes, Route } from "react-router-dom"

export default function App(): JSX.Element {
  console.log("✅ App.tsx stripped render")
  return (
    <AuthProvider>
      <ChildProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <div style={{ padding: "2rem", fontSize: "24px", color: "teal" }}>
                  ✅ Routing test render
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </ChildProvider>
    </AuthProvider>
  )
} 