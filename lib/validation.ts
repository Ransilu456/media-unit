import { SRI_LANKA_PROVINCES } from './constants';
import type { DbData, JsonValue } from './db';
import type {
  CategoryType,
  Competition,
  MediumType,
  NewSubmissionInput,
  RegisteredSchool,
  Submission,
  SubmissionStatus,
} from './types';

export type ValidationErrors = Record<string, string>;

export class InvalidRequestError extends Error { }

export async function readJsonRequest(
  request: Request,
  maximumBytes = 64 * 1024
): Promise<unknown> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    throw new InvalidRequestError('Content-Type must be application/json.');
  }
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > maximumBytes) {
    throw new InvalidRequestError('Request body is too large.');
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maximumBytes) {
    throw new InvalidRequestError('Request body is too large.');
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new InvalidRequestError('Request body must be valid JSON.');
  }
}

const SCHOOL_STATUSES = ['active', 'pending', 'suspended', 'banned'] as const;
const SUBMISSION_STATUSES: readonly SubmissionStatus[] = [
  'submitted',
  'under_review',
  'verified',
  'shortlisted',
  'winner',
  'disqualified',
];
const CATEGORIES: readonly CategoryType[] = [
  'Short Film & Cinematography',
  'Photography',
  'News Reading & Announcing',
  'Graphic Design & Digital Art',
  'Radio Play & Audio Production',
  'Live Media Reporting',
];
const MEDIUMS: readonly MediumType[] = ['Sinhala', 'English', 'None'];
const ALLOWED_SCHOOL_FIELDS = new Set([
  'name', 'registrationNumber', 'province', 'district', 'teacherInCharge',
  'teacherPhone', 'mediaPresident', 'presidentPhone', 'email', 'password',
]);
const ALLOWED_SUBMISSION_FIELDS = new Set([
  'competitionId', 'competitionTitle', 'competitionMedium', 'schoolId',
  'schoolName', 'category', 'studentName', 'studentGrade', 'studentBirthday',
  'studentContact', 'entryTitle', 'submissionLink', 'synopsis',
]);
const ALLOWED_DATABASE_FIELDS = new Set(['competitions', 'schools', 'submissions', 'admin']);
const ALLOWED_STORED_SCHOOL_FIELDS = new Set([
  'id', 'name', 'registrationNumber', 'district', 'province', 'teacherInCharge',
  'teacherPhone', 'mediaPresident', 'presidentPhone', 'email', 'password',
  'status', 'registeredAt', 'badgeCode',
]);
const ALLOWED_STORED_SUBMISSION_FIELDS = new Set([
  'id', 'competitionId', 'competitionTitle', 'competitionMedium', 'schoolId',
  'schoolName', 'category', 'studentName', 'studentGrade', 'studentBirthday',
  'studentAge', 'studentContact', 'entryTitle', 'submissionLink', 'synopsis',
  'status', 'submittedAt', 'score', 'judgeFeedback',
]);

function validateJsonValue(value: unknown, path: string, depth = 0, budget = { nodes: 0 }): asserts value is JsonValue {
  budget.nodes += 1;
  if (budget.nodes > 10000 || depth > 12) throw new Error(`Database JSON field ${path} is too complex.`);
  if (value === null || typeof value === 'boolean') return;
  if (typeof value === 'string') {
    if (value.length > 10000) throw new Error(`Database string ${path} is too long.`);
    return;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`Database number ${path} is invalid.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateJsonValue(item, `${path}[${index}]`, depth + 1, budget));
    return;
  }
  if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        throw new Error(`Unsafe JSON object key at ${path}.${key}.`);
      }
      validateJsonValue(item, `${path}.${key}`, depth + 1, budget);
    }
    return;
  }
  throw new Error(`Unsupported JSON value at ${path}.`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyFields(value: Record<string, unknown>, fields: Set<string>): boolean {
  return Object.keys(value).every((key) => fields.has(key));
}

function isText(
  value: unknown,
  minimum: number,
  maximum: number,
  allowEmpty = false
): value is string {
  return typeof value === 'string'
    && value.length <= maximum
    && (allowEmpty ? value.trim().length === 0 || value.trim().length >= minimum : value.trim().length >= minimum);
}

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function validateCompetitionInput(value: unknown): ValidationErrors {
  if (!isRecord(value)) return { form: 'Competition data must be an object.' };

  const errors: ValidationErrors = {};
  const allowedFields = new Set([
    'title', 'category', 'medium', 'slug', 'description', 'eligibility',
    'ageCategory', 'deadline', 'maxEntriesPerSchool', 'status', 'prizePool',
    'guidelines', 'customFields',
  ]);
  if (!hasOnlyFields(value, allowedFields)) errors.form = 'Competition contains unsupported fields.';
  if (!isText(value.title, 2, 160)) errors.title = 'Title must be between 2 and 160 characters.';
  if (!(CATEGORIES as readonly unknown[]).includes(value.category)) errors.category = 'Select a valid category.';
  if (!(MEDIUMS as readonly unknown[]).includes(value.medium)) errors.medium = 'Select a valid medium.';
  if (typeof value.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug) || value.slug.length > 180) {
    errors.slug = 'Enter a valid competition slug.';
  }
  if (!isText(value.description, 1, 2000)) errors.description = 'Description must be at most 2,000 characters.';
  if (!isText(value.eligibility, 1, 200)) errors.eligibility = 'Eligibility must be at most 200 characters.';
  if (!validDate(value.deadline)) errors.deadline = 'Enter a valid deadline.';
  if (!Number.isInteger(value.maxEntriesPerSchool) || (value.maxEntriesPerSchool as number) < 1 || (value.maxEntriesPerSchool as number) > 10) {
    errors.maxEntriesPerSchool = 'Maximum entries must be between 1 and 10.';
  }
  if (!(['open', 'closed', 'judging', 'upcoming'] as readonly unknown[]).includes(value.status)) {
    errors.status = 'Select a valid competition status.';
  }
  if (!isText(value.prizePool, 1, 200)) errors.prizePool = 'Prize details must be at most 200 characters.';

  if (!Array.isArray(value.guidelines) || value.guidelines.length > 30
    || value.guidelines.some((guideline) => !isText(guideline, 1, 500))) {
    errors.guidelines = 'Guidelines must be a list of up to 30 rules, each at most 500 characters.';
  }

  if (!Array.isArray(value.customFields) || value.customFields.length > 20) {
    errors.customFields = 'Add no more than 20 custom fields.';
  } else {
    const fieldIds = new Set<string>();
    value.customFields.forEach((field, index) => {
      if (!isRecord(field)) {
        errors.customFields = `Custom field ${index + 1} is invalid.`;
        return;
      }
      const allowedFieldKeys = new Set(['id', 'label', 'type', 'required', 'placeholder', 'helperText', 'options']);
      if (!hasOnlyFields(field, allowedFieldKeys)
        || !isText(field.id, 1, 100)
        || !isText(field.label, 1, 120)
        || !(['text', 'textarea', 'url', 'select', 'number'] as readonly unknown[]).includes(field.type)
        || typeof field.required !== 'boolean'
        || (field.placeholder !== undefined && !isText(field.placeholder, 0, 200, true))
        || (field.helperText !== undefined && !isText(field.helperText, 0, 500, true))
        || (field.options !== undefined
          && (!Array.isArray(field.options) || field.options.length > 30
            || field.options.some((option) => !isText(option, 1, 120))))) {
        errors.customFields = `Custom field ${index + 1} is invalid.`;
        return;
      }
      if (fieldIds.has(field.id)) errors.customFields = 'Custom field IDs must be unique.';
      fieldIds.add(field.id);
      if (field.type === 'select' && (!Array.isArray(field.options) || field.options.length === 0)) {
        errors.customFields = `Select field "${field.label}" needs at least one option.`;
      }
    });
  }

  if (value.ageCategory !== undefined) {
    const ageCategory = value.ageCategory;
    if (!isRecord(ageCategory)
      || !hasOnlyFields(ageCategory, new Set(['label', 'minAge', 'maxAge', 'grades']))
      || !isText(ageCategory.label, 1, 100)
      || !Number.isInteger(ageCategory.minAge)
      || !Number.isInteger(ageCategory.maxAge)
      || (ageCategory.minAge as number) < 5
      || (ageCategory.maxAge as number) > 25
      || (ageCategory.minAge as number) > (ageCategory.maxAge as number)
      || !Array.isArray(ageCategory.grades)
      || ageCategory.grades.length === 0
      || ageCategory.grades.some((grade) => typeof grade !== 'string' || !/^Grade (?:[6-9]|1[0-3])$/.test(grade))) {
      errors.ageCategory = 'Age category must include valid ages and eligible grades.';
    }
  }

  return errors;
}

export function calculateAge(birthday: string, now = new Date()): number | null {
  if (!validDate(birthday)) return null;
  const birthDate = new Date(`${birthday}T00:00:00.000Z`);
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayHasPassed =
    now.getUTCMonth() > birthDate.getUTCMonth()
    || (now.getUTCMonth() === birthDate.getUTCMonth()
      && now.getUTCDate() >= birthDate.getUTCDate());
  if (!birthdayHasPassed) age -= 1;
  return age;
}

function validPhone(value: string): boolean {
  if (!/^[\d\s()+-]+$/.test(value)) return false;
  const digits = value.replace(/[\s()+-]/g, '');
  return /^\d{9,12}$/.test(digits);
}

export function validateSchoolRegistration(value: unknown): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!isRecord(value)) return { form: 'Registration data must be an object.' };
  if (!hasOnlyFields(value, ALLOWED_SCHOOL_FIELDS)) {
    errors.form = 'Registration contains unsupported fields.';
  }

  const required: Array<[string, string, number, number]> = [
    ['name', 'School name', 2, 120],
    ['district', 'District', 2, 100],
    ['teacherInCharge', 'Teacher-in-charge name', 2, 100],
    ['teacherPhone', 'Teacher phone', 9, 20],
    ['presidentPhone', 'President phone', 9, 20],
    ['mediaPresident', 'Media Unit President name', 2, 100],
    ['email', 'Email address', 3, 254],
    ['password', 'Password', 12, 128],
  ];

  for (const [field, label, minimum, maximum] of required) {
    if (!isText(value[field], minimum, maximum)) {
      errors[field] = `${label} must be between ${minimum} and ${maximum} characters.`;
    }
  }

  if (typeof value.email === 'string'
    && isText(value.email, 3, 254)
    && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (typeof value.teacherPhone === 'string'
    && isText(value.teacherPhone, 9, 20)
    && !validPhone(value.teacherPhone)) {
    errors.teacherPhone = 'Enter a valid phone number.';
  }
  if (typeof value.province !== 'string' || !SRI_LANKA_PROVINCES.includes(value.province)) {
    errors.province = 'Select a valid province.';
  }

  if (typeof value.presidentPhone === 'string'
    && value.presidentPhone.trim()
    && !validPhone(value.presidentPhone)) {
    errors.presidentPhone = 'Enter a valid phone number.';
  }
  return errors;
}

export function validateSubmissionInput(value: unknown, competitions: Competition[] = []): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!isRecord(value)) return { form: 'Submission data must be an object.' };

  if (!hasOnlyFields(value, ALLOWED_SUBMISSION_FIELDS)) {
    errors.form = 'Submission contains unsupported fields.';
  }

  const competition = typeof value.competitionId === 'string'
    ? competitions.find((item) => item.id === value.competitionId)
    : undefined;

  if (!competition) errors.competitionId = 'Select a valid competition.';

  if (value.competitionTitle !== undefined
    && (typeof value.competitionTitle !== 'string' || (competition && value.competitionTitle !== competition.title))) {
    errors.competitionTitle = 'Competition title does not match the selected competition.';
  }

  if (value.competitionMedium !== undefined && (typeof value.competitionMedium !== 'string' || (competition && value.competitionMedium !== competition.medium))) {
    errors.competitionMedium = 'Competition medium does not match the selected competition.';
  }

  if (value.schoolName !== undefined && !isText(value.schoolName, 2, 120)) {
    errors.schoolName = 'School name must be between 2 and 120 characters.';
  }

  const boundedText: Array<[string, string, number, number]> = [
    ['schoolId', 'School', 1, 100],
    ['studentName', 'Student name', 2, 100],
    ['studentGrade', 'Student grade', 1, 30],
    ['studentContact', 'Student contact', 9, 20],
    ['entryTitle', 'Entry title', 2, 160],
    ['submissionLink', 'Submission link', 8, 2048],
    ['synopsis', 'Synopsis', 20, 10000],
  ];
  for (const [field, label, minimum, maximum] of boundedText) {
    if (!isText(value[field], minimum, maximum)) {
      errors[field] = `${label} must be between ${minimum} and ${maximum} characters.`;
    }
  }

  if (typeof value.studentGrade === 'string'
    && !/^Grade (?:[6-9]|1[0-3])$/.test(value.studentGrade)) {
    errors.studentGrade = 'Select a valid grade (Grade 6–13).';
  } else if (typeof value.studentGrade === 'string'
    && competition?.ageCategory
    && !competition.ageCategory.grades.includes(value.studentGrade)) {
    errors.studentGrade = 'This grade is not eligible for the selected competition.';
  }
  if (typeof value.studentContact === 'string'
    && isText(value.studentContact, 9, 20)
    && !validPhone(value.studentContact)) {
    errors.studentContact = 'Enter a valid phone number.';
  }
  if (!validDate(value.studentBirthday)) {
    errors.studentBirthday = 'Enter a valid birthday in YYYY-MM-DD format.';
  } else {
    const age = calculateAge(value.studentBirthday);
    if (age === null || age < 5 || age > 25 || new Date(`${value.studentBirthday}T00:00:00.000Z`) > new Date()) {
      errors.studentBirthday = 'Student birthday must result in an age between 5 and 25.';
    } else if (competition?.ageCategory
      && (age < competition.ageCategory.minAge || age > competition.ageCategory.maxAge)) {
      errors.studentBirthday = `Student is outside the competition age range (${competition.ageCategory.minAge}–${competition.ageCategory.maxAge}).`;
    }
  }

  if (typeof value.submissionLink === 'string' && isText(value.submissionLink, 8, 2048)) {
    try {
      const url = new URL(value.submissionLink);
      if (!['https:', 'http:'].includes(url.protocol) || !url.hostname) {
        errors.submissionLink = 'Submission link must be a valid HTTP or HTTPS URL.';
      }
    } catch {
      errors.submissionLink = 'Submission link must be a valid HTTP or HTTPS URL.';
    }
  }

  if (typeof value.synopsis === 'string' && isText(value.synopsis, 20, 10000)) {
    const words = value.synopsis.trim().split(/\s+/);
    if (words.length < 20 || words.length > 1000) {
      errors.synopsis = 'Synopsis must contain between 20 and 1,000 words.';
    }
  }

  if (competition) {
    if (value.category !== competition.category) {
      errors.category = 'Category does not match the selected competition.';
    }
    if (value.competitionTitle !== undefined && value.competitionTitle !== competition.title) {
      errors.competitionTitle = 'Competition title does not match the selected competition.';
    }
    if (value.competitionMedium !== undefined && value.competitionMedium !== competition.medium) {
      errors.competitionMedium = 'Competition medium does not match the selected competition.';
    }
  }

  return errors;
}

export function isSubmissionInput(value: unknown): value is NewSubmissionInput {
  if (!isRecord(value) || !hasOnlyFields(value, ALLOWED_SUBMISSION_FIELDS)) return false;

  const requiredTextFields = [
    'competitionId',
    'schoolId',
    'studentName',
    'studentGrade',
    'studentBirthday',
    'studentContact',
    'entryTitle',
    'submissionLink',
    'synopsis',
  ];
  if (requiredTextFields.some((field) => typeof value[field] !== 'string')) return false;
  if (value.competitionTitle !== undefined && typeof value.competitionTitle !== 'string') return false;
  if (value.schoolName !== undefined && typeof value.schoolName !== 'string') return false;
  if (value.competitionMedium !== undefined
    && !(MEDIUMS as readonly unknown[]).includes(value.competitionMedium)) return false;
  if (!(CATEGORIES as readonly unknown[]).includes(value.category)) return false;

  const customValues = value.customValues;
  return customValues === undefined
    || (isRecord(customValues)
      && Object.values(customValues).every((item) => typeof item === 'string'));
}

function assertText(value: unknown, path: string, min = 1, max = 10000): asserts value is string {
  if (!isText(value, min, max)) throw new Error(`Invalid database field ${path}.`);
}

function assertDate(value: unknown, path: string): asserts value is string {
  if (!validDate(value)) throw new Error(`Invalid database date ${path}.`);
}

function validateStoredSchool(value: unknown, index: number): asserts value is RegisteredSchool {
  const path = `schools[${index}]`;
  if (!isRecord(value)) throw new Error(`Invalid database record ${path}.`);
  if (!hasOnlyFields(value, ALLOWED_STORED_SCHOOL_FIELDS)) {
    throw new Error(`Unexpected database fields in ${path}.`);
  }
  assertText(value.id, `${path}.id`, 1, 100);
  assertText(value.name, `${path}.name`, 2, 120);
  assertText(value.registrationNumber, `${path}.registrationNumber`, 1, 50);
  assertText(value.district, `${path}.district`, 2, 100);
  assertText(value.province, `${path}.province`, 1, 50);
  assertText(value.teacherInCharge, `${path}.teacherInCharge`, 2, 100);
  assertText(value.teacherPhone, `${path}.teacherPhone`, 1, 20);
  assertText(value.mediaPresident, `${path}.mediaPresident`, 0, 100);
  assertText(value.presidentPhone, `${path}.presidentPhone`, 0, 20);
  assertText(value.email, `${path}.email`, 3, 254);
  assertText(value.badgeCode, `${path}.badgeCode`, 1, 50);
  if (value.password !== undefined) assertText(value.password, `${path}.password`, 1, 256);
  if (!SRI_LANKA_PROVINCES.includes(value.province as string)) {
    throw new Error(`Invalid database field ${path}.province.`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email as string)) {
    throw new Error(`Invalid database field ${path}.email.`);
  }
  if (!(SCHOOL_STATUSES as readonly unknown[]).includes(value.status)) {
    throw new Error(`Invalid database field ${path}.status.`);
  }
  assertDate(value.registeredAt, `${path}.registeredAt`);
}

function validateStoredCompetition(value: unknown, index: number): asserts value is Competition {
  const path = `competitions[${index}]`;
  if (!isRecord(value) || !isText(value.id, 1, 100)) {
    throw new Error(`Invalid database record ${path}.`);
  }
  if (!hasOnlyFields(value, new Set([
    'id', 'title', 'category', 'medium', 'slug', 'description', 'eligibility',
    'ageCategory', 'deadline', 'maxEntriesPerSchool', 'status', 'prizePool',
    'guidelines', 'customFields',
  ]))) {
    throw new Error(`Unexpected database fields in ${path}.`);
  }
  const input = Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'id'));
  const errors = validateCompetitionInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(`Invalid database competition ${path}: ${Object.values(errors)[0]}`);
  }
}

function validateStoredSubmission(
  value: unknown,
  index: number,
  competitions: Competition[]
): asserts value is Submission {
  const path = `submissions[${index}]`;
  if (!isRecord(value)) throw new Error(`Invalid database record ${path}.`);
  if (!hasOnlyFields(value, ALLOWED_STORED_SUBMISSION_FIELDS)) {
    throw new Error(`Unexpected database fields in ${path}.`);
  }
  assertText(value.id, `${path}.id`, 1, 100);
  assertText(value.competitionId, `${path}.competitionId`, 1, 100);
  assertText(value.competitionTitle, `${path}.competitionTitle`, 1, 160);
  assertText(value.schoolId, `${path}.schoolId`, 1, 100);
  assertText(value.schoolName, `${path}.schoolName`, 2, 120);
  assertText(value.category, `${path}.category`, 1, 80);
  assertText(value.studentName, `${path}.studentName`, 2, 100);
  assertText(value.studentGrade, `${path}.studentGrade`, 1, 30);
  assertText(value.studentContact, `${path}.studentContact`, 1, 20);
  assertText(value.entryTitle, `${path}.entryTitle`, 2, 160);
  assertText(value.submissionLink, `${path}.submissionLink`, 8, 2048);
  assertText(value.synopsis, `${path}.synopsis`, 20, 10000);
  const competition = competitions.find((item) => item.id === value.competitionId);
  if (!competition) {
    throw new Error(`Invalid database field ${path}.competitionId.`);
  }
  if (!(CATEGORIES as readonly unknown[]).includes(value.category)
    || !(MEDIUMS as readonly unknown[]).includes(value.competitionMedium)) {
    throw new Error(`Invalid database category or medium at ${path}.`);
  }
  if (!(SUBMISSION_STATUSES as readonly unknown[]).includes(value.status)) {
    throw new Error(`Invalid database field ${path}.status.`);
  }
  if (!Number.isInteger(value.studentAge) || (value.studentAge as number) < 5 || (value.studentAge as number) > 25) {
    throw new Error(`Invalid database field ${path}.studentAge.`);
  }
  if (!/^Grade (?:[6-9]|1[0-3])$/.test(value.studentGrade as string)) {
    throw new Error(`Invalid database field ${path}.studentGrade.`);
  }
  assertDate(value.studentBirthday, `${path}.studentBirthday`);
  assertDate(value.submittedAt, `${path}.submittedAt`);
  const age = calculateAge(value.studentBirthday);
  if (age !== value.studentAge) {
    throw new Error(`Stored student age does not match birthday at ${path}.`);
  }
  if (typeof value.synopsis === 'string') {
    const wordCount = value.synopsis.trim().split(/\s+/).length;
    if (wordCount < 20 || wordCount > 1000) {
      throw new Error(`Invalid database synopsis at ${path}.`);
    }
  }
  const customValues = value.customValues ?? {};
  if (!isRecord(customValues)
    || Object.entries(customValues).some(([key, item]) => !key || typeof item !== 'string' || item.length > 2000)) {
    throw new Error(`Invalid database custom fields at ${path}.`);
  }
  try {
    const submissionUrl = new URL(value.submissionLink as string);
    if (!['https:', 'http:'].includes(submissionUrl.protocol) || !submissionUrl.hostname) {
      throw new Error();
    }
  } catch {
    throw new Error(`Invalid database field ${path}.submissionLink.`);
  }
  if (value.score !== undefined
    && (typeof value.score !== 'number' || !Number.isFinite(value.score) || value.score < 0 || value.score > 100)) {
    throw new Error(`Invalid database field ${path}.score.`);
  }
  if (value.judgeFeedback !== undefined
    && (typeof value.judgeFeedback !== 'string' || value.judgeFeedback.length > 2000)) {
    throw new Error(`Invalid database field ${path}.judgeFeedback.`);
  }
}

export function validateDatabase(value: unknown): asserts value is DbData {
  if (!isRecord(value) || !Array.isArray(value.competitions)
    || !Array.isArray(value.schools) || !Array.isArray(value.submissions)) {
    throw new Error('Database file must contain competitions, schools, and submissions arrays.');
  }
  if (!hasOnlyFields(value, ALLOWED_DATABASE_FIELDS)) {
    throw new Error('Database file contains unsupported top-level fields.');
  }
  if (value.admin !== undefined && !Array.isArray(value.admin)) {
    throw new Error('Database field admin must be an array.');
  }
  if (Array.isArray(value.admin)) {
    value.admin.forEach((entry, index) => validateJsonValue(entry, `admin[${index}]`));
  }
  value.competitions.forEach(validateStoredCompetition);
  value.schools.forEach(validateStoredSchool);
  value.submissions.forEach((submission, index) =>
    validateStoredSubmission(submission, index, value.competitions as Competition[])
  );

  const competitionIds = new Set<string>();
  const competitionSlugs = new Set<string>();
  for (const competition of value.competitions as Competition[]) {
    if (competitionIds.has(competition.id)) throw new Error(`Duplicate competition id ${competition.id}.`);
    if (competitionSlugs.has(competition.slug)) throw new Error(`Duplicate competition slug ${competition.slug}.`);
    competitionIds.add(competition.id);
    competitionSlugs.add(competition.slug);
  }

  const schoolIds = new Set<string>();
  const schoolEmails = new Set<string>();
  for (const school of value.schools as RegisteredSchool[]) {
    if (schoolIds.has(school.id)) throw new Error(`Duplicate school id ${school.id}.`);
    if (schoolEmails.has(school.email.toLowerCase())) {
      throw new Error(`Duplicate school email ${school.email}.`);
    }
    schoolIds.add(school.id);
    schoolEmails.add(school.email.toLowerCase());
  }
  const submissionIds = new Set<string>();
  for (const submission of value.submissions as Submission[]) {
    if (submissionIds.has(submission.id)) throw new Error(`Duplicate submission id ${submission.id}.`);
    if (!schoolIds.has(submission.schoolId)) {
      throw new Error(`Submission ${submission.id} refers to an unknown school.`);
    }
    if (!competitionIds.has(submission.competitionId)) {
      throw new Error(`Submission ${submission.id} refers to an unknown competition.`);
    }
    submissionIds.add(submission.id);
  }
}
