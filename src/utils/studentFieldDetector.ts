/**
 * Student Field Detector
 * Automatically detects student identifier fields from data
 */

export interface StudentIdentifier {
  code?: string;
  id?: string;
  displayName?: string;
}

/**
 * Automatically detect the student code/ID field from a student object
 */
export function getStudentIdentifier(student: any): StudentIdentifier {
  if (!student) return {};

  const result: StudentIdentifier = {};

  // Common field names for student codes/IDs (in order of priority)
  const codeFieldNames = [
    'studentCode',
    'student_code',
    'code',
    'studentId',
    'student_id',
    'id',
    'studentNumber',
    'student_number',
    'number',
    'rollNumber',
    'roll_number',
    'registrationNumber',
    'registration_number',
    'admissionNumber',
    'admission_number',
  ];

  // Try to find student code
  for (const fieldName of codeFieldNames) {
    if (student[fieldName] && typeof student[fieldName] === 'string') {
      result.code = student[fieldName];
      break;
    } else if (student[fieldName] && typeof student[fieldName] === 'number') {
      result.code = String(student[fieldName]);
      break;
    }
  }

  // Common field names for student names
  const nameFieldNames = [
    'name',
    'studentName',
    'student_name',
    'fullName',
    'full_name',
    'displayName',
    'display_name',
  ];

  // Try to find student name
  for (const fieldName of nameFieldNames) {
    if (student[fieldName] && typeof student[fieldName] === 'string') {
      result.displayName = student[fieldName];
      break;
    }
  }

  return result;
}

/**
 * Get a formatted display string for student identification
 */
export function getStudentDisplayText(student: any, showCode: boolean = true): string {
  const identifier = getStudentIdentifier(student);

  if (!identifier.displayName && !identifier.code) {
    return 'Unknown Student';
  }

  if (showCode && identifier.code) {
    return identifier.displayName
      ? `${identifier.displayName} (${identifier.code})`
      : identifier.code;
  }

  return identifier.displayName || identifier.code || 'Unknown Student';
}

/**
 * Analyze a collection of students to determine available fields
 */
export function analyzeStudentFields(students: any[]): {
  hasCodeField: boolean;
  codeFieldName: string | null;
  hasNameField: boolean;
  nameFieldName: string | null;
  sampleFields: string[];
} {
  if (!students || students.length === 0) {
    return {
      hasCodeField: false,
      codeFieldName: null,
      hasNameField: false,
      nameFieldName: null,
      sampleFields: [],
    };
  }

  const sampleStudent = students[0];
  const sampleFields = Object.keys(sampleStudent);

  const codeFieldNames = [
    'studentCode', 'student_code', 'code', 'studentId', 'student_id', 'id',
    'studentNumber', 'student_number', 'number',
  ];

  const nameFieldNames = [
    'name', 'studentName', 'student_name', 'fullName', 'full_name',
  ];

  let codeFieldName: string | null = null;
  let nameFieldName: string | null = null;

  // Find code field
  for (const fieldName of codeFieldNames) {
    if (sampleStudent[fieldName] !== undefined) {
      codeFieldName = fieldName;
      break;
    }
  }

  // Find name field
  for (const fieldName of nameFieldNames) {
    if (sampleStudent[fieldName] !== undefined) {
      nameFieldName = fieldName;
      break;
    }
  }

  return {
    hasCodeField: codeFieldName !== null,
    codeFieldName,
    hasNameField: nameFieldName !== null,
    nameFieldName,
    sampleFields,
  };
}

/**
 * Get all available student fields for debugging
 */
export function getStudentFields(student: any): string[] {
  if (!student || typeof student !== 'object') {
    return [];
  }
  return Object.keys(student);
}
