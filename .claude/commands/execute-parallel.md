# Execute Parallel Command

## Purpose
Execute tasks in parallel across worktrees and collect results.

## Arguments
- `task`: Command or script to run in each worktree

## Steps
1. List all worktrees: `git worktree list`
2. For each worktree (in parallel):
   - Change to worktree directory
   - Execute the task
   - Capture output to `results.md`
3. Aggregate all results
4. Generate summary report

## Output Format
```markdown
# Parallel Execution Report

## Worktree: parallel-1
Status: SUCCESS
Output: <task output>

## Worktree: parallel-2
Status: SUCCESS
Output: <task output>

## Summary
- Total: 3 worktrees
- Success: 3
- Failed: 0
```