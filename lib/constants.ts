import { Competition, RegisteredSchool, Submission } from './types';

export const MEDIA_UNIT_INFO = {
  name: 'Agradhi Media Unit',
  institution: 'Saranath College',
  tagline: 'All-Island Inter-School Media Competitions & Media Day',
  email: 'agradhimedia@saranath.edu.lk',
  hotline: 'num_1 / num_2',
  address: 'Media Circle, Saranath College, Kuliyapitiya, North Western Province',
  edition: '2026',
};

export const SRI_LANKA_PROVINCES = [
  'Western Province',
  'Central Province',
  'Southern Province',
  'North Western Province',
  'Sabaragamuwa Province',
  'North Central Province',
  'Uva Province',
  'Northern Province',
  'Eastern Province',
];

const JUNIOR_GRADES = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
const SENIOR_GRADES = ['Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'];
const ALL_GRADES = [...JUNIOR_GRADES, ...SENIOR_GRADES];

export const INITIAL_COMPETITIONS: Competition[] = [
  {
    id: 'agr-news-presenting-s',
    title: 'News Presenting — Sinhala Medium',
    category: 'News Reading & Announcing',
    medium: 'Sinhala',
    slug: 'news-presenting-sinhala',
    description:
      'Students present a prepared Sinhala news bulletin demonstrating proper pronunciation, voice modulation, eye contact, and broadcast composure. Judged on accuracy, delivery, and presentation.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-15',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit an unedited video recording of the student reading the provided sample bulletin.',
      'Formal news anchor attire is mandatory.',
      'Duration: 2 – 4 minutes.',
      'Clear audio — minimal background noise.',
    ]
  },
  {
    id: 'agr-news-presenting-e',
    title: 'News Presenting — English Medium',
    category: 'News Reading & Announcing',
    medium: 'English',
    slug: 'news-presenting-english',
    description:
      'Students present a prepared English news bulletin demonstrating proper pronunciation, voice modulation, eye contact, and broadcast composure.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-15',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit an unedited video recording of the student reading the provided sample bulletin.',
      'Formal news anchor attire is mandatory.',
      'Duration: 2 – 4 minutes.',
    ]
  },
  {
    id: 'agr-news-editing-s',
    title: 'News Editing — Sinhala Medium',
    category: 'News Reading & Announcing',
    medium: 'Sinhala',
    slug: 'news-editing-sinhala',
    description:
      'Participants edit a provided raw Sinhala news script for broadcast — correcting grammar, structure, and clarity while maintaining journalistic standards.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-15',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit the edited script as a PDF or Word document via Google Drive.',
      'Clearly mark changes made to the original.',
    ],
    customFields: [
      { id: 'drive_link', label: 'Google Drive Link (Edited Script)', type: 'url', required: true, placeholder: 'https://drive.google.com/...' },
    ],
  },
  {
    id: 'agr-news-editing-e',
    title: 'News Editing — English Medium',
    category: 'News Reading & Announcing',
    medium: 'English',
    slug: 'news-editing-english',
    description:
      'Participants edit a provided raw English news script for broadcast — correcting grammar, structure, and clarity while maintaining journalistic standards.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-15',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit the edited script as a PDF or Word document via Google Drive.',
    ],
    customFields: [
      { id: 'drive_link', label: 'Google Drive Link (Edited Script)', type: 'url', required: true, placeholder: 'https://drive.google.com/...' },
    ],
  },
  {
    id: 'agr-radio-script-s',
    title: 'Radio Script Writing — Sinhala Medium',
    category: 'Radio Play & Audio Production',
    medium: 'Sinhala',
    slug: 'radio-script-sinhala',
    description:
      'Write an original Sinhala radio script for a 5-minute programme — could be a feature, drama, or documentary segment.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-20',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Script must be 5–7 minutes when read aloud.',
      'Submit as PDF via Google Drive.',
      'Include student name, grade, and school on the cover page.',
    ],
    customFields: [
      { id: 'drive_link', label: 'Google Drive Link (Script PDF)', type: 'url', required: true, placeholder: 'https://drive.google.com/...' },
    ],
  },
  {
    id: 'agr-radio-script-e',
    title: 'Radio Script Writing — English Medium',
    category: 'Radio Play & Audio Production',
    medium: 'English',
    slug: 'radio-script-english',
    description:
      'Write an original English radio script for a 5-minute programme — feature, drama, or documentary.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-20',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Script must be 5–7 minutes when read aloud.',
      'Submit as PDF via Google Drive.',
    ],
    customFields: [
      { id: 'drive_link', label: 'Google Drive Link (Script PDF)', type: 'url', required: true, placeholder: 'https://drive.google.com/...' },
    ],
  },
  {
    id: 'agr-radio-presenting-s',
    title: 'Radio Presenting — Sinhala Medium',
    category: 'Radio Play & Audio Production',
    medium: 'Sinhala',
    slug: 'radio-presenting-sinhala',
    description:
      'Students host a short Sinhala radio programme segment — demonstrating voice quality, pacing, audience engagement, and smooth presentation.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-20',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit audio recording (MP3) or unlisted YouTube link.',
      'Duration: 3 – 5 minutes.',
      'Clear, noise-free recording.',
    ],
    customFields: [
      { id: 'audio_link', label: 'Audio Link (MP3 Drive / YouTube)', type: 'url', required: true, placeholder: 'https://...' },
    ],
  },
  {
    id: 'agr-radio-presenting-e',
    title: 'Radio Presenting — English Medium',
    category: 'Radio Play & Audio Production',
    medium: 'English',
    slug: 'radio-presenting-english',
    description:
      'Students host a short English radio programme segment demonstrating voice quality, pacing, and smooth presentation.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-20',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit audio recording or unlisted YouTube link.',
      'Duration: 3 – 5 minutes.',
    ],
    customFields: [
      { id: 'audio_link', label: 'Audio Link (MP3 Drive / YouTube)', type: 'url', required: true, placeholder: 'https://...' },
    ],
  },
  {
    id: 'agr-programme-presenting-s',
    title: 'Programme Presenting — Sinhala Medium',
    category: 'News Reading & Announcing',
    medium: 'Sinhala',
    slug: 'programme-presenting-sinhala',
    description:
      'Students present a short TV/radio programme segment in Sinhala, demonstrating stage presence, fluency, and programme hosting skills.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-22',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit video recording (unlisted YouTube or Google Drive).',
      'Duration: 3 – 6 minutes.',
      'Smart casual or formal attire.',
    ],
    customFields: [
      { id: 'video_link', label: 'Video Link', type: 'url', required: true, placeholder: 'https://...' },
    ],
  },
  {
    id: 'agr-programme-presenting-e',
    title: 'Programme Presenting — English Medium',
    category: 'News Reading & Announcing',
    medium: 'English',
    slug: 'programme-presenting-english',
    description:
      'Students present a short TV/radio programme segment in English demonstrating stage presence, fluency, and hosting skills.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-22',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit video recording (unlisted YouTube or Google Drive).',
      'Duration: 3 – 6 minutes.',
    ],
    customFields: [
      { id: 'video_link', label: 'Video Link', type: 'url', required: true, placeholder: 'https://...' },
    ],
  },
  {
    id: 'agr-dubbing-s',
    title: 'Dubbing — Sinhala Medium',
    category: 'Radio Play & Audio Production',
    medium: 'Sinhala',
    slug: 'dubbing-sinhala',
    description:
      'Students dub a provided video clip into Sinhala — matching lip sync, voice emotion, and timing with the original content.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-25',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit the dubbed video (Drive link or unlisted YouTube).',
      'Use the provided source clip — do not alter the video.',
      'Clear audio recording, minimal background noise.',
    ],
    customFields: [
      { id: 'dubbed_link', label: 'Dubbed Video Link', type: 'url', required: true, placeholder: 'https://...' },
    ],
  },
  {
    id: 'agr-dubbing-e',
    title: 'Dubbing — English Medium',
    category: 'Radio Play & Audio Production',
    medium: 'English',
    slug: 'dubbing-english',
    description:
      'Students dub a provided video clip into English — matching lip sync, voice emotion, and timing with the original content.',
    eligibility: 'Grades 6 – 13 ',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-25',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit the dubbed video (Drive link or unlisted YouTube).',
      'Use the provided source clip.',
    ],
    customFields: [
      { id: 'dubbed_link', label: 'Dubbed Video Link', type: 'url', required: true, placeholder: 'https://...' },
    ],
  },
  {
    id: 'agr-photography',
    title: 'Photography',
    category: 'Photography',
    medium: 'None',
    slug: 'photography',
    description:
      'Visual storytelling through still photography. Students submit original photographs that capture a meaningful moment, story, or theme.',
    eligibility: 'Grades 6 – 13',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-10',
    maxEntriesPerSchool: 3,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Exhibition Feature',
    guidelines: [
      'Submit high-resolution JPEG (minimum 4MB).',
      'No heavy digital manipulation — natural edits only.',
      'Provide a title and short caption (max 50 words).',
      'Include EXIF data (camera, lens, settings).',
    ],
    customFields: [
      { id: 'photo_link', label: 'Photo Upload Link (Google Drive)', type: 'url', required: true, placeholder: 'https://drive.google.com/...' },
      { id: 'caption', label: 'Photo Title & Caption (max 50 words)', type: 'textarea', required: true, placeholder: 'Title: ...\nCaption: ...' },
    ],
  },
  {
    id: 'agr-announcing',
    title: 'Announcing',
    category: 'News Reading & Announcing',
    medium: 'None',
    slug: 'announcing',
    description:
      'Students deliver a formal announcement for a school or public event — evaluated on clarity, confidence, voice projection, and articulation.',
    eligibility: 'Grades 6 – 13',
    ageCategory: { label: 'All Levels', minAge: 11, maxAge: 20, grades: ALL_GRADES },
    deadline: '2026-11-18',
    maxEntriesPerSchool: 2,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit video or audio recording.',
      'Duration: 1 – 3 minutes.',
      'Formal or smart attire required.',
    ],
    customFields: [
      { id: 'recording_link', label: 'Recording Link (Video/Audio)', type: 'url', required: true, placeholder: 'https://...' },
    ],
  },
  {
    id: 'agr-radio-operator',
    title: 'Radio Operator',
    category: 'Radio Play & Audio Production',
    medium: 'None',
    slug: 'radio-operator',
    description:
      'Participants demonstrate technical radio operation skills — mixing, audio levels, cue management, and live broadcast coordination.',
    eligibility: 'Grades 9 – 13',
    ageCategory: { label: 'Senior Only', minAge: 14, maxAge: 20, grades: SENIOR_GRADES },
    deadline: '2026-11-28',
    maxEntriesPerSchool: 1,
    status: 'open',
    prizePool: 'Gold, Silver & Bronze Medals + Certificate',
    guidelines: [
      'Submit a short recorded demo of a mock broadcast session.',
      'Duration: 5 – 10 minutes.',
      'Include brief write-up of equipment/software used.',
    ],
    customFields: [
      { id: 'demo_link', label: 'Demo Recording Link', type: 'url', required: true, placeholder: 'https://...' },
      { id: 'equipment', label: 'Equipment / Software Used', type: 'text', required: true, placeholder: 'e.g. Audacity, Zoom H5, etc.' },
    ],
  },
];

// Schools and Submissions start empty.
// Schools register via /register. Submissions come via school dashboard or /apply.
export const INITIAL_SCHOOLS: RegisteredSchool[] = [];
export const INITIAL_SUBMISSIONS: Submission[] = [];