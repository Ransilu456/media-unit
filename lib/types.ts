export type CategoryType =
  | 'Short Film & Cinematography'
  | 'Photography'
  | 'News Reading & Announcing'
  | 'Graphic Design & Digital Art'
  | 'Radio Play & Audio Production'
  | 'Live Media Reporting';

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

export interface Competition {
  id: string;
  title: string;
  category: CategoryType;
  slug: string;
  description: string;
  eligibility: string;
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
  schoolId: string;
  schoolName: string;
  category: CategoryType;
  studentName: string;
  studentGrade: string;
  studentContact?: string;
  entryTitle: string;
  submissionLink: string; // Google Drive / YouTube / Vimeo
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
