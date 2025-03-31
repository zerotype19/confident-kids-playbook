import { AuthProvider } from "./contexts/AuthContext"
import { ChildProvider } from "./contexts/ChildContext"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/HomePage"
import OnboardingPage from "./pages/OnboardingPage"
import DashboardPage from "./pages/DashboardPage"
import AllChallengesPage from "./pages/AllChallengesPage"
import { PrivateRoute } from "./components/PrivateRoute"

export default function App(): JSX.Element {
  console.log("✅ App.tsx render")
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
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/all-challenges" 
              element={
                <PrivateRoute>
                  <AllChallengesPage />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ChildProvider>
    </AuthProvider>
  )
} 