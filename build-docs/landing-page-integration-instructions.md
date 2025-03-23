# 🏠 Landing Page Integration Instructions (React + Vite + Cloudflare Pages)

This guide explains how to properly set up and display the Confident Kids Playbook landing page using the existing Vite + React structure. We are NOT injecting any UI via `index.html` — all content must flow through React Router.

---

## ✅ 1. Do NOT Modify `index.html` or `main.tsx`

These two files are only responsible for bootstrapping the app:

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Confident Kids Playbook</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**src/main.tsx**
```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

✅ Leave both files untouched.

---

## ✅ 2. Use React Router to Display the Landing Page

In `src/App.tsx`, ensure the route `/` renders your landing page:

```tsx
import HomePage from './pages/HomePage'

<Route path="/" element={<HomePage />} />
```

---

## ✅ 3. Build the `<HomePage />` Component

In `HomePage.tsx`, implement the following logic:

```tsx
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const HomePage = () => {
  const { user } = useAuth()

  if (user?.authenticated) {
    return <Navigate to="/dashboard" />
  }

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Build Your Child’s Confidence — One Day at a Time</h1>
      <ul className="mb-6 text-left max-w-md mx-auto space-y-2">
        <li>✅ Daily parent/child confidence-building challenges</li>
        <li>✅ Interactive practice modules</li>
        <li>✅ Journaling and reflection tools</li>
        <li>✅ Visual progress and streak tracking</li>
        <li>✅ Multi-parent family sharing</li>
      </ul>
      <button className="bg-blue-600 text-white px-4 py-2 rounded">Sign in with Google</button>
      {/* Add real sign-in buttons using your auth logic */}
    </div>
  )
}

export default HomePage
```

---

## ✅ 4. Deployment Notes

- Commit all changes to the `main` branch
- Do **not** deploy manually
- GitHub → Cloudflare will handle all Pages deployment

If Cloudflare does not trigger a redeploy, force it with:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## 🧼 Summary

| File                        | Action                       |
|-----------------------------|------------------------------|
| `index.html`                | Do NOT modify                |
| `main.tsx`                  | Do NOT inject logic here     |
| `App.tsx`                   | Add `<Route path="/" />`     |
| `HomePage.tsx`              | Build public landing page    |

This ensures a clean, scalable, React-router-based landing experience.
