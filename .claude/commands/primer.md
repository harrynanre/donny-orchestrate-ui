# Primer Command

## Purpose
Prime context by reading key files and understanding the project structure.

## Steps
1. Display directory tree: `tree -L 2 -I 'node_modules|.next|dist'`
2. Read `CLAUDE.md` for global rules
3. Read `README.md` for project overview
4. Scan `src/app` structure to understand pages
5. Locate and read `/health` route: `src/app/health/route.ts`
6. Locate and read manifest route: `src/app/api/wiring/manifest/route.ts`
7. Check package.json scripts and dependencies
8. Identify current port configuration

## Output
Brief summary of:
- Project structure
- Available pages/routes
- Health endpoint status
- Manifest structure
- Port configuration
- Key dependencies