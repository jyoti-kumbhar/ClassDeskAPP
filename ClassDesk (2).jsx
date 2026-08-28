import React, { useState, useEffect, useRef } from "react";
import {
  Home, BookOpen, Bell, FileText, ClipboardCheck, CalendarCheck, Brain,
  Users, LogOut, Sun, Moon, Plus, X, Check, Download, ChevronRight,
  AlertTriangle, ShieldAlert, Trash2, Link as LinkIcon, Copy, School,
  GraduationCap, UserCog, Clock, ArrowLeft, Mail, KeyRound,
  CheckCircle2, XCircle, Trophy, UserX, UserCheck, RefreshCw, Youtube,
  FileType2, Globe, StickyNote, Folder, ChevronLeft, Pencil, Filter,
  Tag, Eye, EyeOff, CalendarClock, ListChecks, Lock, Maximize, Activity
} from "lucide-react";

/* =========================================================================
   UTILITIES
   ========================================================================= */
let __id = 1000;
const uid = (p = "id") => `${p}_${(__id++).toString(36)}`;
const genCode = (len = 6) => { const chars = "0123456789"; let out = ""; for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]; return out; };
const genInstCode = () => { const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let out = ""; for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]; return out.slice(0, 3) + "-" + out.slice(3); };
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const fmtDateShort = (iso) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
const fmtDateTime = (iso) => new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtClock = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(9, 0, 0, 0); return d.toISOString(); };
const hoursFromNow = (n) => { const d = new Date(); d.setHours(d.getHours() + n); return d.toISOString(); };
const isPast = (iso) => new Date(iso).getTime() < Date.now();
const isFuture = (iso) => new Date(iso).getTime() > Date.now();
const todayStr = () => new Date().toISOString().slice(0, 10);
const nowTimeStr = () => new Date().toTimeString().slice(0, 5);
const monthOf = (dateStr) => dateStr.slice(0, 7);
const monthLabel = (m) => new Date(m + "-02").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const isVisible = (item) => !item.scheduledFor || !isFuture(item.scheduledFor);

/* =========================================================================
   SEED DATA
   ========================================================================= */
function createSeed() {
  const institute = { name: "Crestwood Academy", code: genInstCode() };

  const admin = { id: uid("u"), name: "Meera Kapoor", email: "admin@crestwood.edu", role: "admin", status: "active", verified: true, password: "demo" };
  const teach1 = { id: uid("u"), name: "Rohan Iyer", email: "rohan.iyer@crestwood.edu", role: "teacher", status: "active", verified: true, password: "demo" };
  const teach2 = { id: uid("u"), name: "Ananya Sen", email: "ananya.sen@crestwood.edu", role: "teacher", status: "active", verified: true, password: "demo" };

  const studentNames = ["Aarav Shah", "Diya Patel", "Kabir Malhotra", "Ishita Rao", "Vihaan Nair", "Sara Fernandes"];
  const students = studentNames.map((name) => ({
    id: uid("u"), name, email: name.toLowerCase().replace(/ /g, ".") + "@student.crestwood.edu",
    role: "student", status: "active", verified: true, password: "demo",
  }));
  const [s1, s2, s3, s4, s5, s6] = students;

  const c1 = { id: uid("c"), name: "Physics XI-A", subject: "Physics", teacherId: teach1.id, joinCode: genCode(6), studentIds: [s1.id, s2.id, s3.id, s4.id] };
  const c2 = { id: uid("c"), name: "English Lit X-B", subject: "English Literature", teacherId: teach2.id, joinCode: genCode(6), studentIds: [s2.id, s3.id, s5.id, s6.id] };
  const classes = [c1, c2];
  const classSubjects = { [c1.id]: [c1.subject, "Lab"], [c2.id]: [c2.subject] };
  const resourceLabels = ["Notes", "Google Drive", "YouTube", "PDF", "Website"];

  const notices = [
    { id: uid("n"), classId: c1.id, title: "Lab coats mandatory from Monday", body: "Please bring your lab coats and safety goggles starting next week for the optics practicals.", date: daysAgo(1), teacherId: teach1.id, scheduledFor: null },
    { id: uid("n"), classId: c1.id, title: "Unit Test 2 postponed", body: "Due to the sports meet, Unit Test 2 has been moved to next Friday.", date: daysAgo(4), teacherId: teach1.id, scheduledFor: null },
    { id: uid("n"), classId: c2.id, title: "Bring your annotated copies of 'The Tempest'", body: "We'll be discussing Act III in tomorrow's class — come with your annotations ready.", date: daysAgo(2), teacherId: teach2.id, scheduledFor: null },
    { id: uid("n"), classId: c1.id, title: "Guest lecture next week", body: "A guest lecture on quantum optics is planned — details to follow.", date: daysAgo(0), teacherId: teach1.id, scheduledFor: hoursFromNow(30) },
  ];

  const resources = [
    { id: uid("r"), classId: c1.id, title: "Optics — Unit Notes & Videos", description: "Everything you need for the Chapter 9 practicals, including the refraction primer video.", date: daysAgo(6), scheduledFor: null, links: [
      { id: uid("l"), type: "Notes", label: "Chapter 9 handout (PDF)", url: "https://drive.google.com/example-optics-notes" },
      { id: uid("l"), type: "YouTube", label: "Refraction explained", url: "https://youtube.com/watch?v=example1" },
    ]},
    { id: uid("r"), classId: c2.id, title: "The Tempest — Background reading", description: "Historical context and a character map to help with Act III discussion.", date: daysAgo(5), scheduledFor: null, links: [
      { id: uid("l"), type: "Website", label: "Folger Shakespeare Library edition", url: "https://folger.edu/example-tempest" },
      { id: uid("l"), type: "Google Drive", label: "Character map (PDF)", url: "https://drive.google.com/example-tempest-map" },
    ]},
  ];

  const assignments = [
    { id: uid("a"), classId: c1.id, title: "Lens Ray-Diagram Problem Set", description: "Solve problems 1–12 from Chapter 9 and submit a scanned copy or typed doc.", deadline: hoursFromNow(-30), scheduledFor: null, maxMarks: 20, resources: [
      { id: uid("l"), label: "Formula sheet", url: "https://drive.google.com/example-formula-sheet" },
    ], submissions: [
      { studentId: s1.id, link: "https://docs.google.com/example-s1", status: "Reviewed", feedback: "Good work, watch sign conventions in Q7.", marks: 17, submittedAt: daysAgo(3) },
      { studentId: s2.id, link: "https://docs.google.com/example-s2", status: "Pending", feedback: "", marks: null, submittedAt: daysAgo(1) },
    ]},
    { id: uid("a"), classId: c1.id, title: "Lab Report — Convex Mirror", description: "Submit your lab report as a PDF via Drive link.", deadline: hoursFromNow(72), scheduledFor: null, maxMarks: null, resources: [], submissions: [] },
    { id: uid("a"), classId: c2.id, title: "Essay: Prospero's Redemption", description: "800-word essay on Prospero's arc in Act V. Submit a Google Docs link.", deadline: hoursFromNow(48), scheduledFor: null, maxMarks: 10, resources: [], submissions: [
      { studentId: s5.id, link: "https://docs.google.com/example-s5-essay", status: "Needs Revision", feedback: "Strong thesis — expand your evidence in paragraph 3.", marks: null, submittedAt: daysAgo(1) },
    ]},
  ];

  function buildAttendance(cls, weakStudentId, subject, time) {
    const recs = [];
    for (let i = 12; i >= 1; i--) {
      const d = new Date(daysAgo(i));
      if (d.getDay() % 6 === 0) continue;
      const records = {};
      cls.studentIds.forEach((sid) => {
        let roll = Math.random();
        if (sid === weakStudentId) roll = Math.random() * 0.55;
        records[sid] = roll > 0.8 ? "A" : roll > 0.68 ? "L" : "P";
      });
      recs.push({ id: uid("att"), classId: cls.id, date: daysAgo(i).slice(0, 10), subject, time, records });
    }
    return recs;
  }
  let attendance = [...buildAttendance(c1, s3.id, c1.subject, "09:00"), ...buildAttendance(c2, s6.id, c2.subject, "11:30")];
  [3, 7].forEach((i) => {
    const records = {}; c1.studentIds.forEach((sid) => { records[sid] = Math.random() > 0.2 ? "P" : "A"; });
    attendance.push({ id: uid("att"), classId: c1.id, date: daysAgo(i).slice(0, 10), subject: "Lab", time: "13:00", records });
  });

  const mkQ = (q, options, correct) => ({ id: uid("q"), q, options, correct });
  const examDone = {
    id: uid("e"), classId: c1.id, title: "Unit Test 1 — Reflection & Refraction", duration: 15,
    startTime: daysAgo(6), endTime: daysAgo(5), resultsReleased: true,
    questions: [
      mkQ("Light bends towards the normal when entering a", ["Rarer medium", "Denser medium", "Vacuum", "Mirror"], 1),
      mkQ("The image formed by a plane mirror is", ["Real, inverted", "Virtual, erect", "Real, erect", "Virtual, inverted"], 1),
      mkQ("Focal length of a plane mirror is", ["Zero", "Infinity", "Equal to radius", "Negative"], 1),
      mkQ("Critical angle is associated with", ["Reflection only", "Total internal reflection", "Dispersion", "Polarisation"], 1),
    ],
    attempts: [
      { studentId: s1.id, answers: [1, 1, 1, 1], score: 4, warnings: 0, cheatFlag: false, violations: [], submittedAt: daysAgo(5), timeTakenSec: 420 },
      { studentId: s2.id, answers: [1, 1, 0, 1], score: 3, warnings: 1, cheatFlag: false, violations: [{ reason: "switched to another browser tab", time: daysAgo(5) }], submittedAt: daysAgo(5), timeTakenSec: 505 },
      { studentId: s3.id, answers: [1, 1, 1, 3], score: 3, warnings: 3, cheatFlag: true, violations: [
        { reason: "switched to another browser tab", time: daysAgo(5) },
        { reason: "exam window lost focus (possible alt-tab or second monitor)", time: daysAgo(5) },
        { reason: "exited full-screen mode", time: daysAgo(5) },
      ], submittedAt: daysAgo(5), timeTakenSec: 300 },
      { studentId: s4.id, answers: [0, 1, 1, 1], score: 3, warnings: 0, cheatFlag: false, violations: [], submittedAt: daysAgo(5), timeTakenSec: 480 },
    ],
  };
  const examLive = {
    id: uid("e"), classId: c1.id, title: "Pop Quiz — Lens Basics", duration: 8,
    startTime: daysAgo(0.02), endTime: hoursFromNow(20), resultsReleased: false,
    questions: [
      mkQ("A convex lens is also called a", ["Diverging lens", "Converging lens", "Plane lens", "Concave lens"], 1),
      mkQ("Power of a lens is measured in", ["Watts", "Diopters", "Newtons", "Joules"], 1),
      mkQ("The unit of focal length is", ["Metre", "Diopter", "Candela", "Lux"], 0),
    ],
    attempts: [],
  };
  const examUpcoming = {
    id: uid("e"), classId: c2.id, title: "Act III–V Comprehension Check", duration: 10,
    startTime: hoursFromNow(30), endTime: hoursFromNow(48), resultsReleased: false,
    questions: [
      mkQ("Who is the rightful Duke of Milan in 'The Tempest'?", ["Antonio", "Prospero", "Alonso", "Sebastian"], 1),
      mkQ("Ariel is best described as a", ["Human servant", "Spirit bound to Prospero", "King's advisor", "Sea captain"], 1),
    ],
    attempts: [],
  };
  const exams = [examDone, examLive, examUpcoming];

  return { institute, users: [admin, teach1, teach2, ...students], classes, classSubjects, resourceLabels, notices, resources, assignments, attendance, exams };
}

/* =========================================================================
   SMALL UI ATOMS
   ========================================================================= */
function Stamp({ children, tone = "neutral" }) { return <span className={`cd-stamp cd-stamp-${tone}`}>{children}</span>; }

function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, type = "button", disabled, full }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`cd-btn cd-btn-${variant} cd-btn-${size} ${full ? "cd-btn-full" : ""}`}>
      {Icon && <Icon size={16} />}{children}
    </button>
  );
}

function Field({ label, children }) { return <label className="cd-field"><span className="cd-field-label">{label}</span>{children}</label>; }
function Input(props) { return <input {...props} className={`cd-input ${props.className || ""}`} />; }
function TextArea(props) { return <textarea {...props} className={`cd-input cd-textarea ${props.className || ""}`} />; }
function Select({ children, ...props }) { return <select {...props} className={`cd-input ${props.className || ""}`}>{children}</select>; }

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="cd-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`cd-modal ${wide ? "cd-modal-wide" : ""}`}>
        <div className="cd-modal-head"><h3>{title}</h3><button className="cd-icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="cd-modal-body">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint }) {
  return <div className="cd-empty"><Icon size={30} strokeWidth={1.5} /><p className="cd-empty-title">{title}</p>{hint && <p className="cd-empty-hint">{hint}</p>}</div>;
}

function Toast({ toast }) { if (!toast) return null; return <div className={`cd-toast cd-toast-${toast.type}`}>{toast.msg}</div>; }
function CodeChip({ code, onCopy }) { return <button className="cd-code-chip" onClick={onCopy} title="Copy code"><span>{code}</span><Copy size={13} /></button>; }

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="cd-row-icon-actions">
      {onEdit && <button className="cd-icon-btn" title="Edit" onClick={onEdit}><Pencil size={14} /></button>}
      {onDelete && <button className="cd-icon-btn cd-icon-btn-danger" title="Delete" onClick={onDelete}><Trash2 size={14} /></button>}
    </div>
  );
}

function ScheduleField({ scheduledFor, setScheduledFor }) {
  const enabled = scheduledFor !== null;
  return (
    <div className="cd-schedule-field">
      <label className="cd-checkbox-row">
        <input type="checkbox" checked={enabled} onChange={(e) => setScheduledFor(e.target.checked ? hoursFromNow(24).slice(0, 16) : null)} />
        <CalendarClock size={14} /> Schedule for later
      </label>
      {enabled && <Input type="datetime-local" value={scheduledFor || ""} onChange={(e) => setScheduledFor(e.target.value)} />}
    </div>
  );
}

const LINK_ICON = { "Google Drive": Folder, Drive: Folder, YouTube: Youtube, PDF: FileType2, Website: Globe, Notes: StickyNote };

function LabelSelect({ value, onChange, labels, onAddLabel }) {
  const [adding, setAdding] = useState(false); const [newLabel, setNewLabel] = useState("");
  if (adding) {
    return (
      <div className="cd-label-add-row">
        <Input autoFocus placeholder="New label" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && newLabel.trim()) { onAddLabel(newLabel.trim()); onChange(newLabel.trim()); setAdding(false); setNewLabel(""); } }} />
        <button className="cd-icon-btn" onClick={() => { if (newLabel.trim()) { onAddLabel(newLabel.trim()); onChange(newLabel.trim()); } setAdding(false); setNewLabel(""); }}><Check size={15} /></button>
        <button className="cd-icon-btn" onClick={() => setAdding(false)}><X size={15} /></button>
      </div>
    );
  }
  return (
    <Select value={value} onChange={(e) => { if (e.target.value === "__add__") setAdding(true); else onChange(e.target.value); }}>
      {labels.map((t) => <option key={t} value={t}>{t}</option>)}
      <option value="__add__">+ Create new label…</option>
    </Select>
  );
}

function ManageLabelsModal({ db, setDb, onClose, showToast }) {
  const [newLabel, setNewLabel] = useState("");
  const add = () => { const v = newLabel.trim(); if (!v) return; if (db.resourceLabels.includes(v)) { showToast("That label already exists.", "info"); return; } setDb((p) => ({ ...p, resourceLabels: [...p.resourceLabels, v] })); setNewLabel(""); };
  const remove = (label) => { setDb((p) => ({ ...p, resourceLabels: p.resourceLabels.filter((l) => l !== label) })); };
  return (
    <Modal title="Manage resource labels" onClose={onClose}>
      <div className="cd-form">
        <div className="cd-label-manage-list">
          {db.resourceLabels.map((l) => (
            <div key={l} className="cd-label-manage-row"><Tag size={13} /><span>{l}</span><button className="cd-icon-btn cd-icon-btn-danger" onClick={() => remove(l)}><Trash2 size={13} /></button></div>
          ))}
        </div>
        <div className="cd-label-add-row">
          <Input placeholder="New label name" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          <Btn size="sm" icon={Plus} onClick={add}>Add</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================================
   AUTH SCREENS
   ========================================================================= */
function AuthShell({ children }) {
  return (
    <div className="cd-auth-shell">
      <div className="cd-auth-brand">
        <div className="cd-auth-badge"><School size={22} /></div>
        <div><div className="cd-auth-brand-name">ClassDesk</div><div className="cd-auth-brand-tag">The staff room, roll call and gradebook — in one place.</div></div>
      </div>
      <div className="cd-auth-card">{children}</div>
      <p className="cd-auth-foot">Prototype build · data resets on refresh</p>
    </div>
  );
}

const ROLE_OPTS = [{ k: "admin", label: "Admin", icon: UserCog }, { k: "teacher", label: "Teacher", icon: GraduationCap }, { k: "student", label: "Student", icon: BookOpen }];

function LoginScreen({ db, onLogin, onGoSignup, onGoForgot, showToast }) {
  const [role, setRole] = useState("teacher");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const demoUsers = { admin: "Meera Kapoor", teacher: "Rohan Iyer", student: "Aarav Shah" };
  const quickLogin = () => { const name = demoUsers[role]; const u = db.users.find((x) => x.role === role && x.name === name); if (u) onLogin(u.id); };
  const submit = (e) => {
    e.preventDefault();
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) { showToast("No account found with that email.", "danger"); return; }
    if (u.role !== role) { showToast(`This email is registered as ${u.role}, not ${role}.`, "danger"); return; }
    if (!u.verified) { showToast("Please verify your email before logging in.", "danger"); return; }
    if (u.status === "inactive") { showToast("This account has been deactivated by your institute admin.", "danger"); return; }
    if (!password) { showToast("Enter your password.", "danger"); return; }
    onLogin(u.id);
  };
  return (
    <AuthShell>
      <h2 className="cd-auth-title">Welcome back</h2>
      <p className="cd-auth-sub">Log in to your ClassDesk account</p>
      <div className="cd-role-picker">
        {ROLE_OPTS.map((r) => <button key={r.k} type="button" className={`cd-role-opt ${role === r.k ? "cd-role-opt-active" : ""}`} onClick={() => setRole(r.k)}><r.icon size={18} /><span>{r.label}</span></button>)}
      </div>
      <form onSubmit={submit} className="cd-form">
        <Field label="Email"><Input type="email" placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label="Password"><Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        <button type="button" className="cd-link-btn" onClick={onGoForgot}>Forgot password?</button>
        <Btn type="submit" full>Log in as {role}</Btn>
      </form>
      <div className="cd-auth-divider"><span>or try a demo account</span></div>
      <Btn variant="ghost" full onClick={quickLogin}>Quick demo login — {demoUsers[role]}</Btn>
      <p className="cd-auth-switch">New to ClassDesk? <button className="cd-link-btn" onClick={onGoSignup}>Create an account</button></p>
    </AuthShell>
  );
}

function SignupScreen({ onSignup, onGoLogin }) {
  const [role, setRole] = useState("student"); const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const submit = (e) => { e.preventDefault(); onSignup({ role, name, email, password }); };
  return (
    <AuthShell>
      <h2 className="cd-auth-title">Create your account</h2>
      <p className="cd-auth-sub">Choose your role to get started</p>
      <div className="cd-role-picker">
        {ROLE_OPTS.map((r) => <button key={r.k} type="button" className={`cd-role-opt ${role === r.k ? "cd-role-opt-active" : ""}`} onClick={() => setRole(r.k)}><r.icon size={18} /><span>{r.label}</span></button>)}
      </div>
      <form onSubmit={submit} className="cd-form">
        <Field label="Full name"><Input placeholder="Jordan Lee" value={name} onChange={(e) => setName(e.target.value)} required /></Field>
        <Field label="Email"><Input type="email" placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label="Password"><Input type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} /></Field>
        <Btn type="submit" full>Sign up as {role}</Btn>
      </form>
      <p className="cd-auth-switch">Already have an account? <button className="cd-link-btn" onClick={onGoLogin}>Log in</button></p>
    </AuthShell>
  );
}

function VerifyScreen({ pendingUser, onVerify, onResend, showToast }) {
  return (
    <AuthShell>
      <div className="cd-verify-icon"><Mail size={26} /></div>
      <h2 className="cd-auth-title">Verify your email</h2>
      <p className="cd-auth-sub">We sent a verification link to <strong>{pendingUser?.email}</strong>.</p>
      <div className="cd-verify-box"><p>This is a prototype, so there's no real inbox — use the buttons below to simulate the email flow.</p></div>
      <div className="cd-form">
        <Btn full icon={CheckCircle2} onClick={onVerify}>I clicked the verification link</Btn>
        <Btn full variant="ghost" icon={RefreshCw} onClick={() => { onResend(); showToast("Verification email resent (simulated).", "info"); }}>Resend email</Btn>
      </div>
    </AuthShell>
  );
}

function ForgotScreen({ db, onGoLogin, showToast }) {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  const submit = (e) => { e.preventDefault(); const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase()); if (!u) { showToast("No account with that email.", "danger"); return; } setSent(true); };
  return (
    <AuthShell>
      <div className="cd-verify-icon"><KeyRound size={26} /></div>
      <h2 className="cd-auth-title">Reset your password</h2>
      {!sent ? (
        <form onSubmit={submit} className="cd-form">
          <Field label="Email"><Input type="email" placeholder="you@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <Btn type="submit" full>Send reset link</Btn>
        </form>
      ) : <div className="cd-verify-box"><p>A reset link (simulated) has been sent to <strong>{email}</strong>. In this prototype, head back and log in.</p></div>}
      <p className="cd-auth-switch"><button className="cd-link-btn" onClick={onGoLogin}><ArrowLeft size={13} style={{ verticalAlign: "-2px" }} /> Back to login</button></p>
    </AuthShell>
  );
}

/* =========================================================================
   LAYOUT — Sidebar handles both role-nav and in-class nav
   ========================================================================= */
const NAV = {
  admin: [{ k: "dashboard", label: "Dashboard", icon: Home }, { k: "classes", label: "Classes", icon: BookOpen }, { k: "teachers", label: "Teachers", icon: GraduationCap }, { k: "students", label: "Students", icon: Users }, { k: "reports", label: "Reports", icon: ClipboardCheck }, { k: "profile", label: "Profile", icon: UserCog }],
  teacher: [{ k: "classes", label: "My Classes", icon: BookOpen }, { k: "profile", label: "Profile", icon: UserCog }],
  student: [{ k: "classes", label: "My Classes", icon: BookOpen }, { k: "profile", label: "Profile", icon: UserCog }],
};
const CLASS_TABS = [
  { k: "notices", label: "Notices", icon: Bell }, { k: "resources", label: "Resources", icon: FileText },
  { k: "assignments", label: "Assignments", icon: ClipboardCheck }, { k: "attendance", label: "Attendance", icon: CalendarCheck },
  { k: "exams", label: "Exams", icon: Brain }, { k: "members", label: "Members", icon: Users },
];

function Sidebar({ role, screen, setScreen, activeClass, classTab, setClassTab, onBackToClasses, theme, toggleTheme, onLogout, instituteName, collapsed, setCollapsed }) {
  const mode = activeClass ? "class" : "role";
  return (
    <div className={`cd-sidebar ${collapsed ? "cd-sidebar-collapsed" : ""}`}>
      <div className="cd-sidebar-top">
        <div className="cd-sidebar-brand">
          <div className="cd-auth-badge cd-auth-badge-sm"><School size={17} /></div>
          {!collapsed && <div className="cd-sidebar-brand-text"><div className="cd-sidebar-brand-name">ClassDesk</div><div className="cd-sidebar-inst">{instituteName}</div></div>}
        </div>
        <button className="cd-icon-btn cd-sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}</button>
      </div>

      {mode === "class" ? (
        <>
          <button className="cd-nav-item cd-back-item" onClick={onBackToClasses} title={collapsed ? "All classes" : undefined}>
            <ArrowLeft size={17} /> {!collapsed && <span>All classes</span>}
          </button>
          {!collapsed && <div className="cd-sidebar-classname">{activeClass.name}</div>}
          <nav className="cd-nav">
            {CLASS_TABS.map((item) => (
              <button key={item.k} className={`cd-nav-item ${classTab === item.k ? "cd-nav-item-active" : ""}`} onClick={() => setClassTab(item.k)} title={collapsed ? item.label : undefined}>
                <item.icon size={17} /> {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>
        </>
      ) : (
        <nav className="cd-nav">
          {NAV[role].map((item) => (
            <button key={item.k} className={`cd-nav-item ${screen === item.k ? "cd-nav-item-active" : ""}`} onClick={() => setScreen(item.k)} title={collapsed ? item.label : undefined}>
              <item.icon size={17} /> {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      )}

      <div className="cd-sidebar-bottom">
        <button className="cd-nav-item" onClick={toggleTheme} title={collapsed ? "Toggle theme" : undefined}>
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />} {!collapsed && <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>}
        </button>
        <button className="cd-nav-item cd-nav-danger" onClick={onLogout} title={collapsed ? "Log out" : undefined}>
          <LogOut size={17} /> {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </div>
  );
}

function Topbar({ user, title }) {
  const roleLabel = { admin: "Admin", teacher: "Teacher", student: "Student" }[user.role];
  return (
    <div className="cd-topbar">
      <h1>{title}</h1>
      <div className="cd-topbar-user">
        <div className="cd-avatar">{user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
        <div><div className="cd-topbar-name">{user.name}</div><div className="cd-topbar-role">{roleLabel}</div></div>
      </div>
    </div>
  );
}

/* =========================================================================
   ADMIN SCREENS
   ========================================================================= */
function AdminDashboard({ db }) {
  const teachers = db.users.filter((u) => u.role === "teacher");
  const students = db.users.filter((u) => u.role === "student");
  return (
    <div>
      <div className="cd-institute-banner">
        <div><div className="cd-eyebrow">Your institute</div><h2>{db.institute.name}</h2></div>
        <div className="cd-inst-code-block"><span className="cd-field-label">Institute code</span><CodeChip code={db.institute.code} onCopy={() => navigator.clipboard?.writeText(db.institute.code)} /></div>
      </div>
      <div className="cd-stat-grid">
        <div className="cd-stat-card"><BookOpen size={18} /><div><div className="cd-stat-num">{db.classes.length}</div><div className="cd-stat-label">Classes</div></div></div>
        <div className="cd-stat-card"><GraduationCap size={18} /><div><div className="cd-stat-num">{teachers.length}</div><div className="cd-stat-label">Teachers</div></div></div>
        <div className="cd-stat-card"><Users size={18} /><div><div className="cd-stat-num">{students.length}</div><div className="cd-stat-label">Students</div></div></div>
        <div className="cd-stat-card"><Brain size={18} /><div><div className="cd-stat-num">{db.exams.length}</div><div className="cd-stat-label">Exams created</div></div></div>
      </div>
      <div className="cd-card">
        <h3 className="cd-card-title">Classes at a glance</h3>
        <table className="cd-table">
          <thead><tr><th>Class</th><th>Teacher</th><th>Students</th><th>Join code</th></tr></thead>
          <tbody>{db.classes.map((c) => { const t = db.users.find((u) => u.id === c.teacherId); return <tr key={c.id}><td>{c.name}</td><td>{t ? t.name : <em>Unassigned</em>}</td><td>{c.studentIds.length}</td><td><span className="cd-mono">{c.joinCode}</span></td></tr>; })}</tbody>
        </table>
      </div>
    </div>
  );
}

function AdminClasses({ db, setDb, showToast }) {
  const removeTeacher = (classId) => { setDb((p) => ({ ...p, classes: p.classes.map((c) => c.id === classId ? { ...c, teacherId: null } : c) })); showToast("Teacher removed from class.", "info"); };
  return (
    <div className="cd-card">
      <h3 className="cd-card-title">All classes</h3>
      <table className="cd-table">
        <thead><tr><th>Class</th><th>Subject</th><th>Teacher</th><th>Students</th><th>Join code</th><th></th></tr></thead>
        <tbody>
          {db.classes.map((c) => { const t = db.users.find((u) => u.id === c.teacherId); return (
            <tr key={c.id}><td>{c.name}</td><td>{c.subject}</td><td>{t ? t.name : <em className="cd-muted">Unassigned</em>}</td><td>{c.studentIds.length}</td><td><span className="cd-mono">{c.joinCode}</span></td>
              <td>{t && <Btn size="sm" variant="ghost-danger" icon={UserX} onClick={() => removeTeacher(c.id)}>Remove teacher</Btn>}</td></tr>
          ); })}
        </tbody>
      </table>
    </div>
  );
}

function AdminPeople({ db, setDb, role, showToast }) {
  const people = db.users.filter((u) => u.role === role);
  const toggleStatus = (id) => setDb((p) => ({ ...p, users: p.users.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u) }));
  const removeUser = (id) => {
    setDb((p) => ({ ...p, users: p.users.filter((u) => u.id !== id), classes: p.classes.map((c) => ({ ...c, teacherId: c.teacherId === id ? null : c.teacherId, studentIds: c.studentIds.filter((sid) => sid !== id) })) }));
    showToast(`${role === "teacher" ? "Teacher" : "Student"} removed from institute.`, "info");
  };
  return (
    <div className="cd-card">
      <h3 className="cd-card-title">{role === "teacher" ? "Teachers" : "Students"}</h3>
      {people.length === 0 ? <EmptyState icon={role === "teacher" ? GraduationCap : Users} title={`No ${role}s yet`} /> : (
        <table className="cd-table">
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Classes</th><th></th></tr></thead>
          <tbody>
            {people.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td><td className="cd-muted">{u.email}</td>
                <td><Stamp tone={u.status === "active" ? "green" : "red"}>{u.status}</Stamp></td>
                <td>{db.classes.filter((c) => c.teacherId === u.id || c.studentIds.includes(u.id)).length}</td>
                <td className="cd-row-actions">
                  <Btn size="sm" variant="ghost" icon={u.status === "active" ? UserX : UserCheck} onClick={() => toggleStatus(u.id)}>{u.status === "active" ? "Deactivate" : "Activate"}</Btn>
                  <Btn size="sm" variant="ghost-danger" icon={Trash2} onClick={() => removeUser(u.id)}>Remove</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function attendancePct(db, classId, studentId, monthFilter) {
  let recs = db.attendance.filter((a) => a.classId === classId && a.records[studentId]);
  if (monthFilter) recs = recs.filter((a) => monthOf(a.date) === monthFilter);
  if (recs.length === 0) return null;
  const attended = recs.filter((r) => r.records[studentId] === "P" || r.records[studentId] === "L").length;
  return Math.round((attended / recs.length) * 100);
}

function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function AdminReports({ db }) {
  const [classId, setClassId] = useState(db.classes[0]?.id || "");
  const cls = db.classes.find((c) => c.id === classId);
  const exams = db.exams.filter((e) => e.classId === classId);

  const exportCsv = () => {
    if (!cls) return;
    const keys = [...new Set(db.attendance.filter((a) => a.classId === classId).map((a) => `${a.date} (${a.subject})`))].sort();
    const rows = [["Student", ...keys, "Attendance %"]];
    cls.studentIds.forEach((sid) => {
      const student = db.users.find((u) => u.id === sid);
      const row = [student?.name || sid];
      keys.forEach((k) => { const date = k.slice(0, 10); const subj = k.slice(12, -1); const rec = db.attendance.find((a) => a.classId === classId && a.date === date && a.subject === subj); row.push(rec?.records[sid] || "-"); });
      row.push(attendancePct(db, classId, sid) ?? "-");
      rows.push(row);
    });
    downloadCSV(`attendance_${cls.name.replace(/\s+/g, "_")}.csv`, rows);
  };

  return (
    <div>
      <div className="cd-card">
        <div className="cd-flex-between"><h3 className="cd-card-title">Cross-class reports</h3>
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} style={{ maxWidth: 240 }}>{db.classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select>
        </div>
      </div>
      {cls && (
        <>
          <div className="cd-card">
            <div className="cd-flex-between"><h4 className="cd-card-subtitle">Attendance (all-time)</h4><Btn size="sm" icon={Download} variant="ghost" onClick={exportCsv}>Export CSV</Btn></div>
            <table className="cd-table">
              <thead><tr><th>Student</th><th>Attendance %</th><th></th></tr></thead>
              <tbody>{cls.studentIds.map((sid) => { const student = db.users.find((u) => u.id === sid); const pct = attendancePct(db, classId, sid); return <tr key={sid}><td>{student?.name}</td><td>{pct ?? "—"}%</td><td>{pct !== null && pct < 75 && <Stamp tone="red">Below 75%</Stamp>}</td></tr>; })}</tbody>
            </table>
          </div>
          <div className="cd-card">
            <h4 className="cd-card-subtitle">Exam results</h4>
            {exams.length === 0 ? <EmptyState icon={Brain} title="No exams for this class yet" /> : exams.map((ex) => (
              <div key={ex.id} className="cd-subcard">
                <div className="cd-flex-between"><strong>{ex.title}</strong><span className="cd-muted">{ex.attempts.length} attempt(s)</span></div>
                {ex.attempts.length > 0 && (
                  <table className="cd-table cd-table-tight">
                    <thead><tr><th>Student</th><th>Score</th><th>Flags</th></tr></thead>
                    <tbody>{[...ex.attempts].sort((a, b) => b.score - a.score).map((a) => { const student = db.users.find((u) => u.id === a.studentId); return <tr key={a.studentId}><td>{student?.name}</td><td>{a.score}/{ex.questions.length}</td><td>{a.cheatFlag && <Stamp tone="red">Flagged</Stamp>}</td></tr>; })}</tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================================
   TEACHER: CLASS LIST + CREATE
   ========================================================================= */
function ClassGrid({ classes, db, onOpen, role, extra }) {
  return (
    <div className="cd-class-grid">
      {classes.map((c) => {
        const t = db.users.find((u) => u.id === c.teacherId);
        return (
          <button key={c.id} className="cd-class-card" onClick={() => onOpen(c.id)}>
            <div className="cd-class-card-top"><div className="cd-class-icon"><BookOpen size={18} /></div><ChevronRight size={16} className="cd-muted" /></div>
            <div className="cd-class-name">{c.name}</div>
            <div className="cd-class-sub">{c.subject}</div>
            <div className="cd-class-meta">{role !== "teacher" && t && <span>{t.name}</span>}<span><Users size={13} style={{ verticalAlign: -2 }} /> {c.studentIds.length}</span></div>
          </button>
        );
      })}
      {extra}
    </div>
  );
}

function CreateClassModal({ onClose, onCreate }) {
  const [name, setName] = useState(""); const [subject, setSubject] = useState("");
  return (
    <Modal title="Create a new class" onClose={onClose}>
      <div className="cd-form">
        <Field label="Class name"><Input placeholder="e.g. Physics XI-A" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Subject"><Input placeholder="e.g. Physics" value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
        <Btn full disabled={!name || !subject} onClick={() => onCreate(name, subject)}>Create class</Btn>
      </div>
    </Modal>
  );
}

function JoinClassModal({ onClose, onJoin }) {
  const [code, setCode] = useState("");
  return (
    <Modal title="Join a class" onClose={onClose}>
      <div className="cd-form">
        <Field label="6-digit join code"><Input placeholder="482913" value={code} maxLength={6} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /></Field>
        <Btn full disabled={code.length !== 6} onClick={() => onJoin(code)}>Join class</Btn>
      </div>
    </Modal>
  );
}

/* =========================================================================
   CLASS DETAIL
   ========================================================================= */
function ClassHeader({ cls, teacherName, isTeacher }) {
  return (
    <div className="cd-class-header">
      <div><h2>{cls.name}</h2><div className="cd-muted">{cls.subject}{teacherName ? ` · ${teacherName}` : ""}</div></div>
      {isTeacher && <div className="cd-class-header-code"><span className="cd-field-label">Join code</span><CodeChip code={cls.joinCode} onCopy={() => navigator.clipboard?.writeText(cls.joinCode)} /></div>}
    </div>
  );
}

/* ---------- NOTICES ---------- */
function NoticeForm({ initial, onSave }) {
  const [title, setTitle] = useState(initial?.title || ""); const [body, setBody] = useState(initial?.body || "");
  const [scheduledFor, setScheduledFor] = useState(initial?.scheduledFor ? initial.scheduledFor.slice(0, 16) : null);
  return (
    <div className="cd-form">
      <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Class rescheduled" /></Field>
      <Field label="Message"><TextArea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your announcement..." /></Field>
      <ScheduleField scheduledFor={scheduledFor} setScheduledFor={setScheduledFor} />
      <Btn full disabled={!title || !body} onClick={() => onSave({ title, body, scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null })}>{initial ? "Save changes" : "Post to class"}</Btn>
    </div>
  );
}

function NoticesTab({ cls, db, setDb, isTeacher, showToast }) {
  const [showAdd, setShowAdd] = useState(false); const [editing, setEditing] = useState(null);
  let list = db.notices.filter((n) => n.classId === cls.id);
  if (!isTeacher) list = list.filter(isVisible);
  list = list.sort((a, b) => new Date(b.date) - new Date(a.date));

  const add = (data) => { setDb((p) => ({ ...p, notices: [{ id: uid("n"), classId: cls.id, date: new Date().toISOString(), teacherId: cls.teacherId, ...data }, ...p.notices] })); setShowAdd(false); showToast(data.scheduledFor ? "Notice scheduled." : "Notice posted.", "success"); };
  const update = (id, data) => { setDb((p) => ({ ...p, notices: p.notices.map((n) => n.id === id ? { ...n, ...data } : n) })); setEditing(null); showToast("Notice updated.", "success"); };
  const remove = (id) => { if (!window.confirm("Delete this notice?")) return; setDb((p) => ({ ...p, notices: p.notices.filter((n) => n.id !== id) })); showToast("Notice deleted.", "info"); };

  return (
    <div>
      {isTeacher && <div className="cd-flex-end"><Btn icon={Plus} onClick={() => setShowAdd(true)}>Post notice</Btn></div>}
      {list.length === 0 ? <EmptyState icon={Bell} title="No notices yet" hint={isTeacher ? "Post your first announcement above." : "Your teacher hasn't posted anything yet."} /> : (
        <div className="cd-notice-list">
          {list.map((n) => (
            <div key={n.id} className="cd-notice">
              <div className="cd-notice-bar" />
              <div className="cd-notice-body">
                <div className="cd-flex-between">
                  <strong>{n.title}</strong>
                  <div className="cd-flex-gap-sm">
                    {n.scheduledFor && isFuture(n.scheduledFor) && <Stamp tone="amber">Scheduled · {fmtDateTime(n.scheduledFor)}</Stamp>}
                    <span className="cd-muted cd-small">{fmtDateTime(n.date)}</span>
                    {isTeacher && <RowActions onEdit={() => setEditing(n.id)} onDelete={() => remove(n.id)} />}
                  </div>
                </div>
                <p>{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {showAdd && <Modal title="Post a notice" onClose={() => setShowAdd(false)}><NoticeForm onSave={add} /></Modal>}
      {editing && <Modal title="Edit notice" onClose={() => setEditing(null)}><NoticeForm initial={list.find((n) => n.id === editing)} onSave={(data) => update(editing, data)} /></Modal>}
    </div>
  );
}

/* ---------- RESOURCES ---------- */
function ResourceForm({ initial, labels, onAddLabel, onSave }) {
  const [title, setTitle] = useState(initial?.title || ""); const [description, setDescription] = useState(initial?.description || "");
  const [scheduledFor, setScheduledFor] = useState(initial?.scheduledFor ? initial.scheduledFor.slice(0, 16) : null);
  const [links, setLinks] = useState(initial?.links?.length ? initial.links.map((l) => ({ ...l })) : [{ id: uid("l"), type: labels[0], label: "", url: "" }]);
  const addLinkRow = () => setLinks((l) => [...l, { id: uid("l"), type: labels[0], label: "", url: "" }]);
  const updateLink = (id, patch) => setLinks((l) => l.map((x) => x.id === id ? { ...x, ...patch } : x));
  const removeLink = (id) => setLinks((l) => l.filter((x) => x.id !== id));
  const save = () => { const clean = links.filter((l) => l.url && l.label); if (!title || clean.length === 0) return; onSave({ title, description, links: clean, scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null }); };
  return (
    <div className="cd-form">
      <Field label="Resource title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 9 materials" /></Field>
      <Field label="Description"><TextArea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this resource for?" /></Field>
      <span className="cd-field-label">Links</span>
      {links.map((l) => (
        <div key={l.id} className="cd-link-row">
          <LabelSelect value={l.type} onChange={(v) => updateLink(l.id, { type: v })} labels={labels} onAddLabel={onAddLabel} />
          <Input placeholder="Label" value={l.label} onChange={(e) => updateLink(l.id, { label: e.target.value })} />
          <Input placeholder="https://..." value={l.url} onChange={(e) => updateLink(l.id, { url: e.target.value })} />
          <button className="cd-icon-btn" onClick={() => removeLink(l.id)}><X size={15} /></button>
        </div>
      ))}
      <Btn variant="ghost" icon={Plus} onClick={addLinkRow}>Add another link</Btn>
      <ScheduleField scheduledFor={scheduledFor} setScheduledFor={setScheduledFor} />
      <Btn full onClick={save}>{initial ? "Save changes" : "Share with class"}</Btn>
    </div>
  );
}

function ResourcesTab({ cls, db, setDb, isTeacher, showToast }) {
  const [showAdd, setShowAdd] = useState(false); const [editing, setEditing] = useState(null); const [filterLabel, setFilterLabel] = useState("All"); const [showManageLabels, setShowManageLabels] = useState(false);
  let list = db.resources.filter((r) => r.classId === cls.id);
  if (!isTeacher) list = list.filter(isVisible);
  if (filterLabel !== "All") list = list.filter((r) => r.links.some((l) => l.type === filterLabel));
  list = list.sort((a, b) => new Date(b.date) - new Date(a.date));

  const addLabel = (label) => setDb((p) => p.resourceLabels.includes(label) ? p : { ...p, resourceLabels: [...p.resourceLabels, label] });
  const add = (data) => { setDb((p) => ({ ...p, resources: [{ id: uid("r"), classId: cls.id, date: new Date().toISOString(), ...data }, ...p.resources] })); setShowAdd(false); showToast(data.scheduledFor ? "Resource scheduled." : "Resource shared.", "success"); };
  const update = (id, data) => { setDb((p) => ({ ...p, resources: p.resources.map((r) => r.id === id ? { ...r, ...data } : r) })); setEditing(null); showToast("Resource updated.", "success"); };
  const remove = (id) => { if (!window.confirm("Delete this resource?")) return; setDb((p) => ({ ...p, resources: p.resources.filter((r) => r.id !== id) })); showToast("Resource deleted.", "info"); };

  return (
    <div>
      <div className="cd-flex-between" style={{ marginBottom: 14 }}>
        <div className="cd-filter-inline"><Filter size={14} /><Select value={filterLabel} onChange={(e) => setFilterLabel(e.target.value)} style={{ maxWidth: 170 }}>
          <option value="All">All labels</option>{db.resourceLabels.map((l) => <option key={l} value={l}>{l}</option>)}
        </Select></div>
        {isTeacher && <div className="cd-flex-gap-sm"><Btn variant="ghost" size="sm" icon={Tag} onClick={() => setShowManageLabels(true)}>Manage labels</Btn><Btn icon={Plus} onClick={() => setShowAdd(true)}>Add resource</Btn></div>}
      </div>
      {list.length === 0 ? <EmptyState icon={FileText} title="No resources found" /> : (
        <div className="cd-res-list">
          {list.map((r) => (
            <div key={r.id} className="cd-card cd-subcard">
              <div className="cd-flex-between">
                <strong>{r.title}</strong>
                <div className="cd-flex-gap-sm">
                  {r.scheduledFor && isFuture(r.scheduledFor) && <Stamp tone="amber">Scheduled</Stamp>}
                  <span className="cd-muted cd-small">{fmtDate(r.date)}</span>
                  {isTeacher && <RowActions onEdit={() => setEditing(r.id)} onDelete={() => remove(r.id)} />}
                </div>
              </div>
              {r.description && <p className="cd-muted cd-small">{r.description}</p>}
              <div className="cd-link-chips">{r.links.map((l) => { const Icon = LINK_ICON[l.type] || Tag; return <a key={l.id} className="cd-link-chip" href={l.url} target="_blank" rel="noreferrer"><Icon size={14} />{l.label}</a>; })}</div>
            </div>
          ))}
        </div>
      )}
      {showAdd && <Modal title="Add resource" onClose={() => setShowAdd(false)} wide><ResourceForm labels={db.resourceLabels} onAddLabel={addLabel} onSave={add} /></Modal>}
      {editing && <Modal title="Edit resource" onClose={() => setEditing(null)} wide><ResourceForm initial={list.find((r) => r.id === editing)} labels={db.resourceLabels} onAddLabel={addLabel} onSave={(data) => update(editing, data)} /></Modal>}
      {showManageLabels && <ManageLabelsModal db={db} setDb={setDb} onClose={() => setShowManageLabels(false)} showToast={showToast} />}
    </div>
  );
}

/* ---------- ASSIGNMENTS ---------- */
function AssignmentForm({ initial, labels, onAddLabel, onSave }) {
  const [title, setTitle] = useState(initial?.title || ""); const [description, setDescription] = useState(initial?.description || "");
  const [deadline, setDeadline] = useState(initial?.deadline ? initial.deadline.slice(0, 16) : "");
  const [maxMarks, setMaxMarks] = useState(initial?.maxMarks ?? "");
  const [scheduledFor, setScheduledFor] = useState(initial?.scheduledFor ? initial.scheduledFor.slice(0, 16) : null);
  const [resources, setResources] = useState(initial?.resources?.length ? initial.resources.map((r) => ({ ...r })) : []);
  const addRes = () => setResources((r) => [...r, { id: uid("l"), type: labels[0], label: "", url: "" }]);
  const updateRes = (id, patch) => setResources((r) => r.map((x) => x.id === id ? { ...x, ...patch } : x));
  const removeRes = (id) => setResources((r) => r.filter((x) => x.id !== id));
  const save = () => onSave({ title, description, deadline: new Date(deadline).toISOString(), maxMarks: maxMarks === "" ? null : Number(maxMarks), scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null, resources: resources.filter((r) => r.label && r.url) });
  return (
    <div className="cd-form">
      <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label="Description"><TextArea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
      <div className="cd-grid-2">
        <Field label="Deadline"><Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Field>
        <Field label="Max marks (optional)"><Input type="number" min={0} placeholder="e.g. 20" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} /></Field>
      </div>
      <span className="cd-field-label">Attached resources (optional)</span>
      {resources.map((r) => (
        <div key={r.id} className="cd-link-row">
          <LabelSelect value={r.type} onChange={(v) => updateRes(r.id, { type: v })} labels={labels} onAddLabel={onAddLabel} />
          <Input placeholder="Label" value={r.label} onChange={(e) => updateRes(r.id, { label: e.target.value })} />
          <Input placeholder="https://..." value={r.url} onChange={(e) => updateRes(r.id, { url: e.target.value })} />
          <button className="cd-icon-btn" onClick={() => removeRes(r.id)}><X size={15} /></button>
        </div>
      ))}
      <Btn variant="ghost" icon={Plus} onClick={addRes}>Attach a resource link</Btn>
      <ScheduleField scheduledFor={scheduledFor} setScheduledFor={setScheduledFor} />
      <Btn full disabled={!title || !deadline} onClick={save}>{initial ? "Save changes" : "Create assignment"}</Btn>
    </div>
  );
}

function AssignmentsTabTeacher({ cls, db, setDb, showToast }) {
  const [showCreate, setShowCreate] = useState(false); const [editingId, setEditingId] = useState(null); const [openId, setOpenId] = useState(null);
  const list = db.assignments.filter((a) => a.classId === cls.id).sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
  const open = list.find((a) => a.id === openId);
  const addLabel = (label) => setDb((p) => p.resourceLabels.includes(label) ? p : { ...p, resourceLabels: [...p.resourceLabels, label] });

  const create = (data) => { setDb((p) => ({ ...p, assignments: [{ id: uid("a"), classId: cls.id, submissions: [], ...data }, ...p.assignments] })); setShowCreate(false); showToast(data.scheduledFor ? "Assignment scheduled." : "Assignment created.", "success"); };
  const update = (id, data) => { setDb((p) => ({ ...p, assignments: p.assignments.map((a) => a.id === id ? { ...a, ...data } : a) })); setEditingId(null); showToast("Assignment updated.", "success"); };
  const remove = (id) => { if (!window.confirm("Delete this assignment?")) return; setDb((p) => ({ ...p, assignments: p.assignments.filter((a) => a.id !== id) })); showToast("Assignment deleted.", "info"); };
  const review = (studentId, patch) => setDb((p) => ({ ...p, assignments: p.assignments.map((a) => a.id !== openId ? a : { ...a, submissions: a.submissions.map((s) => s.studentId === studentId ? { ...s, ...patch } : s) }) }));

  return (
    <div>
      <div className="cd-flex-end"><Btn icon={Plus} onClick={() => setShowCreate(true)}>New assignment</Btn></div>
      {list.length === 0 ? <EmptyState icon={ClipboardCheck} title="No assignments yet" /> : (
        <div className="cd-list">
          {list.map((a) => (
            <div key={a.id} className="cd-list-row">
              <button className="cd-list-row-main" onClick={() => setOpenId(a.id)}>
                <div><strong>{a.title}</strong><div className="cd-muted cd-small">Due {fmtDateTime(a.deadline)} {a.maxMarks != null && `· ${a.maxMarks} marks`} {a.scheduledFor && isFuture(a.scheduledFor) && <Stamp tone="amber">Scheduled</Stamp>}</div></div>
                <div className="cd-flex-gap-sm"><Stamp tone="neutral">{a.submissions.length}/{cls.studentIds.length} submitted</Stamp><ChevronRight size={16} /></div>
              </button>
              <RowActions onEdit={() => setEditingId(a.id)} onDelete={() => remove(a.id)} />
            </div>
          ))}
        </div>
      )}
      {showCreate && <Modal title="Create assignment" onClose={() => setShowCreate(false)} wide><AssignmentForm labels={db.resourceLabels} onAddLabel={addLabel} onSave={create} /></Modal>}
      {editingId && <Modal title="Edit assignment" onClose={() => setEditingId(null)} wide><AssignmentForm initial={list.find((a) => a.id === editingId)} labels={db.resourceLabels} onAddLabel={addLabel} onSave={(data) => update(editingId, data)} /></Modal>}
      {open && (
        <Modal title={open.title} onClose={() => setOpenId(null)} wide>
          <p className="cd-muted">{open.description}</p>
          <p className="cd-small cd-muted">Due {fmtDateTime(open.deadline)}{open.maxMarks != null && ` · Out of ${open.maxMarks} marks`}</p>
          {open.resources?.length > 0 && <div className="cd-link-chips" style={{ marginTop: 6 }}>{open.resources.map((r) => { const Icon = LINK_ICON[r.type] || Tag; return <a key={r.id} className="cd-link-chip" href={r.url} target="_blank" rel="noreferrer"><Icon size={14} />{r.label}</a>; })}</div>}
          <div className="cd-list" style={{ marginTop: 12 }}>
            {cls.studentIds.map((sid) => {
              const student = db.users.find((u) => u.id === sid); const sub = open.submissions.find((s) => s.studentId === sid); const overdue = !sub && isPast(open.deadline);
              return (
                <div key={sid} className="cd-submission-row">
                  <div className="cd-submission-info"><strong>{student?.name}</strong>{sub ? <a href={sub.link} target="_blank" rel="noreferrer" className="cd-link-inline"><LinkIcon size={13} />View submission</a> : <span className="cd-muted cd-small">No submission</span>}</div>
                  <div className="cd-flex-gap-sm">
                    {overdue ? <Stamp tone="red">Overdue</Stamp> : sub ? <Stamp tone={sub.status === "Reviewed" ? "green" : sub.status === "Needs Revision" ? "amber" : "neutral"}>{sub.status}</Stamp> : <Stamp tone="neutral">Pending</Stamp>}
                    {sub && <Select value={sub.status} onChange={(e) => review(sid, { status: e.target.value })} style={{ maxWidth: 150 }}>{["Pending", "Reviewed", "Needs Revision"].map((s) => <option key={s}>{s}</option>)}</Select>}
                    {sub && open.maxMarks != null && <Input type="number" min={0} max={open.maxMarks} placeholder={`/ ${open.maxMarks}`} defaultValue={sub.marks ?? ""} onBlur={(e) => review(sid, { marks: e.target.value === "" ? null : Number(e.target.value) })} style={{ maxWidth: 80 }} />}
                  </div>
                  {sub && <Input placeholder="Feedback..." defaultValue={sub.feedback} onBlur={(e) => review(sid, { feedback: e.target.value })} className="cd-feedback-input" />}
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

function AssignmentsTabStudent({ cls, db, setDb, userId, showToast }) {
  const list = db.assignments.filter((a) => a.classId === cls.id).filter(isVisible).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const [submitFor, setSubmitFor] = useState(null); const [link, setLink] = useState("");
  const submit = () => { if (!link) return; setDb((p) => ({ ...p, assignments: p.assignments.map((a) => a.id !== submitFor ? a : { ...a, submissions: [...a.submissions.filter((s) => s.studentId !== userId), { studentId: userId, link, status: "Pending", feedback: "", marks: null, submittedAt: new Date().toISOString() }] }) })); setSubmitFor(null); setLink(""); showToast("Assignment submitted.", "success"); };
  return (
    <div className="cd-list">
      {list.length === 0 && <EmptyState icon={ClipboardCheck} title="No assignments yet" />}
      {list.map((a) => {
        const sub = a.submissions.find((s) => s.studentId === userId); const overdue = !sub && isPast(a.deadline);
        return (
          <div key={a.id} className="cd-card cd-subcard">
            <div className="cd-flex-between"><strong>{a.title}</strong>{sub ? <Stamp tone={sub.status === "Reviewed" ? "green" : sub.status === "Needs Revision" ? "amber" : "neutral"}>{sub.status}</Stamp> : overdue ? <Stamp tone="red">Overdue</Stamp> : <Stamp tone="neutral">Not submitted</Stamp>}</div>
            <p className="cd-muted cd-small">{a.description}</p>
            <p className="cd-muted cd-small">Due {fmtDateTime(a.deadline)}{a.maxMarks != null && ` · Out of ${a.maxMarks} marks`}</p>
            {a.resources?.length > 0 && <div className="cd-link-chips">{a.resources.map((r) => { const Icon = LINK_ICON[r.type] || Tag; return <a key={r.id} className="cd-link-chip" href={r.url} target="_blank" rel="noreferrer"><Icon size={14} />{r.label}</a>; })}</div>}
            {sub && sub.marks != null && <div className="cd-feedback-box"><strong>Marks:</strong> {sub.marks}{a.maxMarks != null && ` / ${a.maxMarks}`}</div>}
            {sub && sub.feedback && <div className="cd-feedback-box"><strong>Feedback:</strong> {sub.feedback}</div>}
            {sub ? <a className="cd-link-inline" href={sub.link} target="_blank" rel="noreferrer"><LinkIcon size={13} />Your submission</a> : <Btn size="sm" variant="ghost" onClick={() => setSubmitFor(a.id)}>Submit link</Btn>}
          </div>
        );
      })}
      {submitFor && <Modal title="Submit assignment" onClose={() => setSubmitFor(null)}><div className="cd-form"><Field label="Link (Google Docs, GitHub, Drive, website)"><Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." /></Field><Btn full disabled={!link} onClick={submit}>Submit</Btn></div></Modal>}
    </div>
  );
}

/* ---------- ATTENDANCE ---------- */
function getSubjects(db, classId, clsSubject) { return db.classSubjects[classId] || [clsSubject]; }

function AttendanceTabTeacher({ cls, db, setDb, showToast }) {
  const [date, setDate] = useState(todayStr());
  const subjects = getSubjects(db, cls.id, cls.subject);
  const [subject, setSubject] = useState(subjects[0]);
  const [addingSubject, setAddingSubject] = useState(false); const [newSubject, setNewSubject] = useState("");
  const [month, setMonth] = useState(monthOf(todayStr()));
  const [time, setTime] = useState(nowTimeStr());

  const existing = db.attendance.find((a) => a.classId === cls.id && a.date === date && a.subject === subject);
  const [records, setRecords] = useState(existing?.records || {});
  useEffect(() => { const rec = db.attendance.find((a) => a.classId === cls.id && a.date === date && a.subject === subject); setRecords(rec?.records || {}); setTime(rec?.time || nowTimeStr()); }, [date, subject, cls.id]);

  const setMark = (sid, mark) => setRecords((r) => ({ ...r, [sid]: mark }));
  const save = () => {
    setDb((p) => { const has = p.attendance.some((a) => a.classId === cls.id && a.date === date && a.subject === subject); return { ...p, attendance: has ? p.attendance.map((a) => a.classId === cls.id && a.date === date && a.subject === subject ? { ...a, records, time } : a) : [...p.attendance, { id: uid("att"), classId: cls.id, date, subject, time, records }] }; });
    showToast(`Attendance saved for ${subject}.`, "success");
  };
  const addSubject = () => { if (!newSubject.trim()) return; setDb((p) => ({ ...p, classSubjects: { ...p.classSubjects, [cls.id]: [...(p.classSubjects[cls.id] || [cls.subject]), newSubject.trim()] } })); setSubject(newSubject.trim()); setNewSubject(""); setAddingSubject(false); };

  const todaysEntries = db.attendance.filter((a) => a.classId === cls.id && a.date === todayStr());
  const monthlyRows = cls.studentIds.map((sid) => ({ sid, pct: attendancePct(db, cls.id, sid, month) }));
  const exportMonthCsv = () => {
    const keys = [...new Set(db.attendance.filter((a) => a.classId === cls.id && monthOf(a.date) === month).map((a) => `${a.date} (${a.subject})`))].sort();
    const rows = [["Student", ...keys, "Attendance %"]];
    cls.studentIds.forEach((sid) => {
      const student = db.users.find((u) => u.id === sid); const row = [student?.name || sid];
      keys.forEach((k) => { const date = k.slice(0, 10); const subj = k.slice(12, -1); const rec = db.attendance.find((a) => a.classId === cls.id && a.date === date && a.subject === subj); row.push(rec?.records[sid] || "-"); });
      row.push(attendancePct(db, cls.id, sid, month) ?? "-"); rows.push(row);
    });
    downloadCSV(`attendance_${cls.name.replace(/\s+/g, "_")}_${month}.csv`, rows);
  };

  return (
    <div>
      <div className="cd-card">
        <div className="cd-flex-between">
          <h4 className="cd-card-subtitle">Mark attendance</h4>
          <div className="cd-flex-gap-sm">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 150 }} />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ maxWidth: 110 }} title="Lecture time" />
            {addingSubject ? (
              <div className="cd-label-add-row">
                <Input autoFocus placeholder="Subject / period" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubject()} style={{ maxWidth: 140 }} />
                <button className="cd-icon-btn" onClick={addSubject}><Check size={15} /></button>
                <button className="cd-icon-btn" onClick={() => setAddingSubject(false)}><X size={15} /></button>
              </div>
            ) : (
              <Select value={subject} onChange={(e) => e.target.value === "__add__" ? setAddingSubject(true) : setSubject(e.target.value)} style={{ maxWidth: 145 }}>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}<option value="__add__">+ Add subject…</option>
              </Select>
            )}
          </div>
        </div>
        <div className="cd-list" style={{ marginTop: 10 }}>
          {cls.studentIds.map((sid) => { const student = db.users.find((u) => u.id === sid); const mark = records[sid]; return (
            <div key={sid} className="cd-attendance-row">
              <span>{student?.name}</span>
              <div className="cd-attendance-toggles">{[["P", "Present", "green"], ["L", "Late", "amber"], ["A", "Absent", "red"]].map(([code, label, tone]) => (
                <button key={code} className={`cd-toggle-btn cd-toggle-${tone} ${mark === code ? "cd-toggle-active" : ""}`} onClick={() => setMark(sid, code)}>{label}</button>
              ))}</div>
            </div>
          ); })}
        </div>
        <Btn onClick={save} icon={Check}>Save {subject} attendance for {fmtDateShort(date)} at {time}</Btn>
      </div>

      <div className="cd-card">
        <h4 className="cd-card-subtitle">Today's attendance</h4>
        {todaysEntries.length === 0 ? <EmptyState icon={CalendarCheck} title="Nothing marked for today yet" /> : (
          <div className="cd-today-grid">
            {todaysEntries.map((e) => {
              const counts = { P: 0, L: 0, A: 0 }; Object.values(e.records).forEach((v) => counts[v]++);
              return (
                <button key={e.id} className="cd-today-card" onClick={() => { setDate(e.date); setSubject(e.subject); }}>
                  <div className="cd-today-subject">{e.subject}{e.time && <span className="cd-muted cd-small"> · {e.time}</span>}</div>
                  <div className="cd-today-counts"><Stamp tone="green">{counts.P} present</Stamp><Stamp tone="amber">{counts.L} late</Stamp><Stamp tone="red">{counts.A} absent</Stamp></div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="cd-card">
        <div className="cd-flex-between">
          <h4 className="cd-card-subtitle">Monthly attendance</h4>
          <div className="cd-flex-gap-sm"><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ maxWidth: 150 }} /><Btn size="sm" variant="ghost" icon={Download} onClick={exportMonthCsv}>Export CSV</Btn></div>
        </div>
        <p className="cd-muted cd-small">{monthLabel(month)}</p>
        <table className="cd-table">
          <thead><tr><th>Student</th><th>Attendance %</th><th></th></tr></thead>
          <tbody>{monthlyRows.map(({ sid, pct }) => { const student = db.users.find((u) => u.id === sid); return <tr key={sid}><td>{student?.name}</td><td>{pct ?? "—"}%</td><td>{pct !== null && pct < 75 && <Stamp tone="red">Below 75%</Stamp>}</td></tr>; })}</tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceTabStudent({ cls, db, userId }) {
  const pct = attendancePct(db, cls.id, userId);
  const history = db.attendance.filter((a) => a.classId === cls.id && a.records[userId]).sort((a, b) => b.date.localeCompare(a.date));
  const months = [...new Set(history.map((h) => monthOf(h.date)))];
  return (
    <div>
      <div className="cd-card cd-attendance-summary">
        <div className="cd-attendance-ring" style={{ "--pct": pct ?? 0 }}><span>{pct ?? "—"}%</span></div>
        <div><h4 className="cd-card-subtitle">Overall attendance</h4><p className="cd-muted cd-small">{history.length} classes recorded</p>
          {pct !== null && pct < 75 && <div className="cd-warning-banner"><AlertTriangle size={15} />Your attendance is below 75%.</div>}
        </div>
      </div>
      <div className="cd-card">
        <h4 className="cd-card-subtitle">Monthly breakdown</h4>
        <table className="cd-table cd-table-tight">
          <thead><tr><th>Month</th><th>Attendance %</th></tr></thead>
          <tbody>{months.map((m) => { const mp = attendancePct(db, cls.id, userId, m); return <tr key={m}><td>{monthLabel(m)}</td><td>{mp}%{mp < 75 && <Stamp tone="red" style={{ marginLeft: 8 }}>Low</Stamp>}</td></tr>; })}</tbody>
        </table>
      </div>
      <div className="cd-card">
        <h4 className="cd-card-subtitle">History</h4>
        <div className="cd-history-list">{history.map((h) => (
          <div key={h.id} className="cd-history-row"><span>{fmtDate(h.date)} <span className="cd-muted cd-small">· {h.subject}{h.time ? ` · ${h.time}` : ""}</span></span>
            <Stamp tone={h.records[userId] === "P" ? "green" : h.records[userId] === "L" ? "amber" : "red"}>{h.records[userId] === "P" ? "Present" : h.records[userId] === "L" ? "Late" : "Absent"}</Stamp>
          </div>
        ))}</div>
      </div>
    </div>
  );
}

/* ---------- EXAMS ---------- */
function ExamForm({ initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title || ""); const [duration, setDuration] = useState(initial?.duration || 10);
  const [startTime, setStartTime] = useState(initial?.startTime ? initial.startTime.slice(0, 16) : ""); const [endTime, setEndTime] = useState(initial?.endTime ? initial.endTime.slice(0, 16) : "");
  const [questions, setQuestions] = useState(initial?.questions?.length ? initial.questions.map((q) => ({ ...q, options: [...q.options] })) : [{ id: uid("q"), q: "", options: ["", "", "", ""], correct: 0 }]);
  const updateQ = (id, patch) => setQuestions((qs) => qs.map((q) => q.id === id ? { ...q, ...patch } : q));
  const updateOpt = (id, i, val) => setQuestions((qs) => qs.map((q) => q.id === id ? { ...q, options: q.options.map((o, idx) => idx === i ? val : o) } : q));
  const addQ = () => setQuestions((qs) => [...qs, { id: uid("q"), q: "", options: ["", "", "", ""], correct: 0 }]);
  const removeQ = (id) => setQuestions((qs) => qs.filter((q) => q.id !== id));
  const valid = title && startTime && endTime && questions.length > 0 && questions.every((q) => q.q && q.options.every((o) => o));
  return (
    <Modal title={initial ? "Edit exam" : "Create MCQ exam"} onClose={onClose} wide>
      <div className="cd-form">
        {initial?.attempts?.length > 0 && <div className="cd-warning-banner" style={{ background: "var(--accent-tint)", color: "#9A5B10" }}><AlertTriangle size={15} />This exam already has {initial.attempts.length} attempt(s). Changing questions won't retroactively rescoring past attempts.</div>}
        <Field label="Exam title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <div className="cd-grid-3">
          <Field label="Duration (min)"><Input type="number" min={1} value={duration} onChange={(e) => setDuration(+e.target.value)} /></Field>
          <Field label="Start time (schedules exam)"><Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></Field>
          <Field label="End time"><Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></Field>
        </div>
        <span className="cd-field-label">Questions</span>
        {questions.map((q, qi) => (
          <div key={q.id} className="cd-card cd-subcard">
            <div className="cd-flex-between"><strong>Question {qi + 1}</strong>{questions.length > 1 && <button className="cd-icon-btn" onClick={() => removeQ(q.id)}><X size={15} /></button>}</div>
            <Input placeholder="Question text" value={q.q} onChange={(e) => updateQ(q.id, { q: e.target.value })} style={{ marginBottom: 8 }} />
            {q.options.map((o, i) => (<div key={i} className="cd-option-row"><input type="radio" checked={q.correct === i} onChange={() => updateQ(q.id, { correct: i })} /><Input placeholder={`Option ${i + 1}`} value={o} onChange={(e) => updateOpt(q.id, i, e.target.value)} /></div>))}
          </div>
        ))}
        <Btn variant="ghost" icon={Plus} onClick={addQ}>Add question</Btn>
        <Btn full disabled={!valid} onClick={() => onSave({ title, duration, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString(), questions })}>{initial ? "Save changes" : "Create exam"}</Btn>
      </div>
    </Modal>
  );
}

function examStatus(ex) { const now = Date.now(); if (now < new Date(ex.startTime).getTime()) return "upcoming"; if (now > new Date(ex.endTime).getTime()) return "closed"; return "active"; }

function QuestionPaperView({ exam, onClose }) {
  return (
    <Modal title={`Question paper — ${exam.title}`} onClose={onClose} wide>
      <div className="cd-list">
        {exam.questions.map((q, i) => (
          <div key={q.id} className="cd-card cd-subcard">
            <strong>{i + 1}. {q.q}</strong>
            <div className="cd-form" style={{ marginTop: 6 }}>{q.options.map((o, oi) => <div key={oi} className={`cd-review-option ${oi === q.correct ? "cd-review-correct" : ""}`}>{o}{oi === q.correct && <CheckCircle2 size={14} style={{ marginLeft: 6, verticalAlign: -2 }} />}</div>)}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function ViolationLogModal({ studentName, attempt, onClose }) {
  return (
    <Modal title={`Activity log — ${studentName}`} onClose={onClose}>
      <div className="cd-flex-gap-sm" style={{ marginBottom: 10 }}>
        <Stamp tone={attempt.cheatFlag ? "red" : "green"}>{attempt.cheatFlag ? "Flagged" : "Clean"}</Stamp>
        <span className="cd-muted cd-small">{attempt.warnings} warning(s) recorded</span>
      </div>
      {attempt.violations?.length ? (
        <div className="cd-list">
          {attempt.violations.map((v, i) => (
            <div key={i} className="cd-violation-row"><Activity size={14} /><div><div>{v.reason}</div><div className="cd-muted cd-small">{fmtClock(v.time)}</div></div></div>
          ))}
        </div>
      ) : <EmptyState icon={ShieldAlert} title="No suspicious activity detected" />}
    </Modal>
  );
}

function ExamsTabTeacher({ cls, db, setDb, showToast }) {
  const [showCreate, setShowCreate] = useState(false); const [editingId, setEditingId] = useState(null); const [openId, setOpenId] = useState(null);
  const [paperFor, setPaperFor] = useState(null); const [sheetFor, setSheetFor] = useState(null); const [logFor, setLogFor] = useState(null);
  const list = db.exams.filter((e) => e.classId === cls.id).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  const open = list.find((e) => e.id === openId);

  const create = (data) => { setDb((p) => ({ ...p, exams: [{ id: uid("e"), classId: cls.id, attempts: [], resultsReleased: false, ...data }, ...p.exams] })); setShowCreate(false); showToast("Exam scheduled.", "success"); };
  const update = (id, data) => { setDb((p) => ({ ...p, exams: p.exams.map((e) => e.id === id ? { ...e, ...data } : e) })); setEditingId(null); showToast("Exam updated.", "success"); };
  const toggleRelease = (examId) => setDb((p) => ({ ...p, exams: p.exams.map((e) => e.id === examId ? { ...e, resultsReleased: !e.resultsReleased } : e) }));

  return (
    <div>
      <div className="cd-flex-end"><Btn icon={Plus} onClick={() => setShowCreate(true)}>New exam</Btn></div>
      {list.length === 0 ? <EmptyState icon={Brain} title="No exams yet" /> : (
        <div className="cd-list">
          {list.map((ex) => { const st = examStatus(ex); return (
            <div key={ex.id} className="cd-list-row">
              <button className="cd-list-row-main" onClick={() => setOpenId(ex.id)}>
                <div><strong>{ex.title}</strong><div className="cd-muted cd-small">{ex.questions.length} questions · {ex.duration} min · {fmtDateTime(ex.startTime)}</div></div>
                <div className="cd-flex-gap-sm"><Stamp tone={st === "active" ? "green" : st === "upcoming" ? "amber" : "neutral"}>{st}</Stamp><ChevronRight size={16} /></div>
              </button>
              <RowActions onEdit={() => setEditingId(ex.id)} />
            </div>
          ); })}
        </div>
      )}
      {showCreate && <ExamForm onClose={() => setShowCreate(false)} onSave={create} />}
      {editingId && <ExamForm initial={list.find((e) => e.id === editingId)} onClose={() => setEditingId(null)} onSave={(data) => update(editingId, data)} />}
      {open && (
        <Modal title={`Leaderboard — ${open.title}`} onClose={() => setOpenId(null)} wide>
          <div className="cd-flex-between" style={{ marginBottom: 12 }}>
            <div className="cd-flex-gap-sm">{examStatus(open) === "closed" && <Btn size="sm" variant="ghost" icon={ListChecks} onClick={() => setPaperFor(open.id)}>View question paper</Btn>}</div>
            <Btn size="sm" variant={open.resultsReleased ? "ghost" : "primary"} icon={open.resultsReleased ? EyeOff : Eye} onClick={() => toggleRelease(open.id)}>{open.resultsReleased ? "Hide results from students" : "Release results to students"}</Btn>
          </div>
          {open.attempts.length === 0 ? <EmptyState icon={Trophy} title="No attempts yet" /> : (
            <table className="cd-table">
              <thead><tr><th>#</th><th>Student</th><th>Score</th><th>Time taken</th><th>Flag</th><th></th></tr></thead>
              <tbody>
                {[...open.attempts].sort((a, b) => b.score - a.score || a.timeTakenSec - b.timeTakenSec).map((a, i) => {
                  const student = db.users.find((u) => u.id === a.studentId);
                  return (
                    <tr key={a.studentId}>
                      <td>{i + 1}</td><td>{student?.name}</td><td>{a.score}/{open.questions.length}</td>
                      <td>{Math.floor(a.timeTakenSec / 60)}m {a.timeTakenSec % 60}s</td>
                      <td>{a.cheatFlag ? <button className="cd-stamp-btn" onClick={() => setLogFor(a.studentId)}><Stamp tone="red"><ShieldAlert size={12} style={{ verticalAlign: -2 }} /> Flagged ({a.warnings})</Stamp></button> : <Stamp tone="green">Clean</Stamp>}</td>
                      <td className="cd-flex-gap-sm">
                        {a.violations?.length > 0 && <Btn size="sm" variant="ghost" icon={Activity} onClick={() => setLogFor(a.studentId)}>Activity</Btn>}
                        {examStatus(open) === "closed" && <Btn size="sm" variant="ghost" onClick={() => setSheetFor(a.studentId)}>Answer sheet</Btn>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Modal>
      )}
      {paperFor && <QuestionPaperView exam={list.find((e) => e.id === paperFor)} onClose={() => setPaperFor(null)} />}
      {sheetFor && open && <ExamResultView exam={open} attempt={open.attempts.find((a) => a.studentId === sheetFor)} onClose={() => setSheetFor(null)} revealed studentName={db.users.find((u) => u.id === sheetFor)?.name} />}
      {logFor && open && <ViolationLogModal studentName={db.users.find((u) => u.id === logFor)?.name} attempt={open.attempts.find((a) => a.studentId === logFor)} onClose={() => setLogFor(null)} />}
    </div>
  );
}

function TakeExamModal({ exam, onClose, onSubmit }) {
  const [qIndex, setQIndex] = useState(0); const [answers, setAnswers] = useState(Array(exam.questions.length).fill(null));
  const [warnings, setWarnings] = useState(0); const [secondsLeft, setSecondsLeft] = useState(exam.duration * 60); const [flash, setFlash] = useState(null);
  const submittedRef = useRef(false); const startedAt = useRef(Date.now()); const violationsRef = useRef([]);

  const finish = (cheatFlag, warnCount) => {
    if (submittedRef.current) return; submittedRef.current = true;
    if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); }
    const score = answers.reduce((acc, a, i) => acc + (a === exam.questions[i].correct ? 1 : 0), 0);
    onSubmit({ answers, score, warnings: warnCount, cheatFlag, violations: violationsRef.current, timeTakenSec: Math.round((Date.now() - startedAt.current) / 1000) });
  };

  useEffect(() => { const t = setInterval(() => { setSecondsLeft((s) => { if (s <= 1) { clearInterval(t); finish(false, warnings); return 0; } return s - 1; }); }, 1000); return () => clearInterval(t); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const flag = (reason) => {
      if (submittedRef.current) return;
      violationsRef.current = [...violationsRef.current, { reason, time: new Date().toISOString() }];
      setWarnings((w) => { const next = w + 1; setFlash(`Warning ${next}/3 — ${reason}`); setTimeout(() => setFlash(null), 2500); if (next >= 3) finish(true, next); return next; });
    };
    const onVis = () => { if (document.hidden) flag("switched to another browser tab or app"); };
    const onBlur = () => flag("exam window lost focus (possible alt-tab or second monitor)");
    const onFsChange = () => { if (!document.fullscreenElement) flag("exited full-screen mode"); };
    document.addEventListener("visibilitychange", onVis); window.addEventListener("blur", onBlur); document.addEventListener("fullscreenchange", onFsChange);
    return () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("blur", onBlur); document.removeEventListener("fullscreenchange", onFsChange); }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allAnswered = answers.every((a) => a !== null);
  const q = exam.questions[qIndex]; const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0"); const ss = String(secondsLeft % 60).padStart(2, "0");
  return (
    <div className="cd-modal-backdrop cd-exam-backdrop">
      <div className="cd-modal cd-modal-wide cd-exam-modal">
        <div className="cd-modal-head"><h3>{exam.title}</h3><div className="cd-flex-gap-sm"><span className="cd-lockdown-badge"><Maximize size={12} />Locked exam mode</span><div className="cd-exam-timer"><Clock size={15} />{mm}:{ss}</div></div></div>
        {flash && <div className="cd-warning-banner cd-warning-flash"><AlertTriangle size={15} />{flash}</div>}
        <div className="cd-modal-body">
          <div className="cd-exam-progress">Question {qIndex + 1} of {exam.questions.length}</div>
          <h4 style={{ marginTop: 4 }}>{q.q}</h4>
          <div className="cd-form" style={{ marginTop: 10 }}>{q.options.map((o, i) => (
            <label key={i} className={`cd-exam-option ${answers[qIndex] === i ? "cd-exam-option-active" : ""}`}><input type="radio" checked={answers[qIndex] === i} onChange={() => setAnswers((a) => a.map((x, idx) => idx === qIndex ? i : x))} />{o}</label>
          ))}</div>
          <div className="cd-exam-qnav">{exam.questions.map((_, i) => <button key={i} className={`cd-qdot ${i === qIndex ? "cd-qdot-active" : ""} ${answers[i] !== null ? "cd-qdot-done" : ""}`} onClick={() => setQIndex(i)}>{i + 1}</button>)}</div>
          <div className="cd-flex-between" style={{ marginTop: 16 }}>
            <Btn variant="ghost" disabled={qIndex === 0} onClick={() => setQIndex((i) => i - 1)}>Previous</Btn>
            {qIndex < exam.questions.length - 1 ? <Btn onClick={() => setQIndex((i) => i + 1)}>Next</Btn> : (
              <div style={{ textAlign: "right" }}>
                {!allAnswered && <div className="cd-muted cd-small" style={{ marginBottom: 6 }}>Answer all questions to submit</div>}
                <Btn onClick={() => finish(false, warnings)} icon={Check} disabled={!allAnswered}>Submit exam</Btn>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamResultView({ exam, attempt, onClose, revealed, studentName }) {
  if (!revealed) {
    return (
      <Modal title={`Result — ${exam.title}`} onClose={onClose}>
        <div className="cd-locked-result"><Lock size={26} /><p><strong>Results not released yet.</strong></p><p className="cd-muted cd-small">Your submission was recorded on {fmtDateTime(attempt.submittedAt)}. Your teacher will release your score and answer sheet soon.</p></div>
      </Modal>
    );
  }
  return (
    <Modal title={`${studentName ? studentName + "'s answer sheet — " : "Result — "}${exam.title}`} onClose={onClose} wide>
      <div className="cd-result-score">{attempt.score}/{exam.questions.length}</div>
      {attempt.cheatFlag && (
        <div className="cd-warning-banner" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
          <div className="cd-flex-gap-sm"><ShieldAlert size={15} /><strong>Flagged for suspected cheating</strong></div>
          {attempt.violations?.length > 0 && <ul className="cd-violation-list">{attempt.violations.map((v, i) => <li key={i}>{v.reason} — {fmtClock(v.time)}</li>)}</ul>}
        </div>
      )}
      <div className="cd-list" style={{ marginTop: 12 }}>
        {exam.questions.map((q, i) => { const correct = attempt.answers[i] === q.correct; return (
          <div key={q.id} className="cd-card cd-subcard">
            <div className="cd-flex-between"><strong>{i + 1}. {q.q}</strong>{correct ? <CheckCircle2 size={18} color="var(--brand)" /> : <XCircle size={18} color="var(--danger)" />}</div>
            <div className="cd-form" style={{ marginTop: 6 }}>{q.options.map((o, oi) => (
              <div key={oi} className={`cd-review-option ${oi === q.correct ? "cd-review-correct" : ""} ${oi === attempt.answers[i] && oi !== q.correct ? "cd-review-wrong" : ""}`}>{o}</div>
            ))}</div>
          </div>
        ); })}
      </div>
    </Modal>
  );
}

function ExamsTabStudent({ cls, db, setDb, userId, showToast }) {
  const list = db.exams.filter((e) => e.classId === cls.id).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const [taking, setTaking] = useState(null); const [viewing, setViewing] = useState(null);
  const submitAttempt = (examId, data) => {
    setDb((p) => ({ ...p, exams: p.exams.map((e) => e.id !== examId ? e : { ...e, attempts: [...e.attempts.filter((a) => a.studentId !== userId), { studentId: userId, submittedAt: new Date().toISOString(), ...data }] }) }));
    setTaking(null); showToast(data.cheatFlag ? "Exam auto-submitted after repeated warnings." : "Exam submitted.", data.cheatFlag ? "danger" : "success");
  };
  const startExam = async (examId) => { try { await document.documentElement.requestFullscreen(); } catch (e) { /* fullscreen unavailable in this environment — proceed anyway */ } setTaking(examId); };
  return (
    <div className="cd-list">
      {list.length === 0 && <EmptyState icon={Brain} title="No exams yet" />}
      {list.map((ex) => { const attempt = ex.attempts.find((a) => a.studentId === userId); const st = examStatus(ex); return (
        <div key={ex.id} className="cd-card cd-subcard">
          <div className="cd-flex-between">
            <div><strong>{ex.title}</strong><div className="cd-muted cd-small">{ex.questions.length} questions · {ex.duration} min · {fmtDateTime(ex.startTime)} – {fmtDateTime(ex.endTime)}</div></div>
            {attempt ? <Stamp tone="neutral">Completed</Stamp> : <Stamp tone={st === "active" ? "green" : st === "upcoming" ? "amber" : "red"}>{st}</Stamp>}
          </div>
          <div className="cd-flex-end" style={{ marginTop: 8 }}>
            {attempt ? <Btn size="sm" variant="ghost" onClick={() => setViewing(ex.id)}>{ex.resultsReleased ? `View result — ${attempt.score}/${ex.questions.length}` : "View submission status"}</Btn>
              : st === "active" ? <Btn size="sm" onClick={() => startExam(ex.id)}>Start exam</Btn>
              : st === "upcoming" ? <Btn size="sm" variant="ghost" disabled>Opens {fmtDateTime(ex.startTime)}</Btn>
              : <Btn size="sm" variant="ghost" disabled>Closed — no attempt made</Btn>}
          </div>
        </div>
      ); })}
      {taking && <TakeExamModal exam={list.find((e) => e.id === taking)} onClose={() => setTaking(null)} onSubmit={(data) => submitAttempt(taking, data)} />}
      {viewing && <ExamResultView exam={list.find((e) => e.id === viewing)} attempt={list.find((e) => e.id === viewing).attempts.find((a) => a.studentId === userId)} onClose={() => setViewing(null)} revealed={list.find((e) => e.id === viewing).resultsReleased} />}
    </div>
  );
}

/* ---------- MEMBERS ---------- */
function MembersTab({ cls, db, setDb, isTeacher, showToast }) {
  const remove = (sid) => { setDb((p) => ({ ...p, classes: p.classes.map((c) => c.id === cls.id ? { ...c, studentIds: c.studentIds.filter((x) => x !== sid) } : c) })); showToast("Student removed from class.", "info"); };
  return (
    <div className="cd-card">
      <h4 className="cd-card-subtitle">Enrolled students ({cls.studentIds.length})</h4>
      {cls.studentIds.length === 0 ? <EmptyState icon={Users} title="No students yet" hint="Share the join code so students can enroll." /> : (
        <table className="cd-table"><thead><tr><th>Name</th><th>Email</th>{isTeacher && <th></th>}</tr></thead>
          <tbody>{cls.studentIds.map((sid) => { const student = db.users.find((u) => u.id === sid); return <tr key={sid}><td>{student?.name}</td><td className="cd-muted">{student?.email}</td>{isTeacher && <td><Btn size="sm" variant="ghost-danger" icon={Trash2} onClick={() => remove(sid)}>Remove</Btn></td>}</tr>; })}</tbody>
        </table>
      )}
    </div>
  );
}

/* ---------- CLASS DETAIL WRAPPER ---------- */
function ClassDetail({ cls, db, setDb, role, userId, tab, showToast }) {
  const teacher = db.users.find((u) => u.id === cls.teacherId);
  return (
    <div>
      <ClassHeader cls={cls} teacherName={role !== "teacher" ? teacher?.name : null} isTeacher={role === "teacher"} />
      <div className="cd-tab-panel">
        {tab === "notices" && <NoticesTab cls={cls} db={db} setDb={setDb} isTeacher={role === "teacher"} showToast={showToast} />}
        {tab === "resources" && <ResourcesTab cls={cls} db={db} setDb={setDb} isTeacher={role === "teacher"} showToast={showToast} />}
        {tab === "assignments" && (role === "teacher" ? <AssignmentsTabTeacher cls={cls} db={db} setDb={setDb} showToast={showToast} /> : <AssignmentsTabStudent cls={cls} db={db} setDb={setDb} userId={userId} showToast={showToast} />)}
        {tab === "attendance" && (role === "teacher" ? <AttendanceTabTeacher cls={cls} db={db} setDb={setDb} showToast={showToast} /> : <AttendanceTabStudent cls={cls} db={db} userId={userId} />)}
        {tab === "exams" && (role === "teacher" ? <ExamsTabTeacher cls={cls} db={db} setDb={setDb} showToast={showToast} /> : <ExamsTabStudent cls={cls} db={db} setDb={setDb} userId={userId} showToast={showToast} />)}
        {tab === "members" && <MembersTab cls={cls} db={db} setDb={setDb} isTeacher={role === "teacher"} showToast={showToast} />}
      </div>
    </div>
  );
}

/* =========================================================================
   PROFILE
   ========================================================================= */
function ProfileScreen({ user, db, setDb, onDeleteAccount, showToast, onJoinInstitute }) {
  const [name, setName] = useState(user.name); const [showJoin, setShowJoin] = useState(false); const [code, setCode] = useState("");
  const myClasses = db.classes.filter((c) => c.teacherId === user.id || c.studentIds.includes(user.id));
  const save = () => { setDb((p) => ({ ...p, users: p.users.map((u) => u.id === user.id ? { ...u, name } : u) })); showToast("Profile updated.", "success"); };
  return (
    <div>
      <div className="cd-card cd-profile-card">
        <div className="cd-avatar cd-avatar-lg">{user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
        <div className="cd-form" style={{ flex: 1 }}>
          <Field label="Display name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <div className="cd-profile-meta"><div><span className="cd-field-label">Role</span><div>{user.role}</div></div><div><span className="cd-field-label">Email</span><div>{user.email}</div></div><div><span className="cd-field-label">Classes</span><div>{myClasses.length}</div></div></div>
          <Btn onClick={save}>Save changes</Btn>
        </div>
      </div>
      {user.role === "teacher" && (
        <div className="cd-card"><div className="cd-flex-between"><h4 className="cd-card-subtitle">Institute</h4><Btn size="sm" variant="ghost" onClick={() => setShowJoin(true)}>Join another institute</Btn></div><p className="cd-muted">Currently part of <strong>{db.institute.name}</strong>.</p></div>
      )}
      <div className="cd-card"><h4 className="cd-card-subtitle cd-danger-text">Danger zone</h4><p className="cd-muted cd-small">Deleting your account removes you from all classes and cannot be undone.</p><Btn variant="ghost-danger" icon={Trash2} onClick={onDeleteAccount}>Delete account</Btn></div>
      {showJoin && <Modal title="Join another institute" onClose={() => setShowJoin(false)}><div className="cd-form"><Field label="Institute code"><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC-123" /></Field><Btn full onClick={() => { onJoinInstitute(code); setShowJoin(false); }}>Join institute</Btn></div></Modal>}
    </div>
  );
}

/* =========================================================================
   ROOT APP
   ========================================================================= */
export default function App() {
  const [theme, setTheme] = useState("light");
  const [db, setDb] = useState(createSeed);
  const [authView, setAuthView] = useState("login");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [activeClassId, setActiveClassId] = useState(null);
  const [classTab, setClassTab] = useState("notices");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState(null);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showJoinClass, setShowJoinClass] = useState(false);

  const showToast = (msg, type = "info") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const currentUser = db.users.find((u) => u.id === currentUserId) || null;
  const pendingUser = db.users.find((u) => u.id === pendingUserId) || null;

  const login = (id) => { setCurrentUserId(id); const u = db.users.find((x) => x.id === id); setScreen(u.role === "admin" ? "dashboard" : "classes"); setActiveClassId(null); };
  const logout = () => { setCurrentUserId(null); setAuthView("login"); setActiveClassId(null); };
  const openClass = (id) => { setActiveClassId(id); setClassTab("notices"); };
  const backToClasses = () => { setActiveClassId(null); setScreen("classes"); };

  const signup = ({ role, name, email, password }) => {
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) { showToast("An account with this email already exists.", "danger"); return; }
    const newUser = { id: uid("u"), name, email, role, password, status: "active", verified: false };
    setDb((p) => ({ ...p, users: [...p.users, newUser] })); setPendingUserId(newUser.id); setAuthView("verify");
  };
  const verify = () => { setDb((p) => ({ ...p, users: p.users.map((u) => u.id === pendingUserId ? { ...u, verified: true } : u) })); showToast("Email verified! You're all set.", "success"); login(pendingUserId); };
  const joinInstituteByCode = (code) => { if (code.trim().toUpperCase() === db.institute.code) showToast(`Joined ${db.institute.name}!`, "success"); else showToast("Invalid institute code.", "danger"); };

  const createClass = (name, subject) => {
    const c = { id: uid("c"), name, subject, teacherId: currentUser.id, joinCode: genCode(6), studentIds: [] };
    setDb((p) => ({ ...p, classes: [...p.classes, c], classSubjects: { ...p.classSubjects, [c.id]: [subject] } }));
    setShowCreateClass(false); showToast("Class created — share the join code with your students.", "success");
  };
  const joinClass = (code) => {
    const cls = db.classes.find((c) => c.joinCode === code);
    if (!cls) { showToast("No class found with that code.", "danger"); return; }
    if (cls.studentIds.includes(currentUser.id)) { showToast("You're already in this class.", "info"); setShowJoinClass(false); return; }
    setDb((p) => ({ ...p, classes: p.classes.map((c) => c.id === cls.id ? { ...c, studentIds: [...c.studentIds, currentUser.id] } : c) }));
    setShowJoinClass(false); showToast(`Joined ${cls.name}!`, "success");
  };
  const deleteAccount = () => {
    setDb((p) => ({ ...p, users: p.users.filter((u) => u.id !== currentUser.id), classes: p.classes.map((c) => ({ ...c, teacherId: c.teacherId === currentUser.id ? null : c.teacherId, studentIds: c.studentIds.filter((sid) => sid !== currentUser.id) })) }));
    logout();
  };

  useEffect(() => { document.documentElement.setAttribute("data-cd-theme", theme); }, [theme]);

  if (!currentUser) {
    return (
      <div className="cd-root" data-cd-theme={theme}>
        <ClassDeskStyles />
        {authView === "login" && <LoginScreen db={db} onLogin={login} onGoSignup={() => setAuthView("signup")} onGoForgot={() => setAuthView("forgot")} showToast={showToast} />}
        {authView === "signup" && <SignupScreen onSignup={signup} onGoLogin={() => setAuthView("login")} />}
        {authView === "verify" && <VerifyScreen pendingUser={pendingUser} onVerify={verify} onResend={() => {}} showToast={showToast} />}
        {authView === "forgot" && <ForgotScreen db={db} onGoLogin={() => setAuthView("login")} showToast={showToast} />}
        <Toast toast={toast} />
      </div>
    );
  }

  const myClasses = db.classes.filter((c) => currentUser.role === "teacher" ? c.teacherId === currentUser.id : c.studentIds.includes(currentUser.id));
  const activeClass = db.classes.find((c) => c.id === activeClassId);
  const titleMap = { dashboard: "Dashboard", classes: "My Classes", teachers: "Teachers", students: "Students", reports: "Reports", profile: "Profile" };
  const classTabLabel = CLASS_TABS.find((t) => t.k === classTab)?.label;

  return (
    <div className="cd-root" data-cd-theme={theme}>
      <ClassDeskStyles />
      <div className="cd-app-shell">
        <Sidebar role={currentUser.role} screen={screen} setScreen={(s) => { setScreen(s); setActiveClassId(null); }}
          activeClass={activeClass} classTab={classTab} setClassTab={setClassTab} onBackToClasses={backToClasses}
          theme={theme} toggleTheme={() => setTheme((t) => t === "light" ? "dark" : "light")} onLogout={logout} instituteName={db.institute.name} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="cd-main">
          <Topbar user={currentUser} title={activeClass ? `${activeClass.name} · ${classTabLabel}` : titleMap[screen] || (currentUser.role === "admin" ? "Classes" : "My Classes")} />
          <div className="cd-content">
            {currentUser.role === "admin" && !activeClass && (
              <>
                {screen === "dashboard" && <AdminDashboard db={db} />}
                {screen === "classes" && <AdminClasses db={db} setDb={setDb} showToast={showToast} />}
                {screen === "teachers" && <AdminPeople db={db} setDb={setDb} role="teacher" showToast={showToast} />}
                {screen === "students" && <AdminPeople db={db} setDb={setDb} role="student" showToast={showToast} />}
                {screen === "reports" && <AdminReports db={db} />}
                {screen === "profile" && <ProfileScreen user={currentUser} db={db} setDb={setDb} onDeleteAccount={deleteAccount} showToast={showToast} onJoinInstitute={joinInstituteByCode} />}
              </>
            )}
            {(currentUser.role === "teacher" || currentUser.role === "student") && screen === "classes" && !activeClass && (
              <ClassGrid classes={myClasses} db={db} role={currentUser.role} onOpen={openClass}
                extra={<button className="cd-class-card cd-class-card-add" onClick={() => currentUser.role === "teacher" ? setShowCreateClass(true) : setShowJoinClass(true)}><Plus size={22} /><span>{currentUser.role === "teacher" ? "Create a class" : "Join a class"}</span></button>}
              />
            )}
            {activeClass && <ClassDetail cls={activeClass} db={db} setDb={setDb} role={currentUser.role} userId={currentUser.id} tab={classTab} showToast={showToast} />}
            {screen === "profile" && currentUser.role !== "admin" && !activeClass && <ProfileScreen user={currentUser} db={db} setDb={setDb} onDeleteAccount={deleteAccount} showToast={showToast} onJoinInstitute={joinInstituteByCode} />}
          </div>
        </div>
      </div>
      {showCreateClass && <CreateClassModal onClose={() => setShowCreateClass(false)} onCreate={createClass} />}
      {showJoinClass && <JoinClassModal onClose={() => setShowJoinClass(false)} onJoin={joinClass} />}
      <Toast toast={toast} />
    </div>
  );
}

/* =========================================================================
   STYLES — "Ink & Amber" indigo theme
   ========================================================================= */
function ClassDeskStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

      .cd-root, .cd-root * { box-sizing: border-box; }
      .cd-root {
        --bg:#F6F5FB; --surface:#FFFFFF; --surface-2:#ECEAF7; --ink:#241F3D; --ink-soft:#6B6690;
        --border:#DAD5EF; --brand:#5B4FE0; --brand-dark:#4438C2; --brand-tint:#EDEAFC;
        --accent:#FF8A3D; --accent-tint:#FFEEDD; --danger:#E14F63; --danger-tint:#FBE3E7; --info:#2E9BC7;
        font-family: 'Inter', sans-serif; color: var(--ink); background: var(--bg);
        min-height: 100vh; width: 100%; position: relative;
      }
      .cd-root[data-cd-theme="dark"] {
        --bg:#141229; --surface:#1D1B38; --surface-2:#262445; --ink:#EDEBFB; --ink-soft:#A29DC9;
        --border:#362F5C; --brand:#8B7FFF; --brand-dark:#6F62E8; --brand-tint:#2A2557;
        --accent:#FFA65C; --accent-tint:#3A2A1C; --danger:#F27085; --danger-tint:#3A222A; --info:#5FBEE0;
      }
      h1,h2,h3,h4 { font-family: 'Space Grotesk', sans-serif; margin: 0; letter-spacing: -0.01em; }
      p { margin: 6px 0 0; line-height: 1.5; }
      .cd-mono { font-family: 'JetBrains Mono', monospace; }
      .cd-muted { color: var(--ink-soft); }
      .cd-small { font-size: 12.5px; }
      .cd-danger-text { color: var(--danger); }

      .cd-auth-shell { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 16px; gap: 22px; }
      .cd-auth-brand { display: flex; align-items: center; gap: 12px; max-width: 380px; text-align: left; }
      .cd-auth-badge { width: 44px; height: 44px; border-radius: 13px; background: var(--brand); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .cd-auth-badge-sm { width: 32px; height: 32px; border-radius: 9px; }
      .cd-auth-brand-name { font-family: 'Space Grotesk'; font-weight: 700; font-size: 19px; }
      .cd-auth-brand-tag { font-size: 12.5px; color: var(--ink-soft); margin-top: 1px; }
      .cd-auth-card { background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 30px; width: 100%; max-width: 380px; box-shadow: 0 1px 2px rgba(36,31,61,0.05); }
      .cd-auth-title { font-size: 21px; }
      .cd-auth-sub { color: var(--ink-soft); font-size: 13.5px; margin-bottom: 18px; }
      .cd-auth-foot { font-size: 11.5px; color: var(--ink-soft); opacity: 0.7; }
      .cd-auth-divider { text-align: center; margin: 18px 0 12px; position: relative; color: var(--ink-soft); font-size: 12px; }
      .cd-auth-divider::before, .cd-auth-divider::after { content:""; position:absolute; top:50%; width:38%; height:1px; background: var(--border); }
      .cd-auth-divider::before { left: 0; } .cd-auth-divider::after { right: 0; }
      .cd-auth-switch { text-align: center; font-size: 13px; margin-top: 16px; color: var(--ink-soft); }
      .cd-link-btn { background: none; border: none; color: var(--info); font-size: 13px; font-weight: 600; cursor: pointer; padding: 0; text-align: left; }
      .cd-role-picker { display: flex; gap: 8px; margin-bottom: 16px; }
      .cd-role-opt { flex: 1; padding: 10px 4px; border-radius: 10px; border: 1px solid var(--border); background: var(--surface-2); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: var(--ink-soft); }
      .cd-role-opt-active { border-color: var(--brand); background: var(--brand-tint); color: var(--brand-dark); font-weight: 600; }
      .cd-verify-icon { width: 48px; height: 48px; border-radius: 50%; background: var(--brand-tint); color: var(--brand-dark); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
      .cd-verify-box { background: var(--surface-2); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: var(--ink-soft); margin: 12px 0; }

      .cd-form { display: flex; flex-direction: column; gap: 12px; }
      .cd-field { display: flex; flex-direction: column; gap: 5px; }
      .cd-field-label { font-size: 11.5px; font-weight: 600; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.04em; }
      .cd-input { font-family: 'Inter'; font-size: 14px; padding: 9px 11px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); color: var(--ink); width: 100%; outline: none; }
      .cd-input:focus { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-tint); }
      .cd-textarea { resize: vertical; min-height: 70px; font-family: 'Inter'; }
      .cd-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

      .cd-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: 'Inter'; font-weight: 600; border-radius: 9px; border: 1px solid transparent; cursor: pointer; white-space: nowrap; }
      .cd-btn-md { padding: 9px 16px; font-size: 13.5px; } .cd-btn-sm { padding: 6px 11px; font-size: 12.5px; }
      .cd-btn-full { width: 100%; }
      .cd-btn-primary { background: var(--brand); color: #fff; } .cd-btn-primary:hover { background: var(--brand-dark); }
      .cd-btn-ghost { background: var(--surface-2); color: var(--ink); border-color: var(--border); } .cd-btn-ghost:hover { border-color: var(--brand); }
      .cd-btn-ghost-danger { background: var(--danger-tint); color: var(--danger); } .cd-btn-ghost-danger:hover { opacity: 0.85; }
      .cd-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .cd-icon-btn { background: none; border: none; color: var(--ink-soft); cursor: pointer; padding: 6px; border-radius: 8px; display: flex; }
      .cd-icon-btn:hover { background: var(--surface-2); color: var(--ink); }
      .cd-icon-btn-danger:hover { background: var(--danger-tint); color: var(--danger); }
      .cd-row-icon-actions { display: flex; gap: 2px; }
      .cd-stamp-btn { background: none; border: none; padding: 0; cursor: pointer; }

      .cd-app-shell { display: flex; min-height: 100vh; }
      .cd-sidebar { width: 220px; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 14px 10px; flex-shrink: 0; transition: width .15s; }
      .cd-sidebar-collapsed { width: 68px; align-items: center; }
      .cd-sidebar-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; width: 100%; gap: 6px; }
      .cd-sidebar-collapsed .cd-sidebar-top { flex-direction: column; gap: 10px; }
      .cd-sidebar-brand { display: flex; align-items: center; gap: 9px; overflow: hidden; min-width: 0; }
      .cd-sidebar-brand-text { overflow: hidden; }
      .cd-sidebar-brand-name { font-family: 'Space Grotesk'; font-weight: 700; font-size: 14px; white-space: nowrap; }
      .cd-sidebar-inst { font-size: 10.5px; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }
      .cd-sidebar-toggle { flex-shrink: 0; }
      .cd-back-item { color: var(--brand); font-weight: 700; margin-bottom: 4px; }
      .cd-sidebar-classname { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-soft); font-weight: 700; padding: 4px 10px 8px; }
      .cd-nav { display: flex; flex-direction: column; gap: 3px; flex: 1; width: 100%; }
      .cd-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 9px; border: none; background: none; color: var(--ink-soft); font-size: 13.5px; font-weight: 500; cursor: pointer; text-align: left; white-space: nowrap; overflow: hidden; width: 100%; }
      .cd-nav-item:hover { background: var(--surface-2); color: var(--ink); }
      .cd-nav-item-active { background: var(--brand-tint); color: var(--brand-dark); font-weight: 700; }
      .cd-nav-danger:hover { background: var(--danger-tint); color: var(--danger); }
      .cd-sidebar-bottom { display: flex; flex-direction: column; gap: 3px; border-top: 1px solid var(--border); padding-top: 10px; width: 100%; }
      .cd-sidebar-collapsed .cd-nav-item { justify-content: center; width: 44px; height: 40px; padding: 0; margin: 0 auto; border-radius: 10px; }
      .cd-sidebar-collapsed .cd-sidebar-classname { display: none; }
      .cd-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
      .cd-topbar { display: flex; align-items: center; justify-content: space-between; padding: 18px 28px; border-bottom: 1px solid var(--border); background: var(--surface); }
      .cd-topbar-user { display: flex; align-items: center; gap: 10px; }
      .cd-topbar-name { font-size: 13.5px; font-weight: 600; } .cd-topbar-role { font-size: 11.5px; color: var(--ink-soft); text-transform: capitalize; }
      .cd-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--accent-tint); color: var(--brand-dark); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; font-family: 'Space Grotesk'; }
      .cd-avatar-lg { width: 56px; height: 56px; font-size: 18px; }
      .cd-content { padding: 24px 28px 60px; max-width: 1080px; width: 100%; }

      .cd-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; margin-bottom: 18px; }
      .cd-subcard { background: var(--surface-2); border-color: var(--border); margin-bottom: 10px; }
      .cd-card-title { font-size: 15.5px; margin-bottom: 12px; }
      .cd-card-subtitle { font-size: 14px; margin-bottom: 10px; }
      .cd-flex-between { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .cd-flex-end { display: flex; justify-content: flex-end; margin-bottom: 14px; }
      .cd-flex-gap-sm { display: flex; align-items: center; gap: 8px; }
      .cd-filter-inline { display: flex; align-items: center; gap: 6px; color: var(--ink-soft); }
      .cd-institute-banner { display: flex; justify-content: space-between; align-items: center; background: var(--brand); color: #fff; border-radius: 14px; padding: 20px 22px; margin-bottom: 18px; }
      .cd-institute-banner h2 { color: #fff; }
      .cd-eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.85; margin-bottom: 2px; }
      .cd-inst-code-block { text-align: right; display: flex; flex-direction: column; gap: 4px; }
      .cd-inst-code-block .cd-field-label { color: rgba(255,255,255,0.8); }
      .cd-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
      .cd-stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px; display: flex; align-items: center; gap: 12px; color: var(--brand); }
      .cd-stat-num { font-family: 'Space Grotesk'; font-size: 20px; font-weight: 700; color: var(--ink); }
      .cd-stat-label { font-size: 11.5px; color: var(--ink-soft); }

      .cd-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
      .cd-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--ink-soft); padding: 8px 10px; border-bottom: 1px solid var(--border); }
      .cd-table td { padding: 9px 10px; border-bottom: 1px solid var(--border); }
      .cd-table-tight td, .cd-table-tight th { padding: 6px 8px; font-size: 12.5px; }
      .cd-row-actions { display: flex; gap: 6px; }

      .cd-code-chip { display: inline-flex; align-items: center; gap: 6px; background: var(--surface-2); border: 1px dashed var(--border); border-radius: 8px; padding: 5px 10px; font-family: 'JetBrains Mono'; font-weight: 600; font-size: 13px; cursor: pointer; color: var(--ink); }
      .cd-inst-code-block .cd-code-chip { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.4); color: #fff; }

      .cd-stamp { display: inline-flex; align-items: center; gap: 4px; font-family: 'JetBrains Mono'; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; padding: 3px 9px; border-radius: 6px; border: 1.5px solid currentColor; }
      .cd-stamp-neutral { color: var(--ink-soft); background: var(--surface-2); }
      .cd-stamp-green { color: #1E7A52; background: #E1F5EA; }
      .cd-root[data-cd-theme="dark"] .cd-stamp-green { color: #6FE0A8; background: #17352A; }
      .cd-stamp-amber { color: #9A5B10; background: var(--accent-tint); }
      .cd-root[data-cd-theme="dark"] .cd-stamp-amber { color: var(--accent); }
      .cd-stamp-red { color: var(--danger); background: var(--danger-tint); }

      .cd-class-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
      .cd-class-card { text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; }
      .cd-class-card:hover { border-color: var(--brand); }
      .cd-class-card-top { display: flex; justify-content: space-between; }
      .cd-class-icon { width: 34px; height: 34px; border-radius: 9px; background: var(--brand-tint); color: var(--brand-dark); display: flex; align-items: center; justify-content: center; }
      .cd-class-name { font-family: 'Space Grotesk'; font-weight: 700; font-size: 15px; margin-top: 6px; }
      .cd-class-sub { font-size: 12.5px; color: var(--ink-soft); }
      .cd-class-meta { display: flex; gap: 12px; font-size: 12px; color: var(--ink-soft); margin-top: 6px; }
      .cd-class-card-add { align-items: center; justify-content: center; color: var(--ink-soft); border-style: dashed; gap: 8px; }
      .cd-class-card-add:hover { color: var(--brand); }

      .cd-class-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }
      .cd-class-header-code { margin-left: auto; text-align: right; display: flex; flex-direction: column; gap: 4px; }

      .cd-notice-list { display: flex; flex-direction: column; gap: 10px; }
      .cd-notice { display: flex; gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; }
      .cd-notice-bar { width: 3px; border-radius: 3px; background: var(--accent); flex-shrink: 0; }
      .cd-notice-body { flex: 1; min-width: 0; }
      .cd-link-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
      .cd-link-chip { display: inline-flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 6px 10px; font-size: 12.5px; color: var(--info); text-decoration: none; }
      .cd-link-chip:hover { border-color: var(--info); }
      .cd-link-row { display: grid; grid-template-columns: 130px 1fr 1.3fr auto; gap: 8px; align-items: center; margin-bottom: 6px; }
      .cd-link-inline { display: inline-flex; align-items: center; gap: 5px; color: var(--info); font-size: 12.5px; text-decoration: none; margin-top: 6px; }
      .cd-label-add-row { display: flex; align-items: center; gap: 4px; }
      .cd-label-manage-list { display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow-y: auto; }
      .cd-label-manage-row { display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 8px; background: var(--surface-2); font-size: 13px; }
      .cd-label-manage-row span { flex: 1; }

      .cd-list { display: flex; flex-direction: column; gap: 8px; }
      .cd-list-row { display: flex; justify-content: space-between; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 6px 8px 6px 16px; gap: 8px; }
      .cd-list-row:hover { border-color: var(--brand); }
      .cd-list-row-main { display: flex; justify-content: space-between; align-items: center; flex: 1; background: none; border: none; padding: 7px 0; cursor: pointer; text-align: left; gap: 10px; min-width: 0; }
      .cd-submission-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; }
      .cd-submission-info { display: flex; flex-direction: column; gap: 2px; }
      .cd-feedback-input { flex-basis: 100%; margin-top: 6px; }
      .cd-feedback-box { background: var(--accent-tint); border-radius: 8px; padding: 8px 10px; font-size: 12.5px; margin-top: 8px; }

      .cd-attendance-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid var(--border); font-size: 13.5px; }
      .cd-attendance-row:last-child { border-bottom: none; }
      .cd-attendance-toggles { display: flex; gap: 6px; }
      .cd-toggle-btn { border: 1px solid var(--border); background: var(--surface); border-radius: 7px; padding: 5px 11px; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--ink-soft); }
      .cd-toggle-green.cd-toggle-active { background: #E1F5EA; border-color: #1E7A52; color: #1E7A52; }
      .cd-toggle-amber.cd-toggle-active { background: var(--accent-tint); border-color: var(--accent); color: #9A5B10; }
      .cd-toggle-red.cd-toggle-active { background: var(--danger-tint); border-color: var(--danger); color: var(--danger); }
      .cd-attendance-summary { display: flex; align-items: center; gap: 20px; }
      .cd-attendance-ring { --pct: 0; width: 74px; height: 74px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk'; font-weight: 700; font-size: 15px; background: conic-gradient(var(--brand) calc(var(--pct)*1%), var(--surface-2) 0); }
      .cd-attendance-ring span { background: var(--surface); width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      .cd-warning-banner { display: flex; align-items: center; gap: 8px; background: var(--danger-tint); color: var(--danger); padding: 9px 12px; border-radius: 9px; font-size: 12.5px; font-weight: 600; margin-top: 8px; }
      .cd-violation-list { margin: 4px 0 0 18px; font-weight: 500; font-size: 12.5px; }
      .cd-violation-row { display: flex; align-items: flex-start; gap: 10px; padding: 9px 10px; border: 1px solid var(--border); border-radius: 9px; font-size: 13px; margin-bottom: 6px; background: var(--surface-2); }
      .cd-history-list { display: flex; flex-direction: column; gap: 6px; }
      .cd-history-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 2px; border-bottom: 1px solid var(--border); font-size: 13px; }
      .cd-today-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
      .cd-today-card { text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px; cursor: pointer; }
      .cd-today-card:hover { border-color: var(--brand); }
      .cd-today-subject { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
      .cd-today-counts { display: flex; flex-wrap: wrap; gap: 5px; }
      .cd-checkbox-row { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--ink-soft); cursor: pointer; }
      .cd-schedule-field { display: flex; flex-direction: column; gap: 8px; background: var(--surface-2); border-radius: 10px; padding: 10px 12px; }

      .cd-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .cd-option-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .cd-exam-modal { max-width: 640px; }
      .cd-exam-backdrop { background: rgba(10,8,24,0.85); }
      .cd-lockdown-badge { display: inline-flex; align-items: center; gap: 5px; background: var(--brand-tint); color: var(--brand-dark); font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 7px; text-transform: uppercase; letter-spacing: 0.03em; }
      .cd-exam-timer { display: flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono'; font-weight: 700; background: var(--surface-2); padding: 5px 12px; border-radius: 8px; }
      .cd-exam-progress { font-size: 12px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
      .cd-exam-option { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); border-radius: 10px; padding: 11px 13px; cursor: pointer; font-size: 14px; }
      .cd-exam-option-active { border-color: var(--brand); background: var(--brand-tint); }
      .cd-exam-qnav { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
      .cd-qdot { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface); color: var(--ink-soft); font-size: 12px; font-weight: 700; cursor: pointer; }
      .cd-qdot-done { background: var(--brand-tint); color: var(--brand-dark); border-color: var(--brand-tint); }
      .cd-qdot-active { border-color: var(--brand); }
      .cd-warning-flash { animation: cdFlash 0.4s ease; }
      @keyframes cdFlash { 0% { transform: translateY(-4px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      .cd-result-score { font-family: 'Space Grotesk'; font-size: 34px; font-weight: 700; color: var(--brand); }
      .cd-review-option { padding: 8px 11px; border-radius: 8px; border: 1px solid var(--border); font-size: 13px; margin-bottom: 5px; }
      .cd-review-correct { border-color: var(--brand); background: var(--brand-tint); }
      .cd-review-wrong { border-color: var(--danger); background: var(--danger-tint); }
      .cd-locked-result { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 20px 10px; color: var(--ink-soft); }
      .cd-locked-result svg { color: var(--brand); }

      .cd-profile-card { display: flex; gap: 20px; align-items: flex-start; }
      .cd-profile-meta { display: flex; gap: 24px; margin: 4px 0; font-size: 13.5px; text-transform: capitalize; }

      .cd-modal-backdrop { position: fixed; inset: 0; background: rgba(20,17,40,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
      .cd-modal { background: var(--surface); border-radius: 16px; width: 100%; max-width: 460px; max-height: 88vh; overflow-y: auto; border: 1px solid var(--border); }
      .cd-modal-wide { max-width: 640px; }
      .cd-modal-head { display: flex; justify-content: space-between; align-items: center; padding: 18px 20px 14px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--surface); z-index: 2; }
      .cd-modal-body { padding: 18px 20px 22px; }

      .cd-toast { position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%); background: var(--ink); color: var(--bg); padding: 11px 20px; border-radius: 10px; font-size: 13.5px; font-weight: 500; z-index: 200; box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
      .cd-toast-success { background: var(--brand-dark); } .cd-toast-danger { background: var(--danger); } .cd-toast-info { background: var(--ink); }

      .cd-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 34px 20px; color: var(--ink-soft); gap: 6px; }
      .cd-empty-title { font-weight: 600; color: var(--ink); }
      .cd-empty-hint { font-size: 12.5px; }

      @media (max-width: 860px) {
        .cd-sidebar { position: fixed; z-index: 50; height: 100vh; }
        .cd-stat-grid { grid-template-columns: repeat(2, 1fr); }
        .cd-grid-3, .cd-grid-2 { grid-template-columns: 1fr; }
        .cd-content { padding: 18px 14px 60px; }
        .cd-topbar { padding: 14px 16px; }
        .cd-link-row { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
