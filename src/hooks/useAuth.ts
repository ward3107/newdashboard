/**
 * useAuth Hook
 * Custom hook for accessing authentication context
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import type { User, Permissions } from '../types/auth';

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Check if user has a specific role
 */
export function useHasRole(role: UserRole): boolean {
  const { user } = useAuth();
  return user?.role === role;
}

/**
 * Check if user is a super admin
 */
export function useIsSuperAdmin(): boolean {
  return useHasRole(UserRole.SUPER_ADMIN);
}

/**
 * Check if user is a school admin
 */
export function useIsSchoolAdmin(): boolean {
  return useHasRole(UserRole.SCHOOL_ADMIN);
}

/**
 * Check if user is a teacher
 */
export function useIsTeacher(): boolean {
  return useHasRole(UserRole.TEACHER);
}

/**
 * Get user permissions based on role
 */
export function usePermissions(): Permissions {
  const { user } = useAuth();

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
 * Check if current user can view a specific student
 */
export function useCanViewStudent(studentId: string, studentTeacherId?: string): boolean {
  const { user } = useAuth();
  const permissions = usePermissions();

  if (!user) return false;

  // Super admin and school admin can view all students
  if (permissions.canViewAllStudents) return true;

  // Teacher can only view their assigned students
  if (user.role === UserRole.TEACHER) {
    // Check if student is directly assigned to teacher
    if (user.assignedStudentIds?.includes(studentId)) return true;

    // Check if student's teacher matches current user
    if (studentTeacherId === user.uid) return true;

    return false;
  }

  return false;
}

/**
 * Get current user info
 */
export function useCurrentUser(): User | null {
  const { user } = useAuth();
  return user;
}

/**
 * Check if user belongs to a specific school
 */
export function useBelongsToSchool(schoolId: string): boolean {
  const { user } = useAuth();

  if (!user) return false;

  // Super admin can access all schools
  if (user.role === UserRole.SUPER_ADMIN) return true;

  return user.schoolId === schoolId;
}

export default useAuth;
