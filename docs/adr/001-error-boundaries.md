# ADR 001: Error Boundaries Implementation

## Status
Accepted

## Context
The application lacked error handling at the component level, meaning that any JavaScript error in the component tree would crash the entire application and show a blank screen to users.

## Decision
We implemented React Error Boundaries at multiple levels:
1. **Global Error Boundary**: Wraps the entire application
2. **Router Error Boundary**: Wraps the routing layer
3. **Route-Level Error Boundary**: Wraps the Routes component

### Implementation Details
- Created reusable `ErrorBoundary` component using React class component
- Provides default fallback UI in Hebrew (RTL)
- Supports custom fallback UI via props
- Includes "Try Again" functionality to reset error state
- Includes "Reload Page" as fallback option
- Shows error details in development mode only
- Provides `onError` callback for custom error logging
- Ready for integration with error reporting services (Sentry, etc.)

## Consequences

### Positive
- **Graceful Degradation**: Errors no longer crash the entire app
- **Better UX**: Users see helpful error messages instead of blank screens
- **Debugging**: Error details shown in development
- **Recovery**: Users can attempt to recover without full page reload
- **Flexibility**: Custom fallback UI can be provided per use case
- **Production Ready**: Prepared for error tracking services

### Negative
- **Class Components**: Required use of class component (Error Boundaries don't work with hooks yet)
- **Minimal Overhead**: Slight performance overhead from error catching

## Alternatives Considered
1. **react-error-boundary library**: Decided to implement custom solution for full control and smaller bundle size
2. **Single global boundary**: Rejected in favor of multiple boundaries for better granularity
3. **Function component with hooks**: Not possible - Error Boundaries require class components

## Testing
- Unit tests verify error boundary catches errors
- Tests verify fallback UI renders correctly
- Tests verify custom fallback prop works
- Tests verify onError callback is called
- Tests verify reset functionality

## References
- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- Tests: `src/components/common/ErrorBoundary.test.tsx`
