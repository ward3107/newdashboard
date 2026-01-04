/**
 * SEO Utilities
 * Helper functions for managing SEO meta tags and canonical URLs
 */

const BASE_URL = 'https://newdashboard-1.vercel.app';

/**
 * Update canonical URL for the current page
 */
export function setCanonicalURL(path: string): void {
  if (typeof document === 'undefined') return;

  // Remove existing canonical link
  const existingLink = document.querySelector('link[rel="canonical"]');
  if (existingLink) {
    existingLink.remove();
  }

  // Create new canonical link
  const link = document.createElement('link');
  link.rel = 'canonical';
  link.href = `${BASE_URL}${path}`;
  document.head.appendChild(link);
}

/**
 * Update page meta tags for SEO
 */
export function updateMetaTags(config: {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
}): void {
  if (typeof document === 'undefined') return;

  if (config.title) {
    document.title = config.title;
  }

  if (config.description) {
    setMetaTag('name', 'description', config.description);
  }

  if (config.ogTitle) {
    setMetaTag('property', 'og:title', config.ogTitle);
  }

  if (config.ogDescription) {
    setMetaTag('property', 'og:description', config.ogDescription);
  }

  if (config.ogType) {
    setMetaTag('property', 'og:type', config.ogType);
  }
}

/**
 * Helper to set or update a meta tag
 */
function setMetaTag(attribute: 'name' | 'property', key: string, value: string): void {
  let element = document.querySelector(`meta[${attribute}="${key}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', value);
}

/**
 * SEO Hook for React components
 */
export function useSEO(path: string, config?: {
  title?: string;
  description?: string;
}): void {
  if (typeof window === 'undefined') return;

  // Update canonical URL
  setCanonicalURL(path);

  // Update meta tags if provided
  if (config) {
    updateMetaTags(config);
  }
}
