import { test, expect } from '@playwright/test';

test.describe('Offline Assessment Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assessment');

    // Wait for the form to load
    await page.waitForSelector('[data-testid="assessment-form"]', { timeout: 10000 });
  });

  test('should save progress automatically', async ({ page }) => {
    // Fill in basic information
    await page.fill('[data-testid="student-code"]', '70101');
    await page.fill('[data-testid="student-name"]', 'Test Student');
    await page.selectOption('[data-testid="class-id"]', 'ג1');

    // Go to first question
    await page.click('[data-testid="start-button"]');

    // Answer a few questions
    await page.waitForSelector('[data-testid="question-1"]');
    await page.click('[data-testid="answer-1-0"]'); // First answer to first question

    // Wait for auto-save
    await page.waitForTimeout(500);

    // Simulate browser close by navigating away and back
    await page.goto('/assessment');
    await page.waitForSelector('[data-testid="assessment-form"]');

    // Should resume at same question (question 1, step 2)
    const currentStep = await page.locator('[data-testid="current-step"]').textContent();
    expect(currentStep).toBe('2');

    // Check if answers are preserved
    const studentCode = await page.inputValue('[data-testid="student-code"]');
    const studentName = await page.inputValue('[data-testid="student-name"]');
    const classId = await page.locator('[data-testid="class-id"]').inputValue();

    expect(studentCode).toBe('70101');
    expect(studentName).toBe('Test Student');
    expect(classId).toBe('ג1');
  });

  test('should work offline and sync data when back online', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true);

    // Fill out the entire form offline
    await page.fill('[data-testid="student-code"]', '70102');
    await page.fill('[data-testid="student-name"]', 'Offline Student');
    await page.selectOption('[data-testid="class-id"]', 'ד1');

    // Start assessment
    await page.click('[data-testid="start-button"]');

    // Answer all questions quickly
    for (let i = 1; i <= 5; i++) { // Assuming 5 questions for test speed
      await page.waitForSelector(`[data-testid="question-${i}"]`);
      await page.click(`[data-testid="answer-${i}-0"]`); // Always choose first option
      await page.waitForTimeout(200); // Brief pause for auto-save
    }

    // Submit the form while offline
    await page.waitForSelector('[data-testid="submit-button"]');
    await page.click('[data-testid="submit-button"]');

    // Check if offline badge appears
    await expect(page.locator('[data-testid="offline-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-status"]')).toContainText('עובד במצב לא מקוון');

    // Should see thank you page
    await expect(page.locator('[data-testid="thank-you-page"]')).toBeVisible();

    // Check for offline success message
    await expect(page.locator('[data-testid="toast-message"]')).toContainText('נשמר בהצלחה לסנכרון עתידי');

    // Go back online
    await context.setOffline(false);

    // Wait for sync to complete
    await expect(page.locator('[data-testid="sync-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('מסנכרן נתונים');

    // Should show success after sync
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('הנתונים סונכרנו');
  });

  test('should handle multiple offline submissions', async ({ page, context }) => {
    const submissions = [
      { code: '70103', name: 'Student 1', class: 'ה1' },
      { code: '70104', name: 'Student 2', class: 'ו1' },
      { code: '70105', name: 'Student 3', class: 'ז1' }
    ];

    // Submit multiple forms offline
    for (const submission of submissions) {
      await context.setOffline(true);

      await page.goto('/assessment');
      await page.waitForSelector('[data-testid="assessment-form"]');

      await page.fill('[data-testid="student-code"]', submission.code);
      await page.fill('[data-testid="student-name"]', submission.name);
      await page.selectOption('[data-testid="class-id"]', submission.class);

      await page.click('[data-testid="start-button"]');

      // Answer questions quickly
      await page.waitForSelector('[data-testid="question-1"]');
      await page.click('[data-testid="answer-1-0"]');
      await page.click('[data-testid="answer-2-0"]');
      await page.click('[data-testid="answer-3-0"]');

      await page.click('[data-testid="submit-button"]');
      await expect(page.locator('[data-testid="thank-you-page"]')).toBeVisible();

      // Brief pause between submissions
      await page.waitForTimeout(1000);
    }

    // Go back online
    await context.setOffline(false);

    // Should sync all pending submissions
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('(3)');
    await expect(page.locator('[data-testid="sync-status"]')).toContainText('הנתונים סונכרנו');
  });

  test('should preserve language selection across sessions', async ({ page, context }) => {
    // Change language to English
    await page.click('[data-testid="language-en"]');

    // Fill some data
    await page.fill('[data-testid="student-code"]', '70106');
    await page.fill('[data-testid="student-name"]', 'English Student');

    // Simulate page refresh
    await page.reload();
    await page.waitForSelector('[data-testid="assessment-form"]');

    // Check if English language is preserved
    await expect(page.locator('[data-testid="language-en"]')).toHaveClass(/bg-blue-600/);

    // Check if offline status shows in English
    await context.setOffline(true);
    await expect(page.locator('[data-testid="offline-status"]')).toContainText('Working offline');
  });

  test('should handle partial sync failures gracefully', async ({ page, context }) => {
    // This test would require mocking Firebase to simulate sync failures
    // For now, we'll test the basic flow

    await context.setOffline(true);

    await page.fill('[data-testid="student-code"]', '70107');
    await page.fill('[data-testid="student-name"]', 'Partial Sync Test');
    await page.selectOption('[data-testid="class-id"]', 'ח1');

    await page.click('[data-testid="start-button"]');
    await page.waitForSelector('[data-testid="question-1"]');
    await page.click('[data-testid="answer-1-0"]');

    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="thank-you-page"]')).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Even if sync fails, user should see appropriate feedback
    // This would need Firebase mocking to test actual sync failures
    await page.waitForTimeout(2000); // Wait for sync attempt
  });

  test('should clear saved data after successful submission', async ({ page }) => {
    // Fill and submit form normally (online)
    await page.fill('[data-testid="student-code"]', '70108');
    await page.fill('[data-testid="student-name"]', 'Clear Data Test');
    await page.selectOption('[data-testid="class-id"]', 'ט1');

    await page.click('[data-testid="start-button"]');
    await page.waitForSelector('[data-testid="question-1"]');
    await page.click('[data-testid="answer-1-0"]');

    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="thank-you-page"]')).toBeVisible();

    // Close and reopen the form
    await page.goto('/assessment');
    await page.waitForSelector('[data-testid="assessment-form"]');

    // Should start fresh (no saved data)
    const studentCode = await page.inputValue('[data-testid="student-code"]');
    const studentName = await page.inputValue('[data-testid="student-name"]');
    const currentStep = await page.locator('[data-testid="current-step"]').textContent();

    expect(studentCode).toBe('');
    expect(studentName).toBe('');
    expect(currentStep).toBe('1'); // Should be back to step 1 (basic info)
  });
});