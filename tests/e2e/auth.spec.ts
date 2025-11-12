/**
 * Authentication E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'התחברות' })).toBeVisible();
    await expect(page.getByLabel('אימייל')).toBeVisible();
    await expect(page.getByLabel('סיסמה')).toBeVisible();
    await expect(page.getByRole('button', { name: 'התחבר' })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: 'התחבר' }).click();

    // Should show validation messages
    await expect(page.getByText('אימייל הוא שדה חובה')).toBeVisible();
    await expect(page.getByText('סיסמה היא שדה חובה')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.getByLabel('אימייל').fill('invalid@example.com');
    await page.getByLabel('סיסמה').fill('wrongpassword');
    await page.getByRole('button', { name: 'התחבר' }).click();

    // Should show error message
    await expect(page.getByText('שם משתמש או סיסמה שגויים')).toBeVisible();
  });

  test('should handle successful login', async ({ page }) => {
    await page.goto('/login');

    // Mock successful API response
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            uid: 'test-user-123',
            email: 'test@example.com',
            displayName: 'Test User'
          }
        })
      });
    });

    // Fill with test credentials
    await page.getByLabel('אימייל').fill('test@example.com');
    await page.getByLabel('סיסמה').fill('password123');
    await page.getByRole('button', { name: 'התחבר' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: 'לוח בקרה' })).toBeVisible();
  });

  test('should handle Google sign-in', async ({ page }) => {
    await page.goto('/login');

    // Mock Google OAuth
    await page.route('**/google.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            uid: 'google-user-123',
            email: 'google@example.com',
            displayName: 'Google User',
            photoURL: 'https://example.com/photo.jpg'
          }
        })
      });
    });

    // Click Google sign-in button
    await page.getByRole('button', { name: 'התחבר עם Google' }).click();

    // Should handle OAuth flow and redirect
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should handle password reset', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    await page.getByRole('link', { name: 'שכחת סיסמה?' }).click();

    // Should show password reset form
    await expect(page.getByRole('heading', { name: 'איפוס סיסמה' })).toBeVisible();
    await expect(page.getByLabel('אימייל')).toBeVisible();
    await expect(page.getByRole('button', { name: 'שלח קישור איפוס' })).toBeVisible();

    // Fill email and submit
    await page.getByLabel('אימייל').fill('test@example.com');
    await page.getByRole('button', { name: 'שלח קישור איפוס' }).click();

    // Should show success message
    await expect(page.getByText('קישור לאיפוס סיסמה נשלח למייל')).toBeVisible();
  });

  test('should handle user registration', async ({ page }) => {
    await page.goto('/login');

    // Click register link
    await page.getByRole('link', { name: 'הרשמה' }).click();

    // Should show registration form
    await expect(page.getByRole('heading', { name: 'הרשמה' })).toBeVisible();
    await expect(page.getByLabel('שם מלא')).toBeVisible();
    await expect(page.getByLabel('אימייל')).toBeVisible();
    await expect(page.getByLabel('סיסמה')).toBeVisible();
    await expect(page.getByLabel('אימות סיסמה')).toBeVisible();

    // Fill registration form
    await page.getByLabel('שם מלא').fill('New User');
    await page.getByLabel('אימייל').fill('newuser@example.com');
    await page.getByLabel('סיסמה').fill('password123');
    await page.getByLabel('אימות סיסמה').fill('password123');
    await page.getByRole('button', { name: 'הירשם' }).click();

    // Should show success message and redirect
    await expect(page.getByText('ההרשמה בוצעה בהצלחה')).toBeVisible();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: 'הרשמה' }).click();

    // Try weak password
    await page.getByLabel('שם מלא').fill('Test User');
    await page.getByLabel('אימייל').fill('test@example.com');
    await page.getByLabel('סיסמה').fill('123');
    await page.getByLabel('אימות סיסמה').fill('123');
    await page.getByRole('button', { name: 'הירשם' }).click();

    // Should show password strength error
    await expect(page.getByText('הסיסמה חייבת להכיל לפחות 8 תווים')).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // First login
    await page.goto('/login');

    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { uid: 'test-user', email: 'test@example.com' }
        })
      });
    });

    await page.getByLabel('אימייל').fill('test@example.com');
    await page.getByLabel('סיסמה').fill('password');
    await page.getByRole('button', { name: 'התחבר' }).click();

    await expect(page).toHaveURL(/dashboard/);

    // Then logout
    await page.getByRole('button', { name: 'התנתק' }).click();

    // Should return to login page
    await expect(page).toHaveURL('/login');
  });

  test('should protect authenticated routes', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should handle session expiry', async ({ page }) => {
    // Start with authenticated session
    await page.goto('/login');

    await page.route('**/api/**', (route) => {
      if (route.request().method() === 'POST' && route.request().url().includes('login')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: { uid: 'test-user', email: 'test@example.com' }
          })
        });
      } else {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Session expired' })
        });
      }
    });

    await page.getByLabel('אימייל').fill('test@example.com');
    await page.getByLabel('סיסמה').fill('password');
    await page.getByRole('button', { name: 'התחבר' }).click();

    await expect(page).toHaveURL(/dashboard/);

    // Try to access protected data after session expiry
    await page.reload();

    // Should redirect to login with session expiry message
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('הפעלה פגה, אנא התחבר מחדש')).toBeVisible();
  });

  test('should handle network errors during authentication', async ({ page }) => {
    await page.goto('/login');

    // Mock network error
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });

    await page.getByLabel('אימייל').fill('test@example.com');
    await page.getByLabel('סיסמה').fill('password');
    await page.getByRole('button', { name: 'התחבר' }).click();

    // Should show network error message
    await expect(page.getByText('בעיית תקשורת, אנא נסה שוב')).toBeVisible();
  });
});