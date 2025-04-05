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
import ManageChildrenPage from "./pages/ManageChildrenPage"
import { ManageProfilePage } from "./pages/ManageProfilePage"
import PlaybookPage from "./pages/PlaybookPage"
import SuccessPage from "./pages/SuccessPage"
import CancelPage from "./pages/CancelPage"
import AboutPage from "./pages/AboutPage"
import PrivacyPolicyPage from "./pages/PrivacyPolicy"
import TermsOfServicePage from "./pages/TermsOfService"
import OurStoryPage from "./pages/OurStory"
import TeamPage from "./pages/Team"
import SupportPage from "./pages/Support"
import FeedbackPage from "./pages/Feedback"
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
            <Route path="/playbook" element={<PlaybookPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<CancelPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/our-story" element={<OurStoryPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
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
            <Route 
              path="/manage-children" 
              element={
                <PrivateRoute>
                  <PageWrapper />
                </PrivateRoute>
              } 
            >
              <Route index element={<ManageChildrenPage />} />
            </Route>
            <Route 
              path="/manage-profile" 
              element={
                <PrivateRoute>
                  <PageWrapper />
                </PrivateRoute>
              } 
            >
              <Route index element={<ManageProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ChildProvider>
    </AuthProvider>
  )
} 