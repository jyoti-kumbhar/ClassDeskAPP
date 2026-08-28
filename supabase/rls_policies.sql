-- ============================================================================
-- CLASSDESK - ROW LEVEL SECURITY (RLS) & STORAGE POLICIES
-- Phase 3 (Database Architecture) & Phase 5 (File Upload System)
-- ============================================================================

-- Helper functions for cleaner policy expressions
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

-- 1. Enable RLS on all tables
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

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ============================================================================
-- INSTITUTES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Institutes are readable by authenticated users" ON public.institutes;
CREATE POLICY "Institutes are readable by authenticated users"
  ON public.institutes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage institutes" ON public.institutes;
CREATE POLICY "Admins can manage institutes"
  ON public.institutes FOR ALL
  TO authenticated
  USING (public.current_user_role() = 'admin');

-- ============================================================================
-- CLASSES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view classes they teach, are enrolled in, or if admin" ON public.classes;
CREATE POLICY "Users can view classes they teach, are enrolled in, or if admin"
  ON public.classes FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.class_members WHERE class_id = id AND student_id = auth.uid())
    OR public.current_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Teachers and admins can create classes" ON public.classes;
CREATE POLICY "Teachers and admins can create classes"
  ON public.classes FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.current_user_role() = 'teacher' AND teacher_id = auth.uid())
    OR public.current_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Class teachers and admins can update their classes" ON public.classes;
CREATE POLICY "Class teachers and admins can update their classes"
  ON public.classes FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid() OR public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Class teachers and admins can delete their classes" ON public.classes;
CREATE POLICY "Class teachers and admins can delete their classes"
  ON public.classes FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid() OR public.current_user_role() = 'admin');

-- ============================================================================
-- CLASS MEMBERS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Members can view class roster" ON public.class_members;
CREATE POLICY "Members can view class roster"
  ON public.class_members FOR SELECT
  TO authenticated
  USING (public.is_class_member(class_id));

DROP POLICY IF EXISTS "Students can join classes" ON public.class_members;
CREATE POLICY "Students can join classes"
  ON public.class_members FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers and students can leave or remove members" ON public.class_members;
CREATE POLICY "Teachers and students can leave or remove members"
  ON public.class_members FOR DELETE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_class_teacher(class_id)
    OR public.current_user_role() = 'admin'
  );

-- ============================================================================
-- CLASS SUBJECTS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Class members and admins can view class subjects" ON public.class_subjects;
CREATE POLICY "Class members and admins can view class subjects"
  ON public.class_subjects FOR SELECT
  TO authenticated
  USING (public.is_class_member(class_id));

DROP POLICY IF EXISTS "Teachers and admins can manage class subjects" ON public.class_subjects;
CREATE POLICY "Teachers and admins can manage class subjects"
  ON public.class_subjects FOR ALL
  TO authenticated
  USING (public.is_class_teacher(class_id) OR public.current_user_role() = 'admin')
  WITH CHECK (public.is_class_teacher(class_id) OR public.current_user_role() = 'admin');

-- ============================================================================
-- NOTICES POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Class members can read notices" ON public.notices;
CREATE POLICY "Class members can read notices"
  ON public.notices FOR SELECT
  TO authenticated
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
  ON public.notices FOR INSERT
  TO authenticated
  WITH CHECK (public.is_class_teacher(class_id) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can update notices" ON public.notices;
CREATE POLICY "Teachers can update notices"
  ON public.notices FOR UPDATE
  TO authenticated
  USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Teachers can delete notices" ON public.notices;
CREATE POLICY "Teachers can delete notices"
  ON public.notices FOR DELETE
  TO authenticated
  USING (public.is_class_teacher(class_id));

-- ============================================================================
-- RESOURCES & RESOURCE LINKS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Class members can read resources" ON public.resources;
CREATE POLICY "Class members can read resources"
  ON public.resources FOR SELECT
  TO authenticated
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
  ON public.resources FOR INSERT
  TO authenticated
  WITH CHECK (public.is_class_teacher(class_id) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can update resources" ON public.resources;
CREATE POLICY "Teachers can update resources"
  ON public.resources FOR UPDATE
  TO authenticated
  USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Teachers can delete resources" ON public.resources;
CREATE POLICY "Teachers can delete resources"
  ON public.resources FOR DELETE
  TO authenticated
  USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Class members can read resource links" ON public.resource_links;
CREATE POLICY "Class members can read resource links"
  ON public.resource_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.id = resource_id AND public.is_class_member(r.class_id)
    )
  );

DROP POLICY IF EXISTS "Teachers can manage resource links" ON public.resource_links;
CREATE POLICY "Teachers can manage resource links"
  ON public.resource_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.id = resource_id AND (public.is_class_teacher(r.class_id) OR public.current_user_role() = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.resources r
      WHERE r.id = resource_id AND (public.is_class_teacher(r.class_id) OR public.current_user_role() = 'admin')
    )
  );

-- ============================================================================
-- RESOURCE LABELS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Class members and admins can view resource labels" ON public.resource_labels;
CREATE POLICY "Class members and admins can view resource labels"
  ON public.resource_labels FOR SELECT
  TO authenticated
  USING (class_id IS NULL OR public.is_class_member(class_id));

DROP POLICY IF EXISTS "Teachers and admins can manage resource labels" ON public.resource_labels;
CREATE POLICY "Teachers and admins can manage resource labels"
  ON public.resource_labels FOR ALL
  TO authenticated
  USING (
    (class_id IS NOT NULL AND public.is_class_teacher(class_id))
    OR public.current_user_role() = 'admin'
  )
  WITH CHECK (
    (class_id IS NOT NULL AND public.is_class_teacher(class_id))
    OR public.current_user_role() = 'admin'
  );

-- ============================================================================
-- ASSIGNMENTS & SUBMISSIONS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Class members can read assignments" ON public.assignments;
CREATE POLICY "Class members can read assignments"
  ON public.assignments FOR SELECT
  TO authenticated
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
  ON public.assignments FOR ALL
  TO authenticated
  USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Students and teachers can view submissions" ON public.assignment_submissions;
CREATE POLICY "Students and teachers can view submissions"
  ON public.assignment_submissions FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_id AND public.is_class_teacher(a.class_id)
    )
  );

DROP POLICY IF EXISTS "Students can submit assignments" ON public.assignment_submissions;
CREATE POLICY "Students can submit assignments"
  ON public.assignment_submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can update their submissions before grading; Teachers can grade" ON public.assignment_submissions;
CREATE POLICY "Students can update their submissions before grading; Teachers can grade"
  ON public.assignment_submissions FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_id AND public.is_class_teacher(a.class_id)
    )
  );

-- ============================================================================
-- ATTENDANCE POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Class members can read attendance sessions" ON public.attendance_sessions;
CREATE POLICY "Class members can read attendance sessions"
  ON public.attendance_sessions FOR SELECT
  TO authenticated
  USING (public.is_class_member(class_id));

DROP POLICY IF EXISTS "Teachers can manage attendance sessions" ON public.attendance_sessions;
CREATE POLICY "Teachers can manage attendance sessions"
  ON public.attendance_sessions FOR ALL
  TO authenticated
  USING (public.is_class_teacher(class_id));

DROP POLICY IF EXISTS "Students can view their records; Teachers can view all in class" ON public.attendance_records;
CREATE POLICY "Students can view their records; Teachers can view all in class"
  ON public.attendance_records FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.attendance_sessions s
      WHERE s.id = session_id AND public.is_class_teacher(s.class_id)
    )
    OR public.current_user_role() = 'admin'
  );

DROP POLICY IF EXISTS "Teachers can manage attendance records" ON public.attendance_records;
CREATE POLICY "Teachers can manage attendance records"
  ON public.attendance_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.attendance_sessions s
      WHERE s.id = session_id AND public.is_class_teacher(s.class_id)
    )
  );

-- ============================================================================
-- EXAMS & ATTEMPTS POLICIES
-- ============================================================================
DROP POLICY IF EXISTS "Class members can view exams" ON public.exams;
CREATE POLICY "Class members can view exams"
  ON public.exams FOR SELECT
  TO authenticated
  USING (public.is_class_member(class_id));

DROP POLICY IF EXISTS "Teachers and admins can manage exams" ON public.exams;
CREATE POLICY "Teachers and admins can manage exams"
  ON public.exams FOR ALL
  TO authenticated
  USING (public.is_class_teacher(class_id) OR public.current_user_role() = 'admin')
  WITH CHECK (public.is_class_teacher(class_id) OR public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Questions readable by members" ON public.exam_questions;
CREATE POLICY "Questions readable by members"
  ON public.exam_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id AND public.is_class_member(e.class_id)
    )
  );

DROP POLICY IF EXISTS "Teachers and admins can manage exam questions" ON public.exam_questions;
CREATE POLICY "Teachers and admins can manage exam questions"
  ON public.exam_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')
    )
  );

DROP POLICY IF EXISTS "Students can read own attempts; Teachers can read all attempts" ON public.exam_attempts;
CREATE POLICY "Students can read own attempts; Teachers can read all attempts"
  ON public.exam_attempts FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')
    )
  );

DROP POLICY IF EXISTS "Students can submit exam attempt" ON public.exam_attempts;
CREATE POLICY "Students can submit exam attempt"
  ON public.exam_attempts FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students update own attempt; Teachers and admins manage attempts" ON public.exam_attempts;
CREATE POLICY "Students update own attempt; Teachers and admins manage attempts"
  ON public.exam_attempts FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')
    )
  )
  WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.exams e
      WHERE e.id = exam_id AND (public.is_class_teacher(e.class_id) OR public.current_user_role() = 'admin')
    )
  );

-- ============================================================================
-- FILE UPLOADS METADATA POLICIES (Phase 5)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view file metadata for classes they belong to or their own files" ON public.file_uploads;
CREATE POLICY "Users can view file metadata for classes they belong to or their own files"
  ON public.file_uploads FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR (class_id IS NOT NULL AND public.is_class_member(class_id))
  );

DROP POLICY IF EXISTS "Users can record their own uploaded files" ON public.file_uploads;
CREATE POLICY "Users can record their own uploaded files"
  ON public.file_uploads FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own uploaded files; Teachers can delete class files" ON public.file_uploads;
CREATE POLICY "Users can delete their own uploaded files; Teachers can delete class files"
  ON public.file_uploads FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR (class_id IS NOT NULL AND public.is_class_teacher(class_id))
    OR public.current_user_role() = 'admin'
  );

-- ============================================================================
-- SUPABASE STORAGE BUCKET & POLICIES (Phase 5)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('classdesk-files', 'classdesk-files', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Allow authenticated users to upload files into their own user folder: userId/*
DROP POLICY IF EXISTS "Authenticated users can upload files to their folder" ON storage.objects;
CREATE POLICY "Authenticated users can upload files to their folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'classdesk-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read files in classdesk-files
DROP POLICY IF EXISTS "Authenticated users can read classdesk files" ON storage.objects;
CREATE POLICY "Authenticated users can read classdesk files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'classdesk-files');

-- Allow users to delete their own uploaded files
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'classdesk-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
