import { AuthProvider } from "./contexts/AuthContext"
import { ChildProvider } from "./contexts/ChildContext"

export default function App(): JSX.Element {
  console.log("✅ App.tsx stripped render")
  return (
    <AuthProvider>
      <ChildProvider>
        <div style={{ padding: "2rem", fontSize: "24px", color: "purple" }}>
          ✅ ChildProvider render test
        </div>
      </ChildProvider>
    </AuthProvider>
  )
} 