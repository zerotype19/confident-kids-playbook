# 🎨 Tailwind UI Guidelines – Confident Kids Playbook

This app uses **Tailwind CSS ONLY** for all styles, layout, and UI components.

> ❗ DO NOT use Chakra, Bootstrap, or any other UI framework or component library.

---

## ✅ Design Style Principles

| Element           | Style                              |
|-------------------|-------------------------------------|
| 🧒 Audience       | Parents of young kids (ages 3–9)    |
| 🎨 Tone           | Soft, neutral, encouraging          |
| 🧼 Aesthetic       | Clean, informal, warm               |
| 📱 Responsiveness | Must look great on mobile first     |

---

## 🧱 Layout Rules

- Use `flex`, `grid`, or `stacked` layouts
- Responsive with `sm:`, `md:`, `lg:` Tailwind prefixes
- Containers: `max-w-screen-sm`, `p-4`, `m-auto`, `rounded-xl`

---

## ✍️ Typography

- Headers: `text-xl`, `text-2xl`, `font-semibold`
- Body: `text-base`, `text-sm`, `leading-relaxed`
- Tips/dialogue: `text-sm italic text-gray-500`

---

## 🎨 Colors

Use **soft, neutral colors**:
- Backgrounds: `bg-gray-50`, `bg-white`, `bg-sky-50`
- Text: `text-gray-800`, `text-gray-600`
- Buttons: `bg-indigo-500`, `bg-blue-400`, `bg-yellow-400` with hover states
- Success: `text-green-600`, `bg-green-100`
- Warnings: `text-red-600`, `bg-red-100`

---

## 🖱️ Interactions

- Buttons: `rounded-xl px-4 py-2`, hover/focus states
- Forms: `border rounded-md p-2`, labels `block text-sm mb-1`
- Icons: Use emojis or inline SVG, not icon libraries

---

## 🛑 Prohibited

- No Chakra UI
- No Material UI
- No Bootstrap
- No component kits or Tailwind UI presets

---

## 🧪 Mobile Responsiveness

- Every screen must scale to `sm` viewports and use `min-w-0`, `overflow-hidden`, or `grid-cols-1`
- Consider `overflow-scroll` for dashboard cards, lists, etc.

---

## 🧘 Brand Personality

- Confident
- Friendly
- Calm
- Supportive

Every screen should feel like it supports a parent, not overwhelms them.

