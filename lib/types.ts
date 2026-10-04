export type CategoryType =
  | 'Short Film & Cinematography'
  | 'Photography'
  | 'News Reading & Announcing'
  | 'Graphic Design & Digital Art'
  | 'Radio Play & Audio Production'
  | 'Live Media Reporting';

export type MediumType = 'Sinhala' | 'English' | 'None';

export type SubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'shortlisted'
  | 'winner'
  | 'disqualified';

export type CompetitionStatus = 'open' | 'closed' | 'judging' | 'upcoming';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'select' | 'number';
  required: boolean;
  placeholder?: string;
  helperText?: string;
  options?: string[];
}

export interface AgeCategory {
  label: string;
  minAge: number;
  maxAge: number;
  grades: string[]; // e.g. ['Grade 6','Grade 7', ...]
}

export interface Competition {
  id: string;
  title: string;
  category: CategoryType;
  medium: MediumType;
  slug: string;
  description: string;
  eligibility: string;
  ageCategory?: AgeCategory;
  deadline: string;
  maxEntriesPerSchool: number;
  status: CompetitionStatus;
  prizePool: string;
  guidelines: string[];
  customFields: FormField[];
}

export interface RegisteredSchool {
  id: string;
  name: string;
  registrationNumber: string;
  district: string;
  province: string;
  teacherInCharge: string;
  teacherPhone: string;
  mediaPresident: string;
  presidentPhone: string;
  email: string;
  password?: string;
  status: 'active' | 'pending' | 'suspended';
  registeredAt: string;
  badgeCode: string;
}

export interface Submission {
  id: string;
  competitionId: string;
  competitionTitle: string;
  competitionMedium: MediumType;
  schoolId: string;
  schoolName: string;
  category: CategoryType;
  studentName: string;
  studentGrade: string;
  studentBirthday: string; // ISO date string YYYY-MM-DD
  studentAge: number;     // auto-calculated from birthday
  studentContact: string;
  entryTitle: string;
  submissionLink: string;
  synopsis: string;
  customValues?: Record<string, string>;
  status: SubmissionStatus;
  submittedAt: string;
  score?: number;
  judgeFeedback?: string;
}

export interface AuthSession {
  type: 'guest' | 'school' | 'admin';
  school?: RegisteredSchool;
  adminName?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
