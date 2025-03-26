
# Frontend Guidelines – Confident Kids Playbook

## Design System

The app should feel simple, warm, and informal—designed for busy parents. It should avoid corporate or cold aesthetics in favor of a supportive and friendly interface. The interface should prioritize clarity, ease of use, and gentle encouragement.

## Typography

- **Primary Font:** System fonts (e.g., `sans-serif`, `-apple-system`, `Segoe UI`, `Roboto`)
- **Style:** Clean and legible, with a focus on comfort and accessibility
- **Headings:** Slightly larger with increased weight
- **Body text:** Relaxed line spacing and comfortable margins

## Color Palette

- **Primary Soft Blue** (`#AECDF3`) – calming and inviting
- **Secondary Warm Yellow** (`#FFF2B2`) – friendly and energetic
- **Light Gray** (`#F5F5F5`) – background fill
- **Slate Gray** (`#4A4A4A`) – primary text
- **Accent Green** (`#B7E4C7`) – positive feedback/success
- **Error Red** (`#F7A6A6`) – input errors and alerts

Note: All colors should pass accessibility contrast checks for AA compliance when used for text or interactive elements.

## Layout & Spacing

- Built using **Tailwind CSS**
- Consistent spacing scale (e.g., `p-4`, `mt-6`, `gap-2`)
- Layouts should default to **single column mobile-first**
- Centered content with safe padding on mobile (`px-4`, `max-w-md`, `mx-auto`)
- Avoid overly dense UIs — aim for breathable layouts

## Components

Avoid component libraries like Bootstrap, Material UI, or Chakra. All components should be handcrafted using Tailwind utility classes. Components include:

- **Button:** Rounded, minimal shadow, subtle hover effects
- **Card:** Light drop shadow (`shadow-md`), rounded corners, white background
- **Form Inputs:** Rounded inputs (`rounded-md`), subtle focus rings
- **Modals:** Slide-up on mobile, center screen on desktop
- **Calendar View:** Grid layout with minimal labeling, soft highlights for completed days
- **Journal Entry Blocks:** Timestamp, optional photo, text box styled like a message bubble

## Iconography

- Use [Heroicons](https://heroicons.com/) (free MIT-licensed set)
- Keep icons minimal and consistent in size (`w-5 h-5`)
- Do not use emojis or decorative icon sets

## Animations

- Use Tailwind’s built-in transitions (`transition-opacity`, `duration-200`)
- Subtle feedback only — avoid jarring animations
- Soft fade in/out for modals, loading states

## Responsiveness

- Mobile-first; all layouts must work well on 375px width screens
- Use Tailwind responsive utilities (`md:`, `lg:`) for scaling
- Avoid fixed pixel widths; prefer `max-w`, `w-full`, and flex/grid

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML (`button`, `label`, `input`, `section`)
- Aria attributes where appropriate (`aria-label`, `aria-hidden`)
- Sufficient color contrast for all text and buttons
