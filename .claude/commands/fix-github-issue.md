# Fix GitHub Issue Command

## Arguments
- `issue_number`: GitHub issue number to fix

## Workflow
1. Fetch issue details: `gh issue view <issue_number>`
2. Parse issue description and requirements
3. Create feature branch: `git checkout -b fix/issue-<issue_number>`
4. Implement the fix based on issue requirements
5. Run validation gates agent
6. If gates pass, commit with message referencing issue
7. Push branch and create PR: `gh pr create --title "Fix #<issue_number>: <title>" --body "..."`

## PR Body Template
```markdown
Fixes #<issue_number>

## Changes
- <list of changes>

## Wiring Readiness
- Health endpoint: 200 OK
- Manifest endpoint: Valid JSON
- Build status: PASS
- TypeScript: No errors

## Testing
<curl outputs or test results>
```