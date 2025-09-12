# Prep Parallel Command

## Purpose
Prepare N git worktrees for parallel branch development.

## Arguments
- `count`: Number of worktrees to create (default: 3)
- `prefix`: Branch name prefix (default: "parallel")

## Steps
1. Create worktree directory: `mkdir -p .worktrees`
2. For each worktree (1 to N):
   - Create worktree: `git worktree add .worktrees/<prefix>-<n> -b <prefix>-<n>`
   - Copy necessary config files
   - Install dependencies in each worktree

## Output
List of created worktrees with paths and branch names.