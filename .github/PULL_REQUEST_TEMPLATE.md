## Description
<!-- What does this PR do? Why is it needed? -->

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor (no behavior change)
- [ ] Documentation
- [ ] Tests

## Checklist
- [ ] Tests added/updated and passing (`npm test -- --no-coverage --forceExit --runInBand`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] `prisma generate` run if `schema.prisma` was changed
- [ ] No `prisma` imported directly in route handlers (use services)
- [ ] DELETE routes return 204 with no body
- [ ] New API routes validate input with Zod and check `session?.user?.id`
- [ ] Client components are marked `"use client"`
- [ ] Expensive calculations in client components wrapped in `useMemo`

## Related issues
<!-- Closes #XXX -->
