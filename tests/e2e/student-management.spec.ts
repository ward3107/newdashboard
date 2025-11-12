/**
 * Student Management E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Student Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/login');

    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: { uid: 'test-user', email: 'admin@example.com' }
        })
      });
    });

    await page.getByLabel('אימייל').fill('admin@example.com');
    await page.getByLabel('סיסמה').fill('password');
    await page.getByRole('button', { name: 'התחבר' }).click();

    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display student list', async ({ page }) => {
    // Mock student data
    await page.route('**/api/students**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          students: [
            {
              studentCode: 'S001',
              name: 'תלמיד א',
              quarter: 'Q1',
              classId: 'C1',
              date: '2023-01-01',
              strengthsCount: 5,
              challengesCount: 2
            },
            {
              studentCode: 'S002',
              name: 'תלמיד ב',
              quarter: 'Q1',
              classId: 'C1',
              date: '2023-01-01',
              strengthsCount: 3,
              challengesCount: 4
            }
          ]
        })
      });
    });

    await page.goto('/dashboard');

    // Should show student cards
    await expect(page.getByText('תלמיד א')).toBeVisible();
    await expect(page.getByText('תלמיד ב')).toBeVisible();
    await expect(page.getByText('S001')).toBeVisible();
    await expect(page.getByText('S002')).toBeVisible();
  });

  test('should search and filter students', async ({ page }) => {
    // Mock student data with search results
    await page.route('**/api/students**', (route) => {
      const url = new URL(route.request().url());
      const searchTerm = url.searchParams.get('search');

      let students = [
        {
          studentCode: 'S001',
          name: 'תלמיד א',
          quarter: 'Q1',
          classId: 'C1',
          date: '2023-01-01',
          strengthsCount: 5,
          challengesCount: 2
        },
        {
          studentCode: 'S002',
          name: 'תלמיד ב',
          quarter: 'Q1',
          classId: 'C1',
          date: '2023-01-01',
          strengthsCount: 3,
          challengesCount: 4
        }
      ];

      if (searchTerm === 'תלמיד א') {
        students = students.filter(s => s.name.includes('תלמיד א'));
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          students
        })
      });
    });

    await page.goto('/dashboard');

    // Should show all students initially
    await expect(page.getByText('תלמיד א')).toBeVisible();
    await expect(page.getByText('תלמיד ב')).toBeVisible();

    // Search for specific student
    await page.getByPlaceholder('חפש תלמידים...').fill('תלמיד א');
    await page.getByRole('button', { name: 'חפש' }).click();

    // Should show only filtered results
    await expect(page.getByText('תלמיד א')).toBeVisible();
    await expect(page.getByText('תלמיד ב')).not.toBeVisible();
  });

  test('should view student details', async ({ page }) => {
    // Mock student details
    await page.route('**/api/students/S001**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          student: {
            studentCode: 'S001',
            name: 'תלמיד א',
            quarter: 'Q1',
            classId: 'C1',
            date: '2023-01-01',
            learningStyle: 'ויזואלי',
            keyNotes: 'הערות חשובות',
            strengthsCount: 5,
            challengesCount: 2,
            student_summary: {
              learning_style: 'ויזואלי',
              key_notes: 'הערות חשובות',
              strengths: ['חוזק 1', 'חוזק 2'],
              challenges: ['אתגר 1', 'אתגר 2']
            },
            insights: [
              {
                type: 'academic',
                title: 'ביצועים אקדמיים',
                description: 'ביצועים טובים במקצועות מדויקים',
                priority: 'high'
              }
            ]
          }
        })
      });
    });

    await page.goto('/dashboard');

    // Click on student card
    await page.getByText('תלמיד א').click();

    // Should show student details modal
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'פרטי תלמיד' })).toBeVisible();
    await expect(page.getByText('תלמיד א')).toBeVisible();
    await expect(page.getByText('S001')).toBeVisible();
    await expect(page.getByText('ויזואלי')).toBeVisible();
    await expect(page.getByText('הערות חשובות')).toBeVisible();
  });

  test('should add new student', async ({ page }) => {
    await page.goto('/dashboard');

    // Click add student button
    await page.getByRole('button', { name: 'הוסף תלמיד חדש' }).click();

    // Should show add student form
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'הוסף תלמיד חדש' })).toBeVisible();
    await expect(page.getByLabel('שם תלמיד')).toBeVisible();
    await expect(page.getByLabel('תעודת זהות')).toBeVisible();
    await expect(page.getByLabel('כיתה')).toBeVisible();
    await expect(page.getByLabel('רבעון')).toBeVisible();

    // Fill form
    await page.getByLabel('שם תלמיד').fill('תלמיד חדש');
    await page.getByLabel('תעודת זהות').fill('S003');
    await page.getByLabel('כיתה').selectOption('C1');
    await page.getByLabel('רבעון').selectOption('Q1');

    // Mock API response for adding student
    await page.route('**/api/students**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Student added successfully',
            student: {
              studentCode: 'S003',
              name: 'תלמיד חדש',
              quarter: 'Q1',
              classId: 'C1',
              date: new Date().toISOString()
            }
          })
        });
      }
    });

    // Submit form
    await page.getByRole('button', { name: 'הוסף תלמיד' }).click();

    // Should show success message
    await expect(page.getByText('התלמיד נוסף בהצלחה')).toBeVisible();

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should handle student analysis', async ({ page }) => {
    // Mock analysis API
    await page.route('**/api/analyze/S001**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analysis: {
            insights: [
              {
                type: 'cognitive',
                title: 'סגנון למידה',
                description: 'סגנון למידה ויזואלי מובהק',
                recommendations: ['השתמש במפות חשיבה', 'השתמש בדיאגרמות']
              }
            ],
            confidence: 0.85
          }
        })
      });
    });

    await page.goto('/dashboard');

    // Click analyze button on student card
    await page.getByRole('button', { name: 'נתח תלמיד' }).first().click();

    // Should show analysis results
    await expect(page.getByText('ניתוח ISHEBOT')).toBeVisible();
    await expect(page.getByText('סגנון למידה')).toBeVisible();
    await expect(page.getByText('רמת ביטחון: 85%')).toBeVisible();
  });

  test('should export student data', async ({ page }) => {
    await page.goto('/dashboard');

    // Mock export API
    await page.route('**/api/export/**', (route) => {
      route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="students.xlsx"'
        },
        body: Buffer.from('mock excel content')
      });
    });

    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'ייצא לאקסל' }).click();
    const download = await downloadPromise;

    // Verify download
    expect(download.suggestedFilename()).toBe('students.xlsx');
  });

  test('should handle bulk operations', async ({ page }) => {
    await page.goto('/dashboard');

    // Select multiple students
    await page.getByLabel('בחר תלמיד א').check();
    await page.getByLabel('בחר תלמיד ב').check();

    // Bulk delete (with confirmation)
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'מחק נבחרים' }).click();

    // Mock bulk delete API
    await page.route('**/api/students/bulk-delete**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          deleted: 2,
          message: '2 students deleted successfully'
        })
      });
    });

    // Should show success message
    await expect(page.getByText('2 תלמידים נמחקו בהצלחה')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/students**', (route) => {
      route.abort('failed');
    });

    await page.goto('/dashboard');

    // Should show error message
    await expect(page.getByText('בעיית טעינת נתונים')).toBeVisible();
    await expect(page.getByRole('button', { name: 'נסה שוב' })).toBeVisible();
  });

  test('should handle empty student list', async ({ page }) => {
    // Mock empty student list
    await page.route('**/api/students**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          students: []
        })
      });
    });

    await page.goto('/dashboard');

    // Should show empty state
    await expect(page.getByText('לא נמצאו תלמידים')).toBeVisible();
    await expect(page.getByRole('button', { name: 'הוסף תלמיד חדש' })).toBeVisible();
  });
});