# Deployment Guide - Donny Hub Next.js

This guide covers deployment options for the Donny Hub dashboard built with Next.js 15.

## 🚀 Deployment Platforms

### Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications:

1. **Push to GitHub/GitLab/Bitbucket**
2. **Import project to Vercel**
3. **Configure build settings** (auto-detected)
4. **Deploy**

**Build Command:** `npm run build`  
**Output Directory:** `.next`  
**Install Command:** `npm install`

### Netlify

Deploy to Netlify with these settings:

**Build Command:** `npm run build`  
**Publish Directory:** `out`  
**Build Settings:**
```
npm install && npm run build
```

Add to `next.config.js` for static export:
```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true }
}
```

### Traditional Hosting

For traditional hosting providers:

1. **Build the project:**
```bash
npm run build
```

2. **Export static files:**
```bash
npx next export
```

3. **Upload the `out` folder** to your hosting provider

## 🔧 Environment Variables

Create `.env.local` for local development:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Donny Hub"
```

For production, set these in your deployment platform:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME="Donny Hub"
```

## 📝 Build Optimization

### Performance Tips

1. **Enable compression** in `next.config.js`:
```javascript
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false
}
```

2. **Optimize images** using Next.js Image component:
```tsx
import Image from 'next/image'
// Replace <img> tags with <Image> components
```

3. **Bundle analysis:**
```bash
npm install --save-dev @next/bundle-analyzer
```

Add to `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

Run analysis:
```bash
ANALYZE=true npm run build
```

## 🔒 Security Considerations

### Content Security Policy

Add to `next.config.js`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
          }
        ]
      }
    ]
  }
}
```

### Environment Security

Never expose sensitive data in `NEXT_PUBLIC_*` variables:

**✅ Safe:**
```env
NEXT_PUBLIC_APP_NAME="Donny Hub"
NEXT_PUBLIC_THEME="default"
```

**❌ Dangerous:**
```env
NEXT_PUBLIC_API_KEY="secret-key"  # DON'T DO THIS
NEXT_PUBLIC_DATABASE_URL="..."   # DON'T DO THIS
```

## 📊 Monitoring & Analytics

### Built-in Analytics

Enable Next.js Analytics:
```javascript
// next.config.js
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  }
}
```

### Performance Monitoring

Add performance monitoring:
```tsx
// _app.tsx or layout.tsx
export function reportWebVitals(metric) {
  console.log(metric)
  // Send to analytics service
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  donny-hub:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    restart: unless-stopped
```

## 🔍 Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**
```bash
# Skip type checking during build
npm run build -- --no-lint
```

**Static export issues:**
```javascript
// next.config.js - Remove dynamic features
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true
}
```

**Routing problems after deployment:**
- Check `basePath` in `next.config.js`
- Verify trailing slashes configuration
- Ensure proper redirects are set up

### Performance Issues

**Large bundle size:**
```bash
# Analyze bundle
ANALYZE=true npm run build

# Use dynamic imports
const Component = dynamic(() => import('./Component'))
```

**Slow build times:**
```javascript
// next.config.js - Optimize builds
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*']
  }
}
```

## 📈 Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Error pages customized (404, 500)  
- [ ] SEO metadata added to all pages
- [ ] Analytics and monitoring setup
- [ ] Security headers configured
- [ ] Performance optimizations applied
- [ ] Accessibility compliance verified
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility checked
- [ ] SSL certificate configured