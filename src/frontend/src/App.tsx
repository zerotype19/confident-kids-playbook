import { AuthProvider } from "../contexts/AuthContext"

export default function App() {
  console.log("✅ App.tsx stripped render")
  return (
    <AuthProvider>
      <div style={{ padding: "2rem", fontSize: "24px", color: "blue" }}>
        ✅ AuthProvider render test
      </div>
    </AuthProvider>
  )
} 