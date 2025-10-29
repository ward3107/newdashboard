/**
 * Authentication Type Definitions
 * Defines all types related to user authentication and authorization
 */

/**
 * User roles in the system
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',   // Platform owner - full access to all schools
  SCHOOL_ADMIN = 'school_admin',  // School principal/manager - manages school data
  TEACHER = 'teacher',             // Regular teacher - sees only assigned students
}

/**
 * User data stored in Firestore
 */
export interface User {
  uid: string;                    // Firebase Auth UID
  email: string;                  // User's email
  displayName: string;            // User's full name
  role: UserRole;                 // User's role
  schoolId: string;               // Associated school ID
  photoURL?: string;              // Profile photo URL (from Google Sign-In)
  assignedClasses?: string[];     // Classes assigned to teacher (e.g., ["8A", "9B"])
  assignedStudentIds?: string[];  // Direct student IDs assigned to teacher
  createdAt: Date;                // Account creation date
  lastLogin?: Date;               // Last login timestamp
  isActive: boolean;              // Account status
  phoneNumber?: string;           // Optional phone number
}

/**
 * School data
 */
export interface School {
  id: string;                     // School ID
  name: string;                   // School name
  address?: string;               // School address
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: Date;   // When subscription expires
  maxTeachers: number;            // Maximum number of teachers allowed
  maxStudents: number;            // Maximum number of students allowed
  adminEmail: string;             // School admin contact email
  createdAt: Date;                // School creation date
  isActive: boolean;              // School status
  settings?: SchoolSettings;      // School-specific settings
}

/**
 * Subscription status
 */
export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

/**
 * Subscription tiers
 */
export enum SubscriptionTier {
  TRIAL = 'trial',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * School-specific settings
 */
export interface SchoolSettings {
  enableParentPortal?: boolean;
  enableEmailNotifications?: boolean;
  enableSMSNotifications?: boolean;
  language?: string;
  timezone?: string;
}

/**
 * Teacher data (extends User for teacher-specific fields)
 */
export interface Teacher extends User {
  role: UserRole.TEACHER;
  subjects?: string[];            // Subjects taught
  gradeLevel?: string;            // Primary grade level
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup data
 */
export interface SignupData {
  email: string;
  password: string;
  displayName: string;
  schoolId: string;
  role: UserRole;
}

/**
 * Auth context state
 */
export interface AuthContextState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

/**
 * Auth error
 */
export interface AuthError {
  code: string;
  message: string;
}

/**
 * Permission checks
 */
export interface Permissions {
  canViewAllStudents: boolean;
  canEditStudentData: boolean;
  canAccessAdminPanel: boolean;
  canManageTeachers: boolean;
  canManageSchool: boolean;
  canExportData: boolean;
  canDeleteData: boolean;
}
