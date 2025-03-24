import React from "react"

const HomePage: React.FC = () => {
  console.log("✅ HomePage mounted (bare)")
  return (
    <div style={{ padding: "2rem", fontSize: "24px", color: "green" }}>
      ✅ Minimal HomePage render successful
    </div>
  )
}

export default HomePage 