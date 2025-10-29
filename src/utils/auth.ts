/**
 * Auth Utility Functions
 * Helper functions for authentication and authorization
 */

import type { User, UserRole, Permissions } from '../types/auth';

/**
 * Get user permissions based on role
 */
export function getUserPermissions(user: User | null): Permissions {
  if (!user) {
    return {
      canViewAllStudents: false,
      canEditStudentData: false,
      canAccessAdminPanel: false,
      canManageTeachers: false,
      canManageSchool: false,
      canExportData: false,
      canDeleteData: false,
    };
  }

  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const isSchoolAdmin = user.role === UserRole.SCHOOL_ADMIN;
  const isTeacher = user.role === UserRole.TEACHER;

  return {
    canViewAllStudents: isSuperAdmin || isSchoolAdmin,
    canEditStudentData: isSuperAdmin || isSchoolAdmin,
    canAccessAdminPanel: isSuperAdmin || isSchoolAdmin,
    canManageTeachers: isSuperAdmin || isSchoolAdmin,
    canManageSchool: isSuperAdmin || isSchoolAdmin,
    canExportData: isSuperAdmin || isSchoolAdmin || isTeacher,
    canDeleteData: isSuperAdmin,
  };
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  return user?.role === role;
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, UserRole.SUPER_ADMIN);
}

/**
 * Check if user is a school admin
 */
export function isSchoolAdmin(user: User | null): boolean {
  return hasRole(user, UserRole.SCHOOL_ADMIN);
}

/**
 * Check if user is a teacher
 */
export function isTeacher(user: User | null): boolean {
  return hasRole(user, UserRole.TEACHER);
}

/**
 * Check if user belongs to a specific school
 */
export function belongsToSchool(user: User | null, schoolId: string): boolean {
  if (!user) return false;

  // Super admin can access all schools
  if (isSuperAdmin(user)) return true;

  return user.schoolId === schoolId;
}

/**
 * Check if user can view a specific student
 */
export function canViewStudent(
  user: User | null,
  studentId: string,
  studentTeacherId?: string
): boolean {
  if (!user) return false;

  const permissions = getUserPermissions(user);

  // Super admin and school admin can view all students
  if (permissions.canViewAllStudents) return true;

  // Teacher can only view their assigned students
  if (isTeacher(user)) {
    // Check if student is directly assigned to teacher
    if (user.assignedStudentIds?.includes(studentId)) return true;

    // Check if student's teacher matches current user
    if (studentTeacherId === user.uid) return true;

    return false;
  }

  return false;
}

/**
 * Filter students based on user permissions
 */
export function filterStudentsByPermissions<T extends { id: string; teacherId?: string }>(
  user: User | null,
  students: T[]
): T[] {
  if (!user) return [];

  const permissions = getUserPermissions(user);

  // Super admin and school admin can see all students
  if (permissions.canViewAllStudents) {
    return students;
  }

  // Teachers only see their assigned students
  if (isTeacher(user)) {
    return students.filter((student) => {
      // Check if student is directly assigned
      if (user.assignedStudentIds?.includes(student.id)) return true;

      // Check if student's teacher matches current user
      if (student.teacherId === user.uid) return true;

      return false;
    });
  }

  return [];
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  return user.displayName || user.email || 'Unknown User';
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: User | null): string {
  if (!user || !user.displayName) return '?';

  const names = user.displayName.split(' ');
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase();
  }

  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'Super Admin';
    case UserRole.SCHOOL_ADMIN:
      return 'School Admin';
    case UserRole.TEACHER:
      return 'Teacher';
    default:
      return 'Unknown';
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Format auth error message
 */
export function formatAuthError(error: any): string {
  if (typeof error === 'string') return error;

  if (error?.code) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/popup-closed-by-user':
        return 'Login cancelled';
      case 'auth/popup-blocked':
        return 'Popup blocked. Please enable popups for this site';
      default:
        return error.message || 'An error occurred';
    }
  }

  return error?.message || 'An error occurred';
}
