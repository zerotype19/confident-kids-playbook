import React from "react"

export default function HomePage(): JSX.Element {
  console.log("✅ HomePage mounted (basic)")
  return (
    <div style={{ padding: "2rem", fontSize: "24px", color: "green" }}>
      ✅ HomePage render working
    </div>
  )
} 