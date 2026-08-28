-- ============================================================================
-- CLASSDESK - UNIFIED PRODUCTION MIGRATION SCRIPT (PHASE 10)
-- PostgreSQL + Supabase Database Schema, Indexes, Triggers, RLS & Storage
-- ============================================================================
-- Instructions:
-- 1. Create a new Supabase Project at https://supabase.com
-- 2. Open SQL Editor in Supabase Dashboard
-- 3. Paste and run this entire migration script
-- 4. Copy Project URL and Anon Public Key to your .env / Expo Environment
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. TABLES DDL
-- ----------------------------------------------------------------------------

-- 1. Institutes Table
CREATE TABLE IF NOT EXISTS public.institutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  institute_id UUID REFERENCES public.institutes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  join_code VARCHAR(10) UNIQUE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  institute_id UUID REFERENCES public.institutes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Class Members (Enrollments) Table
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE (class_id, student_id)
);

-- 5. Class Subjects (Additional subject tags per class)
CREATE TABLE IF NOT EXISTS public.class_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  UNIQUE (class_id, subject_name)
);

-- 6. Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. Resource Labels Table
CREATE TABLE IF NOT EXISTS public.resource_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE (class_id, name)
);

-- 8. Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 9. Resource Links Table
CREATE TABLE IF NOT EXISTS public.resource_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL
);

-- 10. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  max_marks NUMERIC(5,2),
  scheduled_for TIMESTAMPTZ,
  resources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 11. Assignment Submissions Table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  link TEXT,
  file_url TEXT,
  storage_path TEXT,
  marks NUMERIC(5,2),
  feedback TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Needs Revision')),
  submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE (assignment_id, student_id)
);

-- 12. Attendance Sessions Table
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject TEXT NOT NULL,
  time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 13. Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status VARCHAR(2) NOT NULL CHECK (status IN ('P', 'A', 'L')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE (session_id, student_id)
);

-- 14. Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  results_released BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 15. Exam Questions Table
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option_index INTEGER NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL
);

-- 16. Exam Attempts Table
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  score INTEGER NOT NULL DEFAULT 0,
  warnings_count INTEGER NOT NULL DEFAULT 0,
  cheat_flag BOOLEAN NOT NULL DEFAULT FALSE,
  violations JSONB DEFAULT '[]'::jsonb,
  time_taken_sec INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE (exam_id, student_id)
);

-- 17. File Uploads Metadata Table
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_institute ON public.profiles(institute_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_code ON public.classes(join_code);
CREATE INDEX IF NOT EXISTS idx_class_members_class ON public.class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_student ON public.class_members(student_id);
CREATE INDEX IF NOT EXISTS idx_notices_class ON public.notices(class_id);
CREATE INDEX IF NOT EXISTS idx_resources_class ON public.resources(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_att_sessions_class ON public.attendance_sessions(class_id);
CREATE INDEX IF NOT EXISTS idx_att_records_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_att_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_exams_class ON public.exams(class_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam ON public.exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student ON public.exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_owner ON public.file_uploads(owner_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_class ON public.file_uploads(class_id);

-- ----------------------------------------------------------------------------
-- 4. SECURITY & AUTH HELPER FUNCTIONS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_class_teacher(p_class_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = p_class_id AND teacher_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_class_member(p_class_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_members
    WHERE class_id = p_class_id AND student_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = p_class_id AND teacher_id = auth.uid()
  ) OR (public.current_user_role() = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile upon Auth sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 6. RLS POLICIES
-- ----------------------------------------------------------------------------

-- Profiles
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL TO authenticated USING (public.current_user_role() = 'admin');

-- Institutes
DROP POLICY IF EXISTS "Institutes are readable by authenticated users" ON public.institutes;
CREATE POLICY "Institutes are readable by authenticated users"
  ON public.institutes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage institutes" ON public.institutes;
CREATE POLICY "Admins can manage institutes"
  ON public.institutes FOR ALL TO authenticated USING (public.current_user_role() = 'admin');

-- Classes
DROP POLICY IF EXISTS "Users can view classes they teach, are enrolled in, or if admin" ON public.classes;
CREATE POLICY "Users can view classes they teach, are enrolled in, or if admin"
  ON public.classes FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.class_members WHERE class_id = id AND student_id = auth.uid())
    OR public.current_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Teachers and admins can create classes" ON public.classes;
CREATE POLICY "Teachers and admins can create classes"
  ON public.classes FOR INSERT TO authenticated
  WITH CHECK (
    (public.current_user_role() = 'teacher' AND teacher_id = auth.uid())
    OR public.current_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Class teachers and admins can update their classes" ON public.classes;
CREATE POLICY "Class teachers and admins can update their classes"
  ON public.classes FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() OR public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Class teachers and admins can delete their classes" ON public.classes;
CREATE POLICY "Class teachers and admins can delete their classes"
  ON public.classes FOR DELETE TO authenticated
  USING (teacher_id = auth.uid() OR public.current_user_role() = 'admin');

-- Class Members
DROP POLICY IF EXISTS "Members can view class roster" ON public.class_members;
CREATE POLICY "Members can view class roster"
  ON public.class_members FOR SELECT TO authenticated USING (public.is_class_member(class_id));

DROP POLICY IF EXISTS "Students can join classes" ON public.class_members;
CREATE POLICY "Students can join classes"
  ON public.class_members FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers and students can leave or remove members" ON public.class_members;
CREATE POLICY "Teachers and students can leave or remove members"
  ON public.class_members FOR DELETE TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_class_teacher(class_id)
    OR public.current_user_role() = 'admin'
  );

-- Class Subjects
DROP POLICY IF EXISTS "Class members and admins can view class subjects" ON public.class_subjects;
CREATE POLICY "Class members and admins can view class subjects"
  ON public.class_subjects FOR SELECT TO authenticated USING (public.is_class_member(class_id));

DROP POLICY IF EXISTS "Teachers and admins can manage class subjects" ON public.class_subjects;
CREATE POLICY "Teachers and admins can manage class subjects"
  ON public.class_subjects FOR ALL TO authenticated
  USING (public.is_class_teacher(class_id) OR public.current_user_role() = 'admin')
  WITH CHECK (public.is_class_teacher(class_id) OR public.current_user_role() = 'admin');

-- Notices
DROP POLICY IF EXISTS "Class members can read notices" ON public.notices;
CREATE POLICY "Class members can read notices"
  ON public.notices FOR SELECT TO authenticated
  USING (
    public.is_class_member(class_id)
    AND (
      scheduled_for IS NULL
      OR scheduled_for <= TIMEZONE('utc', NOW())
      OR public.is_class_teacher(class_id)
    )
  );

DROP POLICY IF EXISTS "Teachers can create notices" ON public.notices;
CREATE POLICY "Teachers can create notices"
  ON public.notices FOR INSERT TO authenticated
  WITH CHECK (public.is_class_teacher(class_id) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can update notices" ON public.notices;
CREATE POLICY "Teachers can update notices"
  ON public.notices FOR UPDATE TO authenticated USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Teachers can delete notices" ON public.notices;
CREATE POLICY "Teachers can delete notices"
  ON public.notices FOR DELETE TO authenticated USING (public.is_class_teacher(class_id));

-- Resources & Links
DROP POLICY IF EXISTS "Class members can read resources" ON public.resources;
CREATE POLICY "Class members can read resources"
  ON public.resources FOR SELECT TO authenticated
  USING (
    public.is_class_member(class_id)
    AND (
      scheduled_for IS NULL
      OR scheduled_for <= TIMEZONE('utc', NOW())
      OR public.is_class_teacher(class_id)
    )
  );

DROP POLICY IF EXISTS "Teachers can create resources" ON public.resources;
CREATE POLICY "Teachers can create resources"
  ON public.resources FOR INSERT TO authenticated
  WITH CHECK (public.is_class_teacher(class_id) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can update resources" ON public.resources;
CREATE POLICY "Teachers can update resources"
  ON public.resources FOR UPDATE TO authenticated USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Teachers can delete resources" ON public.resources;
CREATE POLICY "Teachers can delete resources"
  ON public.resources FOR DELETE TO authenticated USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Class members can read resource links" ON public.resource_links;
CREATE POLICY "Class members can read resource links"
  ON public.resource_links FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND public.is_class_member(r.class_id)));

DROP POLICY IF EXISTS "Teachers can manage resource links" ON public.resource_links;
CREATE POLICY "Teachers can manage resource links"
  ON public.resource_links FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND (public.is_class_teacher(r.class_id) OR public.current_user_role() = 'admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.resources r WHERE r.id = resource_id AND (public.is_class_teacher(r.class_id) OR public.current_user_role() = 'admin')));

-- Resource Labels
DROP POLICY IF EXISTS "Class members and admins can view resource labels" ON public.resource_labels;
CREATE POLICY "Class members and admins can view resource labels"
  ON public.resource_labels FOR SELECT TO authenticated
  USING (class_id IS NULL OR public.is_class_member(class_id));

DROP POLICY IF EXISTS "Teachers and admins can manage resource labels" ON public.resource_labels;
CREATE POLICY "Teachers and admins can manage resource labels"
  ON public.resource_labels FOR ALL TO authenticated
  USING ((class_id IS NOT NULL AND public.is_class_teacher(class_id)) OR public.current_user_role() = 'admin')
  WITH CHECK ((class_id IS NOT NULL AND public.is_class_teacher(class_id)) OR public.current_user_role() = 'admin');

-- Assignments & Submissions
DROP POLICY IF EXISTS "Class members can read assignments" ON public.assignments;
CREATE POLICY "Class members can read assignments"
  ON public.assignments FOR SELECT TO authenticated
  USING (
    public.is_class_member(class_id)
    AND (
      scheduled_for IS NULL
      OR scheduled_for <= TIMEZONE('utc', NOW())
      OR public.is_class_teacher(class_id)
    )
  );

DROP POLICY IF EXISTS "Teachers can manage assignments" ON public.assignments;
CREATE POLICY "Teachers can manage assignments"
  ON public.assignments FOR ALL TO authenticated USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Students and teachers can view submissions" ON public.assignment_submissions;
CREATE POLICY "Students and teachers can view submissions"
  ON public.assignment_submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND public.is_class_teacher(a.class_id)));

DROP POLICY IF EXISTS "Students can submit assignments" ON public.assignment_submissions;
CREATE POLICY "Students can submit assignments"
  ON public.assignment_submissions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update their submissions before grading; Teachers can grade" ON public.assignment_submissions;
CREATE POLICY "Students can update their submissions before grading; Teachers can grade"
  ON public.assignment_submissions FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.assignments a WHERE a.id = assignment_id AND public.is_class_teacher(a.class_id)));

-- Attendance
DROP POLICY IF EXISTS "Class members can read attendance sessions" ON public.attendance_sessions;
CREATE POLICY "Class members can read attendance sessions"
  ON public.attendance_sessions FOR SELECT TO authenticated USING (public.is_class_member(class_id));

DROP POLICY IF EXISTS "Teachers can manage attendance sessions" ON public.attendance_sessions;
CREATE POLICY "Teachers can manage attendance sessions"
  ON public.attendance_sessions FOR ALL TO authenticated USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Students can view their records; Teachers can view all in class" ON public.attendance_records;
CREATE POLICY "Students can view their records; Teachers can view all in class"
  ON public.attendance_records FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.attendance_sessions s WHERE s.id = session_id AND public.is_class_teacher(s.class_id))
    OR public.current_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Teachers can manage attendance records" ON public.attendance_records;
CREATE POLICY "Teachers can manage attendance records"
  ON public.attendance_records FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.attendance_sessions s WHERE s.id = session_id AND public.is_class_teacher(s.class_id)));

-- Exams & Attempts
DROP POLICY IF EXISTS "Class members can view exams" ON public.exams;
CREATE POLICY "Class members can view exams"
  ON public.exams FOR SELECT TO authenticated USING (public.is_class_member(class_id));

DROP POLICY IF EXISTS "Teachers and admins can manage exams" ON public.exams;
CREATE POLICY "Teachers and admins can manage exams"
  ON public.exams FOR ALL TO authenticated
  USING (public.is_class_teacher(class_id) OR public.current_user_role() = 'admin')
  WITH CHECK (public.is_class_teacher(class_id) OR public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Questions readable by members" ON public.exam_questions;
CREATE POLICY "Questions readable by members"
  ON public.exam_questions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND public.is_class_member(e.class_id)));

DROP POLICY IF EXISTS "Teachers and admins can manage exam questions" ON public.exam_questions;
CREATE POLICY "Teachers and admins can manage exam questions"
  ON public.exam_questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')));

DROP POLICY IF EXISTS "Students can read own attempts; Teachers can read all attempts" ON public.exam_attempts;
CREATE POLICY "Students can read own attempts; Teachers can read all attempts"
  ON public.exam_attempts FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')));

DROP POLICY IF EXISTS "Students can submit exam attempt" ON public.exam_attempts;
CREATE POLICY "Students can submit exam attempt"
  ON public.exam_attempts FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students update own attempt; Teachers and admins manage attempts" ON public.exam_attempts;
CREATE POLICY "Students update own attempt; Teachers and admins manage attempts"
  ON public.exam_attempts FOR UPDATE TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')))
  WITH CHECK (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.exams e WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')));

-- File Uploads Metadata
DROP POLICY IF EXISTS "Users can view file metadata for classes they belong to or their own files" ON public.file_uploads;
CREATE POLICY "Users can view file metadata for classes they belong to or their own files"
  ON public.file_uploads FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR (class_id IS NOT NULL AND public.is_class_member(class_id)));

DROP POLICY IF EXISTS "Users can record their own uploaded files" ON public.file_uploads;
CREATE POLICY "Users can record their own uploaded files"
  ON public.file_uploads FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own uploaded files; Teachers can delete class files" ON public.file_uploads;
CREATE POLICY "Users can delete their own uploaded files; Teachers can delete class files"
  ON public.file_uploads FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR (class_id IS NOT NULL AND public.is_class_teacher(class_id)) OR public.current_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- 7. SUPABASE STORAGE BUCKET & STORAGE POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('classdesk-files', 'classdesk-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Allow authenticated users to upload files into their own user folder: userId/*
DROP POLICY IF EXISTS "Authenticated users can upload files to their folder" ON storage.objects;
CREATE POLICY "Authenticated users can upload files to their folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'classdesk-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read files in classdesk-files
DROP POLICY IF EXISTS "Authenticated users can read classdesk files" ON storage.objects;
CREATE POLICY "Authenticated users can read classdesk files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'classdesk-files');

-- Allow users to delete their own uploaded files
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'classdesk-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
