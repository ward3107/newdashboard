import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { trackEvent } from '../utils';

/**
 * Hook for managing loading states with smooth transitions
 */
export function useLoadingState(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
  }, []);

  const stopLoading = useCallback((isSuccess: boolean = true) => {
    setIsLoading(false);
    setSuccess(isSuccess);
    if (isSuccess) {
      setError(null);
    }
  }, []);

  const setLoadingError = useCallback((errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
    setSuccess(false);
    trackEvent('loading_error', { error: errorMessage });
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    isLoading,
    error,
    success,
    startLoading,
    stopLoading,
    setLoadingError,
    reset
  };
}

/**
 * Hook for managing staggered animations
 */
export function useStaggeredAnimation(itemCount: number, delay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    setVisibleItems([]);

    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleItems(prev => [...prev, i]);
      }, i * delay);

      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [itemCount, delay]);

  const isVisible = useCallback((index: number) => {
    return visibleItems.includes(index);
  }, [visibleItems]);

  const resetAnimation = useCallback(() => {
    setVisibleItems([]);
  }, []);

  return {
    isVisible,
    resetAnimation,
    allVisible: visibleItems.length === itemCount
  };
}

/**
 * Hook for managing scroll-triggered animations
 */
export function useScrollAnimation(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          trackEvent('scroll_animation_triggered');
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  return {
    ref,
    isVisible,
    reset: () => setIsVisible(false)
  };
}

/**
 * Hook for managing hover effects with delays
 */
export function useHoverEffect(
  enterDelay: number = 0,
  leaveDelay: number = 0
) {
  const [isHovered, setIsHovered] = useState(false);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }

    if (enterDelay > 0) {
      enterTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
      }, enterDelay);
    } else {
      setIsHovered(true);
    }
  }, [enterDelay]);

  const handleMouseLeave = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }

    if (leaveDelay > 0) {
      leaveTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, leaveDelay);
    } else {
      setIsHovered(false);
    }
  }, [leaveDelay]);

  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isHovered,
    handleMouseEnter,
    handleMouseLeave,
    hoverProps: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  };
}

/**
 * Hook for managing progressive disclosure animations
 */
export function useProgressiveDisclosure(items: any[], interval: number = 200) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  const startRevealing = useCallback(() => {
    if (isRevealing || revealedCount >= items.length) return;

    setIsRevealing(true);
    setRevealedCount(0);

    const revealNext = () => {
      setRevealedCount(prev => {
        const next = prev + 1;
        if (next < items.length) {
          setTimeout(revealNext, interval);
        } else {
          setIsRevealing(false);
        }
        return next;
      });
    };

    setTimeout(revealNext, interval);
    trackEvent('progressive_disclosure_started', { itemCount: items.length });
  }, [items.length, interval, isRevealing, revealedCount]);

  const reset = useCallback(() => {
    setRevealedCount(0);
    setIsRevealing(false);
  }, []);

  const isItemRevealed = useCallback((index: number) => {
    return index < revealedCount;
  }, [revealedCount]);

  return {
    startRevealing,
    reset,
    isItemRevealed,
    isRevealing,
    isComplete: revealedCount >= items.length
  };
}

/**
 * Hook for managing focus animations and accessibility
 */
export function useFocusAnimation() {
  const [isFocused, setIsFocused] = useState(false);
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const handleFocus = useCallback((event: React.FocusEvent) => {
    setIsFocused(true);

    // Check if focus is visible (keyboard navigation)
    const focusVisible = event.target.matches(':focus-visible');
    setIsFocusVisible(focusVisible);

    if (focusVisible) {
      trackEvent('focus_visible_activated');
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsFocusVisible(false);
  }, []);

  return {
    isFocused,
    isFocusVisible,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur
    }
  };
}

/**
 * Hook for managing number counter animations
 */
export function useCounterAnimation(
  endValue: number,
  duration: number = 2000,
  startOnMount: boolean = true
) {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const animate = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentValue(0);

    const startTime = Date.now();
    const startValue = 0;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(startValue + (endValue - startValue) * easedProgress);

      setCurrentValue(value);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setCurrentValue(endValue);
        setIsAnimating(false);
        trackEvent('counter_animation_completed', { endValue, duration });
      }
    };

    requestAnimationFrame(updateValue);
  }, [endValue, duration, isAnimating]);

  useEffect(() => {
    if (startOnMount) {
      animate();
    }
  }, [animate, startOnMount]);

  return {
    currentValue,
    isAnimating,
    animate,
    reset: () => setCurrentValue(0)
  };
}

/**
 * Hook for managing page transition animations
 */
export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'enter' | 'exit'>('enter');

  const startTransition = useCallback((direction: 'enter' | 'exit' = 'enter') => {
    setIsTransitioning(true);
    setTransitionDirection(direction);
    trackEvent('page_transition_started', { direction });
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
    trackEvent('page_transition_completed');
  }, []);

  return {
    isTransitioning,
    transitionDirection,
    startTransition,
    endTransition
  };
}

/**
 * Hook for managing card flip animations
 */
export function useCardFlip() {
  const [isFlipped, setIsFlipped] = useState(false);

  const flip = useCallback(() => {
    setIsFlipped(prev => {
      trackEvent('card_flipped', { newState: !prev });
      return !prev;
    });
  }, []);

  const reset = useCallback(() => {
    setIsFlipped(false);
  }, []);

  return {
    isFlipped,
    flip,
    reset
  };
}

/**
 * Hook for managing parallax effects
 */
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset;
        const rate = scrollTop * speed;
        setOffset(rate);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return {
    ref,
    offset,
    style: {
      transform: `translateY(${offset}px)`
    }
  };
}

/**
 * Hook for managing reduced motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
      trackEvent('reduced_motion_preference_changed', { prefersReduced: event.matches });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for managing animation variants based on user preferences
 */
export function useAnimationVariants() {
  const prefersReducedMotion = useReducedMotion();

  const getVariants = useCallback((normalVariants: any, reducedVariants?: any) => {
    if (prefersReducedMotion && reducedVariants) {
      return reducedVariants;
    }

    if (prefersReducedMotion) {
      // Return simplified variants that only change opacity
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }

    return normalVariants;
  }, [prefersReducedMotion]);

  return {
    prefersReducedMotion,
    getVariants
  };
}

export default {
  useLoadingState,
  useStaggeredAnimation,
  useScrollAnimation,
  useHoverEffect,
  useProgressiveDisclosure,
  useFocusAnimation,
  useCounterAnimation,
  usePageTransition,
  useCardFlip,
  useParallax,
  useReducedMotion,
  useAnimationVariants
};