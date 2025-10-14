# ADR 003: Testing Infrastructure

## Status
Accepted

## Context
The project had no testing infrastructure, making it difficult to catch regressions and ensure code quality. We needed a modern, fast testing solution compatible with Vite and TypeScript.

## Decision
We chose **Vitest** as our testing framework with **React Testing Library** for component testing.

### Tools Selected
- **Vitest**: Modern, Vite-native test runner
- **@testing-library/react**: React component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: DOM implementation for Node.js
- **@vitest/ui**: Optional UI for test visualization

### Configuration
```typescript
// vitest.config.ts
- Environment: jsdom
- Globals: enabled for familiar Jest-like API
- Coverage: v8 provider with 70% threshold
- Setup file: src/test/setup.ts
```

### Test Structure
- Test files: `*.test.tsx` alongside source files
- Setup file: Global test configuration and mocks
- Coverage thresholds: 70% for lines, functions, branches, statements

## Consequences

### Positive
- **Fast**: Vitest is much faster than Jest (Vite-native)
- **Modern**: ESM support, TypeScript out of the box
- **Familiar**: Jest-compatible API, easy migration if needed
- **Developer Experience**: Watch mode, UI, fast feedback
- **CI Ready**: Works great in CI/CD pipelines
- **Coverage**: Built-in coverage with v8

### Negative
- **Ecosystem**: Smaller ecosystem than Jest (but growing)
- **Learning Curve**: Team needs to learn Vitest-specific features

## Scripts Added
```json
{
  "test": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest --coverage"
}
```

## Testing Best Practices
1. **Test behavior, not implementation**
2. **Use React Testing Library queries by priority** (getByRole > getByLabelText > getByText)
3. **Test accessibility** (proper roles, labels, aria attributes)
4. **Mock external dependencies** (APIs, window objects)
5. **Keep tests focused** (one concept per test)

## Coverage Thresholds
Set at 70% to encourage testing without being overly strict initially:
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## Initial Tests
Created comprehensive tests for:
1. **ErrorBoundary**: 6 tests covering all scenarios
2. **Loading Components**: 14 tests covering all variants and accessibility

## Alternatives Considered
1. **Jest**: Rejected - slower, requires more configuration with Vite
2. **No testing**: Rejected - critical for code quality and confidence
3. **Cypress only**: Rejected - need unit tests too, not just E2E

## Future Enhancements
- [ ] E2E tests with Playwright or Cypress
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Increase coverage thresholds gradually

## References
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- Test files: `src/components/common/*.test.tsx`
