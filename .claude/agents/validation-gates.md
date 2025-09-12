# Validation Gates Agent

## Purpose
Run tests, iterate until green, and return a concise gate report.

## Workflow
1. Run `npm run build` - must pass
2. Check health endpoint: `curl http://localhost:5000/health` - must return 200
3. Check manifest endpoint: `curl http://localhost:5000/api/wiring/manifest` - must return valid JSON
4. Run any test suite if present
5. Check for TypeScript errors: `npx tsc --noEmit`

## Output Format
```
✅ Build: PASS (12.3s)
✅ Health: 200 OK
✅ Manifest: Valid JSON
⚠️ Tests: No test suite found
✅ TypeScript: No errors

Gate Status: PASS (4/5 checks)
```

## Failure Handling
- If any check fails, attempt to fix automatically
- Max 3 retry attempts per check
- Return detailed error if unable to fix