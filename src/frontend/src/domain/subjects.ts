// Subject structure and type definitions for 1st year MBBS

import type { SubjectName, SubjectType, AttendanceCategory } from '../storage/models';

export interface SubjectDefinition {
  name: SubjectName;
  types: SubjectType[];
}

export const SUBJECTS: SubjectDefinition[] = [
  {
    name: 'Anatomy',
    types: ['Theory', 'DH'],
  },
  {
    name: 'Physiology',
    types: ['Theory', 'Human Physiology Lab', 'Hematology Lab'],
  },
  {
    name: 'Biochemistry',
    types: ['Theory', 'Biochemistry Lab'],
  },
];

export function getTypesForSubject(subject: SubjectName): SubjectType[] {
  const subjectDef = SUBJECTS.find((s) => s.name === subject);
  return subjectDef?.types || [];
}

export function mapTypeToCategory(subject: SubjectName, type: SubjectType): AttendanceCategory {
  if (type === 'Theory') return 'Theory';
  
  // All non-theory types are practical
  if (subject === 'Anatomy' && type === 'DH') return 'Practical';
  if (subject === 'Physiology' && (type === 'Human Physiology Lab' || type === 'Hematology Lab')) {
    return 'Practical';
  }
  if (subject === 'Biochemistry' && type === 'Biochemistry Lab') return 'Practical';
  
  return 'Theory'; // fallback
}
