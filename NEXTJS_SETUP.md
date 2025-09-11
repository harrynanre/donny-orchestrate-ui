# Next.js 15 Conversion Guide

This document provides step-by-step instructions to convert the Donny Hub dashboard from React/Vite to Next.js 15.

## 📋 Prerequisites

- Node.js 18+ installed
- Basic understanding of Next.js App Router

## 🔄 Conversion Steps

### 1. Install Next.js Dependencies

```bash
npm install next@latest @types/node
npm install --save-dev eslint-config-next
```

### 2. Update package.json Scripts

Replace the scripts section in your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint"
  }
}
```

### 3. Update TypeScript Configuration

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4. Create Next.js Configuration

Create `next.config.js` in your project root:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react'],
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = nextConfig
```

### 5. Update File Structure

Move and update files according to Next.js App Router:

**From React/Vite structure:**
```
src/
├── pages/user/Dashboard.tsx
├── pages/user/Settings.tsx
├── main.tsx
└── App.tsx
```

**To Next.js App Router structure:**
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── user/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── settings/
│       │   └── page.tsx
│       └── [...other routes]
├── components/ (unchanged)
├── lib/ (unchanged)
└── hooks/ (unchanged)
```

### 6. Update Routing

Replace React Router navigation:

**Before (React Router):**
```tsx
import { Link, useNavigate } from "react-router-dom"

const navigate = useNavigate()
navigate("/user/settings")

<Link to="/user/agents">My Agents</Link>
```

**After (Next.js):**
```tsx
import Link from "next/link"
import { useRouter } from "next/navigation"

const router = useRouter()
router.push("/user/settings")

<Link href="/user/agents">My Agents</Link>
```

### 7. Convert Page Components

Each page needs to be converted to Next.js page format:

**Before (React component):**
```tsx
// src/pages/user/Settings.tsx
export default function Settings() {
  return <div>Settings content</div>
}
```

**After (Next.js page):**
```tsx
// src/app/user/settings/page.tsx
import Settings from "@/pages/user/Settings"

export const metadata = {
  title: "Settings - Donny Hub",
  description: "Configure your preferences"
}

export default function SettingsPage() {
  return <Settings />
}
```

## 🔧 Key Changes Summary

### Routing
- Replace `react-router-dom` with Next.js App Router
- Convert `<Link to="...">` to `<Link href="...">`
- Replace `useNavigate()` with `useRouter()` from `next/navigation`

### File Organization
- Move pages to `src/app/` directory structure  
- Create `layout.tsx` files for shared layouts
- Add `page.tsx` files for route endpoints

### Imports
- Update component imports to use existing page components
- Keep all existing components and utilities unchanged
- Add Next.js specific imports where needed

### Metadata
- Add `metadata` exports for SEO optimization
- Configure page titles and descriptions
- Implement proper OpenGraph tags

## 🚀 Running the Application

After conversion:

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

## 📝 Additional Notes

- All existing components remain unchanged
- Design system and styling preserved
- Mock data and interactions intact  
- Global chat and help widgets functional
- Responsive design maintained

The conversion maintains full functionality while providing Next.js benefits like:
- Server-side rendering
- Improved SEO
- Better performance
- Enhanced developer experience