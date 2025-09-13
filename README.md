# Donny Hub - User Dashboard

A comprehensive user dashboard built with Next.js 15, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Dashboard Overview**: Live preview with browser simulation, logs, and chat
- **Project Management**: Create and manage projects with detailed analytics  
- **AI Agents**: Build, configure, and deploy AI agents with custom tools
- **Task Management**: Assign and track tasks across agents
- **Terminal Interface**: Direct AI provider connections and command execution
- **Memory System**: Persistent storage with verification workflows
- **YouTube Processor**: Video content analysis and processing
- **Activity Tracking**: Real-time activity monitoring and logs
- **Marketplace**: Browse and install agent templates and tools
- **Analytics Dashboard**: Performance insights and usage statistics
- **Settings Hub**: Profile, workspace, notifications, API keys, and website credentials
- **Billing Management**: Subscription and usage tracking

## 🛠 Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI component library
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **Recharts** - Data visualization

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css           # Global styles and design tokens
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx            # Landing page
│   └── user/
│       ├── layout.tsx      # Dashboard layout with sidebar
│       ├── page.tsx        # Dashboard home
│       ├── projects/       # Projects management
│       ├── agents/         # AI agents configuration  
│       ├── tasks/          # Task management
│       ├── terminal/       # Terminal interface
│       ├── memory/         # Memory system
│       ├── youtube/        # YouTube processor
│       ├── activity/       # Activity tracking
│       ├── marketplace/    # Agent marketplace
│       ├── analytics/      # Analytics dashboard
│       ├── settings/       # Settings hub
│       └── billing/        # Billing management
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── chat/              # Global chat system
│   └── theme/             # Theme providers
├── hooks/                  # Custom React hooks
└── lib/
    └── utils.ts           # Utility functions
```

## 🎨 Design System

The project uses a comprehensive design system built on HSL color tokens:

- **Semantic Colors**: Primary, secondary, accent, muted variants
- **Gradients**: Beautiful gradient combinations for enhanced UI
- **Shadows**: Elegant shadow system with glow effects  
- **Animations**: Smooth transitions and hover effects
- **Typography**: Consistent text sizing and spacing
- **Components**: Fully customizable shadcn/ui components

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm/bun

### Installation

1. **Clone or copy the project files**

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or  
pnpm install
# or
bun install
```

3. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Integration Guide

### Converting from React/Vite to Next.js

This project provides both the current React/Vite structure and Next.js 15 conversion files:

**Current Structure (React/Vite):**
- `src/pages/` - Current page components
- `src/main.tsx` - React entry point
- `vite.config.ts` - Vite configuration

**Next.js Structure:**
- `src/app/` - Next.js App Router pages
- `src/app/layout.tsx` - Root layout
- `next.config.js` - Next.js configuration

### Adding to Existing Next.js Project

1. **Copy source files** to your existing project
2. **Install dependencies** from package.json
3. **Update your tailwind.config.ts** with the provided configuration
4. **Copy globals.css** design tokens to your styles
5. **Add the user routes** to your app directory

### Key Components

- **DashboardLayout**: Main layout with sidebar navigation
- **GlobalChat**: Floating chat widget (bottom-right)
- **HelpSystem**: Draggable blue help bubble
- **CommandBar**: Quick action command palette
- **ThemeProvider**: Dark/light mode support

## 📱 Features Overview

### Dashboard Home
- Live preview with browser simulation
- Real-time logs and network monitoring  
- Integrated chat interface
- Quick action buttons

### Agent Management
- Create and configure AI agents
- Tool and model selection
- Scheduling and automation
- Performance monitoring

### Task System  
- Task creation and assignment
- Progress tracking
- Priority management
- Agent coordination

### Memory System
- Raw data import
- Verification workflows
- Persistent storage
- Export capabilities

### Settings Hub
- Profile management
- Workspace configuration
- API key management
- Website credential testing
- Notification preferences

## 🎯 Mock Interactions

All interactive elements include proper feedback:
- **Toast notifications** for user actions
- **Loading states** for async operations  
- **Form validation** with error handling
- **Mock API responses** for demonstration
- **File downloads** for exports
- **Connection testing** with random results

## 🔄 Customization

### Theme Customization
Update `src/app/globals.css` to modify:
- Color palette (HSL values)
- Gradients and shadows
- Animation timings
- Component styling

### Component Variants
Extend shadcn/ui components by:
- Adding new variants to component definitions
- Using design system tokens
- Maintaining accessibility standards
- Following consistent patterns

### Layout Modifications
Customize layouts by:
- Adjusting sidebar navigation
- Modifying header content
- Adding new global widgets
- Changing responsive breakpoints

## 📄 License

This project is provided as-is for demonstration purposes. Adapt and modify as needed for your use case.

## 🤝 Contributing

This is a demonstration project. For production use:
1. Replace mock data with real API calls
2. Add proper authentication
3. Implement backend integrations  
4. Add comprehensive testing
5. Optimize for production deployment

---

**Note**: This project uses mock data and client-side interactions for demonstration. In a production environment, integrate with your preferred backend services and APIs.
