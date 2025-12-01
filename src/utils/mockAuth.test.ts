/**
 * Mock Authentication Tests
 * Verify UserRole enum integration
 */

import { describe, it, expect } from 'vitest';
import { mockLogin, MOCK_USERS } from './mockAuth';
import { UserRole } from '../types/auth';

describe('Mock Authentication', () => {
  describe('mockLogin', () => {
    it('should return teacher user with correct UserRole enum', () => {
      const user = mockLogin('teacher@test.com', 'teacher123');

      expect(user).toBeDefined();
      expect(user?.role).toBe(UserRole.TEACHER);
      expect(user?.email).toBe('teacher@test.com');
      expect(user?.displayName).toBe('Test Teacher');
    });

    it('should return admin user with correct UserRole enum', () => {
      const user = mockLogin('admin@test.com', 'admin123');

      expect(user).toBeDefined();
      expect(user?.role).toBe(UserRole.SCHOOL_ADMIN);
      expect(user?.email).toBe('admin@test.com');
      expect(user?.displayName).toBe('Test Admin');
    });

    it('should return null for invalid credentials', () => {
      const user = mockLogin('invalid@test.com', 'wrongpassword');

      expect(user).toBeNull();
    });

    it('should not include password in returned user object', () => {
      const user = mockLogin('teacher@test.com', 'teacher123');

      expect(user).toBeDefined();
      expect(user).not.toHaveProperty('password');
    });
  });

  describe('MOCK_USERS', () => {
    it('should have all users with UserRole enum values', () => {
      expect(MOCK_USERS.teacher.role).toBe(UserRole.TEACHER);
      expect(MOCK_USERS.admin.role).toBe(UserRole.SCHOOL_ADMIN);
      expect(MOCK_USERS.manager.role).toBe(UserRole.TEACHER);
    });

    it('should have all users marked as active', () => {
      Object.values(MOCK_USERS).forEach(user => {
        expect(user.isActive).toBe(true);
      });
    });

    it('should have all users with valid school IDs', () => {
      Object.values(MOCK_USERS).forEach(user => {
        expect(user.schoolId).toBe('school-001');
      });
    });
  });
});
