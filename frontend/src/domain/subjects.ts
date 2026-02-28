// Subject structure and type definitions for 1st year MBBS

import type { SubjectName, SubjectType, AttendanceCategory } from '../storage/models';

export interface SubjectDefinition {
  name: SubjectName;
  types: SubjectType[];
}

export const SUBJECTS: SubjectDefinition[] = [
  {
    name: 'Anatomy',
    types: ['Theory', 'DH', 'AETCOM'],
  },
  {
    name: 'Physiology',
    types: ['Theory', 'Human Physiology Lab', 'Hematology Lab', 'AETCOM'],
  },
  {
    name: 'Biochemistry',
    types: ['Theory', 'Biochemistry Lab', 'AETCOM'],
  },
  {
    name: 'Community Medicine',
    types: ['Theory', 'AETCOM'],
  },
];

export function getTypesForSubject(subject: SubjectName): SubjectType[] {
  const subjectDef = SUBJECTS.find((s) => s.name === subject);
  return subjectDef?.types || [];
}

export function mapTypeToCategory(subject: SubjectName, type: SubjectType): AttendanceCategory {
  if (type === 'Theory') return 'Theory';
  
  // All non-theory types are practical, including AETCOM
  if (subject === 'Anatomy' && (type === 'DH' || type === 'AETCOM')) return 'Practical';
  if (subject === 'Physiology' && (type === 'Human Physiology Lab' || type === 'Hematology Lab' || type === 'AETCOM')) {
    return 'Practical';
  }
  if (subject === 'Biochemistry' && (type === 'Biochemistry Lab' || type === 'AETCOM')) return 'Practical';
  if (subject === 'Community Medicine' && type === 'AETCOM') return 'Practical';
  
  return 'Theory'; // fallback
}
