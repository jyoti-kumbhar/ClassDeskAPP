import {
  Profile,
  Institute,
  ClassItem,
  Notice,
  Resource,
  Assignment,
  AttendanceRecord,
  Exam,
  ResourceLabelType,
  FileUploadMetadata,
} from '../types';

let __id = 1000;
export const uid = (prefix = 'id') => `${prefix}_${(__id++).toString(36)}`;

export const genCode = (len = 6) => {
  const chars = '0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

export const genInstCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out.slice(0, 3) + '-' + out.slice(3);
};

export const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
};

export const hoursFromNow = (n: number) => {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d.toISOString();
};

export const isPast = (iso?: string | null) => {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
};

export const isFuture = (iso?: string | null) => {
  if (!iso) return false;
  return new Date(iso).getTime() > Date.now();
};

export const fmtDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const fmtDateShort = (iso: string) => {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
};

export const fmtDateTime = (iso: string) => {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const fmtClock = (iso: string) => {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export interface AppDatabase {
  institute: Institute;
  users: Profile[];
  classes: ClassItem[];
  classSubjects: Record<string, string[]>;
  resourceLabels: string[];
  notices: Notice[];
  resources: Resource[];
  assignments: Assignment[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  fileUploads: FileUploadMetadata[];
}

export function createInitialSeed(): AppDatabase {
  const institute: Institute = {
    id: uid('inst'),
    name: 'Crestwood Academy',
    code: 'CREST-2026',
    createdAt: daysAgo(30),
  };

  const admin: Profile = {
    id: 'u_admin',
    name: 'Meera Kapoor',
    email: 'admin@crestwood.edu',
    role: 'admin',
    status: 'active',
    instituteId: institute.id,
  };

  const teach1: Profile = {
    id: 'u_teach1',
    name: 'Rohan Iyer',
    email: 'rohan.iyer@crestwood.edu',
    role: 'teacher',
    status: 'active',
    instituteId: institute.id,
  };

  const teach2: Profile = {
    id: 'u_teach2',
    name: 'Ananya Sen',
    email: 'ananya.sen@crestwood.edu',
    role: 'teacher',
    status: 'active',
    instituteId: institute.id,
  };

  const studentNames = [
    'Aarav Shah',
    'Diya Patel',
    'Kabir Malhotra',
    'Ishita Rao',
    'Vihaan Nair',
    'Sara Fernandes',
  ];

  const students: Profile[] = studentNames.map((name, idx) => ({
    id: `u_stud${idx + 1}`,
    name,
    email: `${name.toLowerCase().replace(/ /g, '.')}@student.crestwood.edu`,
    role: 'student',
    status: 'active',
    instituteId: institute.id,
  }));

  const [s1, s2, s3, s4, s5, s6] = students;

  const c1: ClassItem = {
    id: uid('c'),
    name: 'Physics XI-A',
    subject: 'Physics',
    teacherId: teach1.id,
    joinCode: '491823',
    studentIds: [s1.id, s2.id, s3.id, s4.id],
    createdAt: daysAgo(20),
  };

  const c2: ClassItem = {
    id: uid('c'),
    name: 'English Lit X-B',
    subject: 'English Literature',
    teacherId: teach2.id,
    joinCode: '820194',
    studentIds: [s2.id, s3.id, s5.id, s6.id],
    createdAt: daysAgo(20),
  };

  const classes = [c1, c2];
  const classSubjects = {
    [c1.id]: [c1.subject, 'Lab'],
    [c2.id]: [c2.subject],
  };

  const resourceLabels = ['Notes', 'Google Drive', 'YouTube', 'PDF', 'Website'];

  const notices: Notice[] = [
    {
      id: uid('n'),
      classId: c1.id,
      authorId: teach1.id,
      title: 'Lab coats mandatory from Monday',
      body: 'Please bring your lab coats and safety goggles starting next week for the optics practicals.',
      date: daysAgo(1),
      scheduledFor: null,
    },
    {
      id: uid('n'),
      classId: c1.id,
      authorId: teach1.id,
      title: 'Unit Test 2 postponed',
      body: 'Due to the sports meet, Unit Test 2 has been moved to next Friday.',
      date: daysAgo(4),
      scheduledFor: null,
    },
    {
      id: uid('n'),
      classId: c2.id,
      authorId: teach2.id,
      title: "Bring your annotated copies of 'The Tempest'",
      body: "We'll be discussing Act III in tomorrow's class — come with your annotations ready.",
      date: daysAgo(2),
      scheduledFor: null,
    },
    {
      id: uid('n'),
      classId: c1.id,
      authorId: teach1.id,
      title: 'Guest lecture next week',
      body: 'A guest lecture on quantum optics is planned — details to follow.',
      date: daysAgo(0),
      scheduledFor: hoursFromNow(30),
    },
  ];

  const resources: Resource[] = [
    {
      id: uid('r'),
      classId: c1.id,
      authorId: teach1.id,
      title: 'Optics — Unit Notes & Videos',
      description: 'Everything you need for Chapter 9 practicals, including the refraction primer.',
      date: daysAgo(6),
      scheduledFor: null,
      links: [
        { id: uid('l'), type: 'Notes', label: 'Chapter 9 handout (PDF)', url: 'https://drive.google.com/example-optics-notes' },
        { id: uid('l'), type: 'YouTube', label: 'Refraction explained', url: 'https://youtube.com/watch?v=example1' },
      ],
    },
    {
      id: uid('r'),
      classId: c2.id,
      authorId: teach2.id,
      title: 'The Tempest — Background reading',
      description: 'Historical context and a character map to help with Act III discussion.',
      date: daysAgo(5),
      scheduledFor: null,
      links: [
        { id: uid('l'), type: 'Website', label: 'Folger Shakespeare Library edition', url: 'https://folger.edu/example-tempest' },
        { id: uid('l'), type: 'Google Drive', label: 'Character map (PDF)', url: 'https://drive.google.com/example-tempest-map' },
      ],
    },
  ];

  const assignments: Assignment[] = [
    {
      id: uid('a'),
      classId: c1.id,
      authorId: teach1.id,
      title: 'Lens Ray-Diagram Problem Set',
      description: 'Solve problems 1–12 from Chapter 9 and submit a scanned copy or typed doc.',
      deadline: hoursFromNow(-30),
      scheduledFor: null,
      maxMarks: 20,
      resources: [
        { id: uid('l'), label: 'Formula sheet', url: 'https://drive.google.com/example-formula-sheet' },
      ],
      submissions: [
        {
          studentId: s1.id,
          link: 'https://docs.google.com/example-s1',
          status: 'Reviewed',
          feedback: 'Good work, watch sign conventions in Q7.',
          marks: 17,
          submittedAt: daysAgo(3),
        },
        {
          studentId: s2.id,
          link: 'https://docs.google.com/example-s2',
          status: 'Pending',
          feedback: '',
          marks: null,
          submittedAt: daysAgo(1),
        },
      ],
    },
    {
      id: uid('a'),
      classId: c1.id,
      authorId: teach1.id,
      title: 'Lab Report — Convex Mirror',
      description: 'Submit your lab report as a PDF.',
      deadline: hoursFromNow(72),
      scheduledFor: null,
      maxMarks: 15,
      resources: [],
      submissions: [],
    },
    {
      id: uid('a'),
      classId: c2.id,
      authorId: teach2.id,
      title: "Essay: Prospero's Redemption",
      description: "800-word essay on Prospero's arc in Act V. Submit a document link or file.",
      deadline: hoursFromNow(48),
      scheduledFor: null,
      maxMarks: 10,
      resources: [],
      submissions: [
        {
          studentId: s5.id,
          link: 'https://docs.google.com/example-s5-essay',
          status: 'Needs Revision',
          feedback: 'Strong thesis — expand your evidence in paragraph 3.',
          marks: null,
          submittedAt: daysAgo(1),
        },
      ],
    },
  ];

  // Generate attendance records
  const attendance: AttendanceRecord[] = [];
  for (let i = 12; i >= 1; i--) {
    const d = new Date(daysAgo(i));
    if (d.getDay() % 6 === 0) continue; // skip weekends
    const records1: Record<string, 'P' | 'A' | 'L'> = {};
    c1.studentIds.forEach((sid) => {
      let roll = Math.random();
      if (sid === s3.id) roll = Math.random() * 0.55;
      records1[sid] = roll > 0.8 ? 'A' : roll > 0.68 ? 'L' : 'P';
    });
    attendance.push({
      id: uid('att'),
      classId: c1.id,
      date: daysAgo(i).slice(0, 10),
      subject: c1.subject,
      time: '09:00',
      records: records1,
    });

    const records2: Record<string, 'P' | 'A' | 'L'> = {};
    c2.studentIds.forEach((sid) => {
      let roll = Math.random();
      if (sid === s6.id) roll = Math.random() * 0.55;
      records2[sid] = roll > 0.8 ? 'A' : roll > 0.68 ? 'L' : 'P';
    });
    attendance.push({
      id: uid('att'),
      classId: c2.id,
      date: daysAgo(i).slice(0, 10),
      subject: c2.subject,
      time: '11:30',
      records: records2,
    });
  }

  const examDone: Exam = {
    id: uid('e'),
    classId: c1.id,
    authorId: teach1.id,
    title: 'Unit Test 1 — Reflection & Refraction',
    duration: 15,
    startTime: daysAgo(6),
    endTime: daysAgo(5),
    resultsReleased: true,
    questions: [
      { id: uid('q'), q: 'Light bends towards the normal when entering a', options: ['Rarer medium', 'Denser medium', 'Vacuum', 'Mirror'], correct: 1 },
      { id: uid('q'), q: 'The image formed by a plane mirror is', options: ['Real, inverted', 'Virtual, erect', 'Real, erect', 'Virtual, inverted'], correct: 1 },
      { id: uid('q'), q: 'Focal length of a plane mirror is', options: ['Zero', 'Infinity', 'Equal to radius', 'Negative'], correct: 1 },
      { id: uid('q'), q: 'Critical angle is associated with', options: ['Reflection only', 'Total internal reflection', 'Dispersion', 'Polarisation'], correct: 1 },
    ],
    attempts: [
      { studentId: s1.id, answers: [1, 1, 1, 1], score: 4, warnings: 0, cheatFlag: false, violations: [], submittedAt: daysAgo(5), timeTakenSec: 420 },
      { studentId: s2.id, answers: [1, 1, 0, 1], score: 3, warnings: 1, cheatFlag: false, violations: [{ reason: 'switched to another browser tab', time: daysAgo(5) }], submittedAt: daysAgo(5), timeTakenSec: 505 },
      {
        studentId: s3.id,
        answers: [1, 1, 1, 3],
        score: 3,
        warnings: 3,
        cheatFlag: true,
        violations: [
          { reason: 'switched to another browser tab', time: daysAgo(5) },
          { reason: 'exam window lost focus', time: daysAgo(5) },
          { reason: 'exited full-screen mode', time: daysAgo(5) },
        ],
        submittedAt: daysAgo(5),
        timeTakenSec: 300,
      },
      { studentId: s4.id, answers: [0, 1, 1, 1], score: 3, warnings: 0, cheatFlag: false, violations: [], submittedAt: daysAgo(5), timeTakenSec: 480 },
    ],
  };

  const examLive: Exam = {
    id: uid('e'),
    classId: c1.id,
    authorId: teach1.id,
    title: 'Pop Quiz — Lens Basics',
    duration: 8,
    startTime: daysAgo(0.02),
    endTime: hoursFromNow(20),
    resultsReleased: false,
    questions: [
      { id: uid('q'), q: 'A convex lens is also called a', options: ['Diverging lens', 'Converging lens', 'Plane lens', 'Concave lens'], correct: 1 },
      { id: uid('q'), q: 'Power of a lens is measured in', options: ['Watts', 'Diopters', 'Newtons', 'Joules'], correct: 1 },
      { id: uid('q'), q: 'The unit of focal length is', options: ['Metre', 'Diopter', 'Candela', 'Lux'], correct: 0 },
    ],
    attempts: [],
  };

  const examUpcoming: Exam = {
    id: uid('e'),
    classId: c2.id,
    authorId: teach2.id,
    title: 'Act III–V Comprehension Check',
    duration: 10,
    startTime: hoursFromNow(30),
    endTime: hoursFromNow(48),
    resultsReleased: false,
    questions: [
      { id: uid('q'), q: "Who is the rightful Duke of Milan in 'The Tempest'?", options: ['Antonio', 'Prospero', 'Alonso', 'Sebastian'], correct: 1 },
      { id: uid('q'), q: 'Ariel is best described as a', options: ['Human servant', 'Spirit bound to Prospero', "King's advisor", 'Sea captain'], correct: 1 },
    ],
    attempts: [],
  };

  return {
    institute,
    users: [admin, teach1, teach2, ...students],
    classes,
    classSubjects,
    resourceLabels,
    notices,
    resources,
    assignments,
    attendance,
    exams: [examDone, examLive, examUpcoming],
    fileUploads: [],
  };
}
