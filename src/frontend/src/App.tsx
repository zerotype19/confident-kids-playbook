import { AuthProvider } from "./contexts/AuthContext"
import { ChildProvider } from "./contexts/ChildContext"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/HomePage"
import OnboardingPage from "./pages/OnboardingPage"
import DashboardPage from "./pages/DashboardPage"
import AllChallengesPage from "./pages/AllChallengesPage"
import PillarsPage from "./pages/PillarsPage"
import PillarDetailPage from "./pages/PillarDetailPage"
import RewardsPage from "./pages/RewardsPage"
import { PrivateRoute } from "./components/PrivateRoute"
import PageWrapper from "./components/PageWrapper"

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
                  <PageWrapper />
                </PrivateRoute>
              } 
            >
              <Route index element={<DashboardPage />} />
            </Route>
            <Route 
              path="/pillars" 
              element={
                <PrivateRoute>
                  <PageWrapper />
                </PrivateRoute>
              } 
            >
              <Route index element={<PillarsPage />} />
              <Route path=":pillarId" element={<PillarDetailPage />} />
            </Route>
            <Route 
              path="/all-challenges" 
              element={
                <PrivateRoute>
                  <PageWrapper />
                </PrivateRoute>
              } 
            >
              <Route index element={<AllChallengesPage />} />
            </Route>
            <Route 
              path="/rewards" 
              element={
                <PrivateRoute>
                  <PageWrapper />
                </PrivateRoute>
              } 
            >
              <Route index element={<RewardsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ChildProvider>
    </AuthProvider>
  )
} 