import { getSupabaseClient } from './supabase';

export interface Student {
  id: string;
  name: string;
  roll_number: string;
  points: number;
  streak: number;
  created_at?: string;
}

export interface DutySchedule {
  id: string;
  day: string; // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
  student_id: string;
  student?: Student;
}

export interface PiketTask {
  id: string;
  name: string;
  is_active: boolean;
}

export interface PiketLog {
  id: string;
  student_id: string;
  student_name: string;
  date: string; // YYYY-MM-DD
  completed_tasks: string[]; // array of task names or IDs
  notes: string;
  photo_url?: string;
  points_awarded: number;
  created_at: string;
}

// ==========================================
// MOCK DATA FOR LOCAL STORAGE FALLBACK
// ==========================================

const MOCK_STUDENTS: Student[] = [
  { id: 'st-1', name: 'Algi Fahri', roll_number: '01', points: 120, streak: 3 },
  { id: 'st-2', name: 'Budi Hartono', roll_number: '02', points: 95, streak: 1 },
  { id: 'st-3', name: 'Citra Kirana', roll_number: '03', points: 150, streak: 5 },
  { id: 'st-4', name: 'Dedi Corbuzier', roll_number: '04', points: 80, streak: 0 },
  { id: 'st-5', name: 'Eka Saputra', roll_number: '05', points: 110, streak: 2 },
  { id: 'st-6', name: 'Farhan Halim', roll_number: '06', points: 105, streak: 2 },
  { id: 'st-7', name: 'Gita Savitri', roll_number: '07', points: 140, streak: 4 },
  { id: 'st-8', name: 'Hari Murti', roll_number: '08', points: 70, streak: 0 },
  { id: 'st-9', name: 'Indah Kusuma', roll_number: '09', points: 130, streak: 3 },
  { id: 'st-10', name: 'Joko Widodo', roll_number: '10', points: 90, streak: 1 },
];

const MOCK_SCHEDULES: DutySchedule[] = [
  { id: 'sch-1', day: 'Senin', student_id: 'st-1' },
  { id: 'sch-2', day: 'Senin', student_id: 'st-2' },
  { id: 'sch-3', day: 'Selasa', student_id: 'st-3' },
  { id: 'sch-4', day: 'Selasa', student_id: 'st-4' },
  { id: 'sch-5', day: 'Rabu', student_id: 'st-5' },
  { id: 'sch-6', day: 'Rabu', student_id: 'st-6' },
  { id: 'sch-7', day: 'Kamis', student_id: 'st-7' },
  { id: 'sch-8', day: 'Kamis', student_id: 'st-8' },
  { id: 'sch-9', day: 'Jumat', student_id: 'st-9' },
  { id: 'sch-10', day: 'Jumat', student_id: 'st-10' },
];

const MOCK_TASKS: PiketTask[] = [
  { id: 'tsk-1', name: 'Menyapu Lantai Kelas', is_active: true },
  { id: 'tsk-2', name: 'Mengepel Lantai Kelas', is_active: true },
  { id: 'tsk-3', name: 'Membuang Sampah ke TPS', is_active: true },
  { id: 'tsk-4', name: 'Membersihkan Papan Tulis & Spidol', is_active: true },
  { id: 'tsk-5', name: 'Merapikan Kursi & Meja Guru/Siswa', is_active: true },
];

const MOCK_LOGS: PiketLog[] = [
  {
    id: 'log-1',
    student_id: 'st-3',
    student_name: 'Citra Kirana',
    date: '2026-05-22',
    completed_tasks: ['Menyapu Lantai Kelas', 'Membersihkan Papan Tulis & Spidol', 'Merapikan Kursi & Meja Guru/Siswa'],
    notes: 'Selesai piket hari Selasa! Kelas sudah wangi dan bersih.',
    photo_url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=400&q=80',
    points_awarded: 15,
    created_at: '2026-05-22T07:15:00.000Z',
  },
  {
    id: 'log-2',
    student_id: 'st-1',
    student_name: 'Algi Fahri',
    date: '2026-05-21',
    completed_tasks: ['Menyapu Lantai Kelas', 'Mengepel Lantai Kelas', 'Membuang Sampah ke TPS'],
    notes: 'Piket hari Senin selesai sama Budi. Semua sampah dibuang.',
    photo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
    points_awarded: 15,
    created_at: '2026-05-21T07:30:00.000Z',
  },
];

// Initialize LocalStorage Data
function initLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('cmon_students')) {
    localStorage.setItem('cmon_students', JSON.stringify(MOCK_STUDENTS));
  }
  if (!localStorage.getItem('cmon_schedules')) {
    localStorage.setItem('cmon_schedules', JSON.stringify(MOCK_SCHEDULES));
  }
  if (!localStorage.getItem('cmon_tasks')) {
    localStorage.setItem('cmon_tasks', JSON.stringify(MOCK_TASKS));
  }
  if (!localStorage.getItem('cmon_logs')) {
    localStorage.setItem('cmon_logs', JSON.stringify(MOCK_LOGS));
  }
}

// Helpers for Local Database
const localDb = {
  getStudents: (): Student[] => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('cmon_students') || '[]');
  },
  saveStudents: (students: Student[]) => {
    localStorage.setItem('cmon_students', JSON.stringify(students));
  },
  getSchedules: (): DutySchedule[] => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('cmon_schedules') || '[]');
  },
  saveSchedules: (schedules: DutySchedule[]) => {
    localStorage.setItem('cmon_schedules', JSON.stringify(schedules));
  },
  getTasks: (): PiketTask[] => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('cmon_tasks') || '[]');
  },
  saveTasks: (tasks: PiketTask[]) => {
    localStorage.setItem('cmon_tasks', JSON.stringify(tasks));
  },
  getLogs: (): PiketLog[] => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('cmon_logs') || '[]');
  },
  saveLogs: (logs: PiketLog[]) => {
    localStorage.setItem('cmon_logs', JSON.stringify(logs));
  },
};

// ==========================================
// DUAL DATA API (LOCAL / SUPABASE)
// ==========================================

export const db = {
  // --- STUDENTS (MEMBERS) ---
  getStudents: async (): Promise<Student[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name', { ascending: true });
      
      if (!error && data) return data as Student[];
      console.warn('Supabase getStudents error, falling back to local storage:', error);
    }
    return localDb.getStudents();
  },

  createStudent: async (name: string, rollNumber: string): Promise<Student> => {
    const newStudent: Student = {
      id: 'st-' + Math.random().toString(36).substr(2, 9),
      name,
      roll_number: rollNumber,
      points: 0,
      streak: 0,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('students')
        .insert({
          id: newStudent.id,
          name: newStudent.name,
          roll_number: newStudent.roll_number,
          points: 0,
          streak: 0
        })
        .select()
        .single();
      
      if (!error && data) return data as Student;
      console.warn('Supabase createStudent failed, using local storage:', error);
    }

    const students = localDb.getStudents();
    students.push(newStudent);
    localDb.saveStudents(students);
    return newStudent;
  },

  updateStudent: async (id: string, name: string, rollNumber: string, points?: number, streak?: number): Promise<Student | null> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const updates: any = { name, roll_number: rollNumber };
      if (points !== undefined) updates.points = points;
      if (streak !== undefined) updates.streak = streak;

      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (!error && data) return data as Student;
      console.warn('Supabase updateStudent failed, using local storage:', error);
    }

    const students = localDb.getStudents();
    const idx = students.findIndex((s) => s.id === id);
    if (idx !== -1) {
      students[idx].name = name;
      students[idx].roll_number = rollNumber;
      if (points !== undefined) students[idx].points = points;
      if (streak !== undefined) students[idx].streak = streak;
      localDb.saveStudents(students);
      return students[idx];
    }
    return null;
  },

  deleteStudent: async (id: string): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      // First delete dependent schedules
      await supabase.from('schedules').delete().eq('student_id', id);
      // Delete student
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) return true;
      console.warn('Supabase deleteStudent failed, using local storage:', error);
    }

    // Delete locally
    const students = localDb.getStudents();
    const filteredStudents = students.filter((s) => s.id !== id);
    localDb.saveStudents(filteredStudents);

    const schedules = localDb.getSchedules();
    const filteredSchedules = schedules.filter((s) => s.student_id !== id);
    localDb.saveSchedules(filteredSchedules);

    return true;
  },

  // --- SCHEDULES ---
  getSchedules: async (): Promise<DutySchedule[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('schedules')
        .select('*, student:students(*)');
      
      if (!error && data) return data as DutySchedule[];
      console.warn('Supabase getSchedules error, falling back to local storage:', error);
    }

    // Local resolution of relation
    const schedules = localDb.getSchedules();
    const students = localDb.getStudents();
    return schedules.map((sch) => ({
      ...sch,
      student: students.find((st) => st.id === sch.student_id),
    }));
  },

  setSchedule: async (day: string, studentIds: string[]): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      // Delete existing schedules for this day
      await supabase.from('schedules').delete().eq('day', day);
      
      if (studentIds.length > 0) {
        const inserts = studentIds.map((sid) => ({
          id: 'sch-' + Math.random().toString(36).substr(2, 9),
          day,
          student_id: sid,
        }));
        const { error } = await supabase.from('schedules').insert(inserts);
        if (!error) return true;
        console.warn('Supabase setSchedule insert failed:', error);
      } else {
        return true;
      }
    }

    // Local updates
    let schedules = localDb.getSchedules();
    schedules = schedules.filter((s) => s.day !== day);
    studentIds.forEach((sid) => {
      schedules.push({
        id: 'sch-' + Math.random().toString(36).substr(2, 9),
        day,
        student_id: sid,
      });
    });
    localDb.saveSchedules(schedules);
    return true;
  },

  // --- TASKS ---
  getTasks: async (): Promise<PiketTask[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('piket_tasks')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data) return data as PiketTask[];
    }
    return localDb.getTasks();
  },

  saveTasks: async (tasks: PiketTask[]): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      // Upsert tasks
      const { error } = await supabase.from('piket_tasks').upsert(
        tasks.map((t) => ({ id: t.id, name: t.name, is_active: t.is_active }))
      );
      if (!error) return true;
    }
    localDb.saveTasks(tasks);
    return true;
  },

  // --- LOGS & ABSENSI ---
  getLogs: async (): Promise<PiketLog[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('piket_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as PiketLog[];
    }
    return localDb.getLogs().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  createLog: async (studentId: string, completedTasks: string[], notes: string, photoUrl: string): Promise<PiketLog> => {
    // 1. Get student to retrieve name
    const students = await db.getStudents();
    const student = students.find((s) => s.id === studentId);
    const studentName = student ? student.name : 'Siswa Misterius';

    // 2. Award points
    const pointsAwarded = 15; // 15 points per piket duty
    const newStreak = student ? student.streak + 1 : 1;
    const newPoints = student ? student.points + pointsAwarded : pointsAwarded;

    // Update student points & streaks
    if (student) {
      await db.updateStudent(student.id, student.name, student.roll_number, newPoints, newStreak);
    }

    const newLog: PiketLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      student_id: studentId,
      student_name: studentName,
      date: new Date().toISOString().split('T')[0],
      completed_tasks: completedTasks,
      notes,
      photo_url: photoUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
      points_awarded: pointsAwarded,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('piket_logs')
        .insert({
          id: newLog.id,
          student_id: newLog.student_id,
          student_name: newLog.student_name,
          date: newLog.date,
          completed_tasks: newLog.completed_tasks,
          notes: newLog.notes,
          photo_url: newLog.photo_url,
          points_awarded: newLog.points_awarded
        })
        .select()
        .single();
      
      if (!error && data) return data as PiketLog;
      console.warn('Supabase createLog failed, using local storage:', error);
    }

    const logs = localDb.getLogs();
    logs.push(newLog);
    localDb.saveLogs(logs);
    return newLog;
  },

  // --- SYNC DATABASE TO SUPABASE ---
  // Copies local data to Supabase if Supabase is connected and empty
  syncToSupabase: async (): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, message: 'Supabase belum terkonfigurasi.' };

    try {
      // 1. Sync Students
      const { data: remoteStudents } = await supabase.from('students').select('id');
      if (remoteStudents && remoteStudents.length === 0) {
        const localStudents = localDb.getStudents();
        if (localStudents.length > 0) {
          const { error } = await supabase.from('students').insert(
            localStudents.map(s => ({
              id: s.id,
              name: s.name,
              roll_number: s.roll_number,
              points: s.points,
              streak: s.streak
            }))
          );
          if (error) console.error('Error syncing students:', error);
        }
      }

      // 2. Sync Schedules
      const { data: remoteSchedules } = await supabase.from('schedules').select('id');
      if (remoteSchedules && remoteSchedules.length === 0) {
        const localSchedules = localDb.getSchedules();
        if (localSchedules.length > 0) {
          const { error } = await supabase.from('schedules').insert(
            localSchedules.map(s => ({
              id: s.id,
              day: s.day,
              student_id: s.student_id
            }))
          );
          if (error) console.error('Error syncing schedules:', error);
        }
      }

      // 3. Sync Tasks
      const { data: remoteTasks } = await supabase.from('piket_tasks').select('id');
      if (remoteTasks && remoteTasks.length === 0) {
        const localTasks = localDb.getTasks();
        if (localTasks.length > 0) {
          const { error } = await supabase.from('piket_tasks').insert(
            localTasks.map(t => ({
              id: t.id,
              name: t.name,
              is_active: t.is_active
            }))
          );
          if (error) console.error('Error syncing tasks:', error);
        }
      }

      // 4. Sync Logs
      const { data: remoteLogs } = await supabase.from('piket_logs').select('id');
      if (remoteLogs && remoteLogs.length === 0) {
        const localLogs = localDb.getLogs();
        if (localLogs.length > 0) {
          const { error } = await supabase.from('piket_logs').insert(
            localLogs.map(l => ({
              id: l.id,
              student_id: l.student_id,
              student_name: l.student_name,
              date: l.date,
              completed_tasks: l.completed_tasks,
              notes: l.notes,
              photo_url: l.photo_url,
              points_awarded: l.points_awarded,
              created_at: l.created_at
            }))
          );
          if (error) console.error('Error syncing logs:', error);
        }
      }

      return { success: true, message: 'Sinkronisasi berhasil! Semua data lokal telah dipindahkan ke Supabase Cloud.' };
    } catch (e: any) {
      return { success: false, message: 'Gagal melakukan sinkronisasi: ' + e.message };
    }
  }
};

// ==========================================
// SQL INITIALIZATION SCRIPT FOR SUPABASE
// ==========================================
export const SUPABASE_SQL_SCHEMA = `-- COPY DAN PASTE SCRIPT INI DI SQL EDITOR SUPABASE ANDA:

-- 1. Buat Tabel Siswa (Students)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete students" ON public.students FOR DELETE USING (true);

-- 2. Buat Tabel Jadwal Piket (Schedules)
CREATE TABLE IF NOT EXISTS public.schedules (
    id TEXT PRIMARY KEY,
    day TEXT NOT NULL, -- 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert schedules" ON public.schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update schedules" ON public.schedules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete schedules" ON public.schedules FOR DELETE USING (true);

-- 3. Buat Tabel Tugas Piket (Piket Tasks)
CREATE TABLE IF NOT EXISTS public.piket_tasks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.piket_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read tasks" ON public.piket_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert tasks" ON public.piket_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tasks" ON public.piket_tasks FOR UPDATE USING (true);

-- 4. Buat Tabel Log Absensi Piket (Piket Logs)
CREATE TABLE IF NOT EXISTS public.piket_logs (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_tasks TEXT[] NOT NULL,
    notes TEXT,
    photo_url TEXT,
    points_awarded INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.piket_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read logs" ON public.piket_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert logs" ON public.piket_logs FOR INSERT WITH CHECK (true);
`;
