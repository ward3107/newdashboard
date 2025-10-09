# ADR 002: Loading States and Skeletons

## Status
Accepted

## Context
The application used React.lazy for code splitting but lacked proper loading states. Users experienced blank screens while components loaded, and there was no feedback during data fetching operations.

## Decision
We implemented comprehensive loading components with proper accessibility:
1. **Loading Component**: Full-screen and inline variants with spinner
2. **Skeleton Component**: Generic placeholder for any content
3. **CardSkeleton**: Specific skeleton for card components
4. **TableSkeleton**: Specific skeleton for table components

### Implementation Details
- All loading components include proper ARIA attributes (`aria-busy`, `aria-live`, `role="status"`)
- Screen reader text provided via `.sr-only` class
- Animated pulse effect for skeletons
- Customizable sizing (sm, md, lg)
- Support for both full-screen and inline display
- RTL-compatible

### Integration
- Wrapped lazy-loaded routes with `<Suspense fallback={<Loading />}>`
- Replaced generic loading spinner with accessible `Loading` component
- Ready to use in data fetching components

## Consequences

### Positive
- **Accessibility**: Proper ARIA attributes for screen readers
- **Better UX**: Users see animated placeholders instead of blank screens
- **Performance Perception**: Skeleton UI makes load times feel faster
- **Reusability**: Multiple skeleton types for different use cases
- **Consistency**: Unified loading experience across the app

### Negative
- **Bundle Size**: Minor increase due to loading components
- **Maintenance**: Need to maintain skeleton layouts matching actual components

## Alternatives Considered
1. **Simple spinners only**: Rejected - less engaging and informative
2. **Third-party skeleton library**: Rejected - custom solution provides better control and smaller size
3. **Shimmer effect**: Implemented pulse animation as simpler alternative

## Accessibility Features
- `role="status"` for assistive technologies
- `aria-busy="true"` to indicate loading state
- `aria-live="polite"` for dynamic updates
- Screen reader text via `.sr-only`
- `aria-hidden="true"` on decorative elements

## Testing
- Unit tests verify all props and variants work
- Tests verify accessibility attributes present
- Tests verify screen reader text included
- Tests verify different skeleton counts and sizes

## References
- Tests: `src/components/common/Loading.test.tsx`
- [ARIA: status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role)
- [React Suspense Documentation](https://react.dev/reference/react/Suspense)
