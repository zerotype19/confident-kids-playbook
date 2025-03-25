import { AuthProvider } from "./contexts/AuthContext"
import { ChildProvider } from "./contexts/ChildContext"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import OnboardingPage from "./pages/OnboardingPage"
import { PrivateRoute } from "./components/PrivateRoute"

export default function App(): JSX.Element {
  console.log("✅ App.tsx stripped render")
  return (
    <AuthProvider>
      <ChildProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/onboarding" 
              element={
                <PrivateRoute>
                  <OnboardingPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/onboarding/child" 
              element={
                <PrivateRoute>
                  <OnboardingPage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </ChildProvider>
    </AuthProvider>
  )
} 