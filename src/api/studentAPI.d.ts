import { Student, StudentDetail, Stats, FilterOptions, Filters } from '../types';

export function getAllStudents(): Promise<Student[]>;
export function getStudent(studentId: string): Promise<StudentDetail>;
export function getStats(): Promise<Stats>;
export function analyzeStudent(studentId: string): Promise<any>;
export function searchStudents(query: string, students: Student[]): Student[];
export function filterStudents(students: Student[], filters: Filters): Student[];
export function sortStudents(students: Student[], sortBy: string, sortOrder: 'asc' | 'desc'): Student[];
export function getFilterOptions(students: Student[]): FilterOptions;
export function calculateStats(students: Student[]): Stats;