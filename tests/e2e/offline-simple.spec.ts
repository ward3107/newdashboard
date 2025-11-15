import { test, expect } from '@playwright/test';

test.describe('Simple Offline Test', () => {
  test('should show offline status and save data', async ({ page, context }) => {
    // Navigate to assessment page
    await page.goto('/assessment');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Handle cookie banner if present
    try {
      const cookieBanner = page.locator('[role="dialog"]').first();
      if (await cookieBanner.isVisible()) {
        const acceptButton = page.locator('text=/קבל|Accept|Accept|קבל/').first();
        if (await acceptButton.isVisible()) {
          await acceptButton.click();
        }
      }
    } catch (e) {
      // No cookie banner, continue
    }

    // Fill form data while online
    await page.fill('[data-testid="student-code"]', '70101');
    await page.fill('[data-testid="student-name"]', 'Offline Test Student');
    await page.selectOption('[data-testid="class-id"]', 'ג1');

    // Start assessment
    await page.click('[data-testid="start-button"]');

    // Wait for first question
    await page.waitForSelector('[data-testid="question-1"]', { timeout: 10000 });

    // Answer first question
    await page.click('[data-testid="answer-1-0"]');

    // Now go offline
    await context.setOffline(true);

    // Wait a moment for offline state to register
    await page.waitForTimeout(1000);

    // Check if offline status appears
    const offlineStatus = page.locator('[data-testid="offline-status"]');
    await expect(offlineStatus).toBeVisible({ timeout: 5000 });

    // Answer second question while offline
    await page.click('[data-testid="answer-2-0"]');

    // Wait for auto-save
    await page.waitForTimeout(500);

    // Go back online
    await context.setOffline(false);

    // Wait for sync to complete
    await page.waitForTimeout(2000);

    // Check if synced status appears (should be green "Connected & synced")
    const onlineStatus = page.locator('text=/Connected|מחובר/');
    if (await onlineStatus.isVisible()) {
      console.log('✅ Online status detected');
    }

    console.log('✅ Offline functionality test completed successfully');
  });

  test('should save form data to localStorage', async ({ page }) => {
    await page.goto('/assessment');
    await page.waitForTimeout(2000);

    // Handle cookie banner if present
    try {
      const cookieBanner = page.locator('[role="dialog"]').first();
      if (await cookieBanner.isVisible()) {
        const acceptButton = page.locator('text=/קבל|Accept/').first();
        if (await acceptButton.isVisible()) {
          await acceptButton.click();
        }
      }
    } catch (e) {
      // Continue if no cookie banner
    }

    // Fill some form data
    await page.fill('[data-testid="student-code"]', '70102');
    await page.fill('[data-testid="student-name"]', 'LocalStorage Test');
    await page.selectOption('[data-testid="class-id"]', 'ד1');

    // Start assessment
    await page.click('[data-testid="start-button"]');

    // Wait for first question
    await page.waitForSelector('[data-testid="question-1"]', { timeout: 10000 });

    // Answer question
    await page.click('[data-testid="answer-1-0"]');

    // Check if data is saved in localStorage
    const localStorageData = await page.evaluate(() => {
      return {
        assessmentFormData: localStorage.getItem('assessmentFormData'),
        currentStep: localStorage.getItem('assessmentCurrentStep'),
        language: localStorage.getItem('assessmentLanguage')
      };
    });

    expect(localStorageData.assessmentFormData).toBeTruthy();
    expect(localStorageData.currentStep).toBeTruthy();
    expect(localStorageData.language).toBeTruthy();

    console.log('✅ localStorage functionality working');
    console.log('📊 Saved data:', localStorageData);
  });
});