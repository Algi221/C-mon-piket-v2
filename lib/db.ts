import { getSupabaseClient } from './supabase';

export interface User {
  id: number;
  name: string;
  nipd: string; // Used as student number / teacher login ID
  password?: string;
  role: 'siswa' | 'guru';
  photo_url?: string;
}

export interface Schedule {
  id: number;
  day: string; // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
  user_id: number;
  is_pj: boolean;
  student?: User; // Joined student detail
}

export interface Report {
  id: number;
  date: string; // YYYY-MM-DD
  reporter_id: number;
  reporter_name?: string;
  image_path: string; // Proof image
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  notes?: string; // Optional user notes
  details?: ReportDetail[]; // Joined present students
}

export interface ReportDetail {
  id: number;
  report_id: number;
  student_id: number;
  is_present: number; // 1 = Hadir, 0 = Absen
  student_name?: string;
  student_nipd?: string;
}

// ==========================================
// OFFLINE MOCK DATABASE FALLBACK (LOCALSTORAGE)
// ==========================================

const MOCK_USERS: User[] = [
  { id: 42, name: 'Netti Herawati S.s M.pd', nipd: 'admin', password: 'admin', role: 'guru' },
  { id: 44, name: 'AIRA DINARA JASMINE', nipd: '0002', password: '123', role: 'siswa' },
  { id: 45, name: 'ALVIRA DINARA PUTRI', nipd: '0003', password: '123', role: 'siswa' },
  { id: 46, name: 'ALYA NAFISA PUTRI', nipd: '0004', password: '123', role: 'siswa' },
  { id: 47, name: 'AMANDA KANYA PUTRI', nipd: '0005', password: '123', role: 'siswa' },
  { id: 48, name: 'Bagus Prastyo', nipd: '0006', password: '123', role: 'siswa' },
  { id: 49, name: 'Citra Kirana', nipd: '0007', password: '123', role: 'siswa' },
  { id: 50, name: 'Dedi Corbuzier', nipd: '0008', password: '123', role: 'siswa' },
];

const MOCK_SCHEDULES: Schedule[] = [
  { id: 1, day: 'Senin', user_id: 44, is_pj: true },
  { id: 2, day: 'Senin', user_id: 45, is_pj: false },
  { id: 3, day: 'Selasa', user_id: 46, is_pj: true },
  { id: 4, day: 'Selasa', user_id: 47, is_pj: false },
  { id: 5, day: 'Rabu', user_id: 48, is_pj: true },
  { id: 6, day: 'Kamis', user_id: 49, is_pj: true },
  { id: 7, day: 'Jumat', user_id: 50, is_pj: true },
];

const MOCK_REPORTS: Report[] = [
  {
    id: 5,
    date: '2026-05-21',
    reporter_id: 44,
    reporter_name: 'AIRA DINARA JASMINE',
    image_path: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=400&q=80',
    status: 'verified',
    created_at: '2026-05-21T14:17:09.000Z',
  }
];

const MOCK_REPORT_DETAILS: ReportDetail[] = [
  { id: 39, report_id: 5, student_id: 44, is_present: 1, student_name: 'AIRA DINARA JASMINE', student_nipd: '0002' },
  { id: 40, report_id: 5, student_id: 45, is_present: 1, student_name: 'ALVIRA DINARA PUTRI', student_nipd: '0003' },
];

function initLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('cmon_v2_users')) {
    localStorage.setItem('cmon_v2_users', JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem('cmon_v2_schedules')) {
    localStorage.setItem('cmon_v2_schedules', JSON.stringify(MOCK_SCHEDULES));
  }
  if (!localStorage.getItem('cmon_v2_reports')) {
    localStorage.setItem('cmon_v2_reports', JSON.stringify(MOCK_REPORTS));
  }
  if (!localStorage.getItem('cmon_v2_report_details')) {
    localStorage.setItem('cmon_v2_report_details', JSON.stringify(MOCK_REPORT_DETAILS));
  }
}

const localDb = {
  getUsers: (): User[] => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('cmon_v2_users') || '[]');
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem('cmon_v2_users', JSON.stringify(users));
  },
  getSchedules: (): Schedule[] => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('cmon_v2_schedules') || '[]');
  },
  saveSchedules: (schedules: Schedule[]) => {
    localStorage.setItem('cmon_v2_schedules', JSON.stringify(schedules));
  },
  getReports: (): Report[] => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('cmon_v2_reports') || '[]');
  },
  saveReports: (reports: Report[]) => {
    localStorage.setItem('cmon_v2_reports', JSON.stringify(reports));
  },
  getReportDetails: (): ReportDetail[] => {
    initLocalStorage();
    return JSON.parse(localStorage.getItem('cmon_v2_report_details') || '[]');
  },
  saveReportDetails: (details: ReportDetail[]) => {
    localStorage.setItem('cmon_v2_report_details', JSON.stringify(details));
  },
};

// ==========================================
// UNIFIED DATA ACCESS ENGINE
// ==========================================

export const db = {
  // --- USERS (STUDENTS & TEACHERS) ---
  
  getStudents: async (): Promise<User[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'siswa')
        .order('name', { ascending: true });
      if (!error && data) return data as User[];
      console.warn('Supabase getStudents error, falling back to LocalStorage:', error);
    }
    return localDb.getUsers().filter(u => u.role === 'siswa');
  },

  getAllUsers: async (): Promise<User[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });
      if (!error && data) return data as User[];
    }
    return localDb.getUsers();
  },

  createStudent: async (name: string, nipd: string, password = '123'): Promise<User> => {
    const newId = Math.floor(Math.random() * 1000000);
    const newStudent: User = {
      id: newId,
      name,
      nipd,
      password,
      role: 'siswa',
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: newStudent.id,
          name: newStudent.name,
          nipd: newStudent.nipd,
          password: newStudent.password,
          role: 'siswa'
        })
        .select()
        .single();
      
      if (!error && data) return data as User;
      console.warn('Supabase createStudent failed, using local storage:', error);
    }

    const users = localDb.getUsers();
    users.push(newStudent);
    localDb.saveUsers(users);
    return newStudent;
  },

  updateStudent: async (id: number, name: string, nipd: string, password?: string): Promise<User | null> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const updates: any = { name, nipd };
      if (password) updates.password = password;

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (!error && data) return data as User;
      console.warn('Supabase updateStudent failed, using local storage:', error);
    }

    const users = localDb.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      users[idx].name = name;
      users[idx].nipd = nipd;
      if (password) users[idx].password = password;
      localDb.saveUsers(users);
      return users[idx];
    }
    return null;
  },

  deleteStudent: async (id: number): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      // Cascade delete schedule mapping
      await supabase.from('schedules').delete().eq('user_id', id);
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) return true;
      console.warn('Supabase deleteStudent failed, using local storage:', error);
    }

    const users = localDb.getUsers();
    localDb.saveUsers(users.filter((u) => u.id !== id));

    const schedules = localDb.getSchedules();
    localDb.saveSchedules(schedules.filter((s) => s.user_id !== id));

    return true;
  },

  // --- LOGIN VERIFICATION ---

  verifyLogin: async (nipd: string, password?: string): Promise<User | null> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('users').select('*').eq('nipd', nipd);
      if (password) {
        query = query.eq('password', password);
      }
      
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data[0] as User;
      }
      console.warn('Supabase verifyLogin failed/no-match, checking LocalStorage:', error);
    }

    const users = localDb.getUsers();
    const match = users.find(u => u.nipd === nipd && (!password || u.password === password));
    return match || null;
  },

  // --- SCHEDULES ---

  getSchedules: async (): Promise<Schedule[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('schedules')
        .select('id, day, user_id, is_pj, student:users!user_id(id, name, nipd, role, photo_url)');
      
      if (!error && data) {
        // Map to flat Schedule object
        return data.map((d: any) => ({
          id: d.id,
          day: d.day,
          user_id: d.user_id,
          is_pj: d.is_pj,
          student: d.student ? (Array.isArray(d.student) ? d.student[0] : d.student) : undefined,
        })) as Schedule[];
      }
      console.warn('Supabase getSchedules error, falling back to LocalStorage:', error);
    }

    const schedules = localDb.getSchedules();
    const users = localDb.getUsers();
    return schedules.map((sch) => ({
      ...sch,
      student: users.find((u) => u.id === sch.user_id),
    }));
  },

  setSchedule: async (day: string, activeRoster: { userId: number, isPj: boolean }[]): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      // 1. Clear existing schedules for this day
      await supabase.from('schedules').delete().eq('day', day);
      
      // 2. Insert new roster mappings
      if (activeRoster.length > 0) {
        const inserts = activeRoster.map((r) => ({
          id: Math.floor(Math.random() * 1000000),
          day,
          user_id: r.userId,
          is_pj: r.isPj,
        }));
        const { error } = await supabase.from('schedules').insert(inserts);
        if (!error) return true;
        console.warn('Supabase setSchedule inserts failed:', error);
      } else {
        return true;
      }
    }

    // Local updates
    let schedules = localDb.getSchedules();
    schedules = schedules.filter((s) => s.day !== day);
    activeRoster.forEach((r) => {
      schedules.push({
        id: Math.floor(Math.random() * 1000000),
        day,
        user_id: r.userId,
        is_pj: r.isPj,
      });
    });
    localDb.saveSchedules(schedules);
    return true;
  },

  // --- REPORTS & REPORT DETAILS ---

  getLogs: async (): Promise<Report[]> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      // 1. Fetch reports with reporter join
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('id, date, reporter_id, image_path, status, created_at, reporter:users!reporter_id(name)')
        .order('created_at', { ascending: false });

      if (!reportsError && reportsData) {
        // 2. Fetch all details with student join
        const { data: detailsData, error: detailsError } = await supabase
          .from('report_details')
          .select('id, report_id, student_id, is_present, student:users!student_id(name, nipd)');

        if (!detailsError && detailsData) {
          return reportsData.map((rep: any) => {
            // Filter details for this report
            const rDetails = detailsData
              .filter((det: any) => det.report_id === rep.id)
              .map((det: any) => ({
                id: det.id,
                report_id: det.report_id,
                student_id: det.student_id,
                is_present: det.is_present,
                student_name: det.student?.name,
                student_nipd: det.student?.nipd,
              }));

            return {
              id: rep.id,
              date: rep.date,
              reporter_id: rep.reporter_id,
              reporter_name: rep.reporter?.name || 'Siswa',
              image_path: rep.image_path,
              status: rep.status as 'pending' | 'verified' | 'rejected',
              created_at: rep.created_at,
              details: rDetails,
            };
          });
        }
      }
      console.warn('Supabase getLogs error, falling back to LocalStorage:', reportsError || 'Details error');
    }

    // Local resolution of joins
    const reports = localDb.getReports();
    const details = localDb.getReportDetails();
    const users = localDb.getUsers();

    return reports.map((rep) => {
      const repDetails = details
        .filter((d) => d.report_id === rep.id)
        .map((d) => {
          const studentObj = users.find((u) => u.id === d.student_id);
          return {
            ...d,
            student_name: studentObj?.name,
            student_nipd: studentObj?.nipd,
          };
        });

      const reporterObj = users.find((u) => u.id === rep.reporter_id);

      return {
        ...rep,
        reporter_name: reporterObj?.name,
        details: repDetails,
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  createReport: async (
    reporterId: number,
    photoUrl: string,
    attendanceList: { studentId: number; isPresent: boolean }[],
    notes?: string
  ): Promise<Report> => {
    const reportId = Math.floor(Math.random() * 1000000);
    const dateStr = new Date().toISOString().split('T')[0];
    const createdAtStr = new Date().toISOString();

    const newReport: Report = {
      id: reportId,
      date: dateStr,
      reporter_id: reporterId,
      image_path: photoUrl || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
      status: 'pending', // Default is pending, teacher must verify!
      created_at: createdAtStr,
      notes: notes,
    };

    const newDetails: ReportDetail[] = attendanceList.map((att) => ({
      id: Math.floor(Math.random() * 1000000),
      report_id: reportId,
      student_id: att.studentId,
      is_present: att.isPresent ? 1 : 0,
    }));

    const supabase = getSupabaseClient();
    if (supabase) {
      // 1. Insert into reports
      const { data: repData, error: repError } = await supabase
        .from('reports')
        .insert({
          id: newReport.id,
          date: newReport.date,
          reporter_id: newReport.reporter_id,
          image_path: newReport.image_path,
          status: 'pending'
        })
        .select()
        .single();

      if (!repError && repData) {
        // 2. Bulk insert details
        const { error: detError } = await supabase
          .from('report_details')
          .insert(
            newDetails.map(d => ({
              id: d.id,
              report_id: d.report_id,
              student_id: d.student_id,
              is_present: d.is_present
            }))
          );
        
        if (!detError) {
          const users = await db.getAllUsers();
          const reporterUser = users.find(u => u.id === reporterId);
          return {
            ...newReport,
            reporter_name: reporterUser?.name,
            details: newDetails.map(d => {
              const uObj = users.find(u => u.id === d.student_id);
              return { ...d, student_name: uObj?.name, student_nipd: uObj?.nipd };
            })
          };
        }
        console.error('Supabase report_details bulk insert failed:', detError);
      } else {
        console.error('Supabase reports insert failed:', repError);
      }
    }

    // Local fallback save
    const reports = localDb.getReports();
    reports.push(newReport);
    localDb.saveReports(reports);

    const details = localDb.getReportDetails();
    newDetails.forEach(d => details.push(d));
    localDb.saveReportDetails(details);

    const users = localDb.getUsers();
    const reporterUser = users.find(u => u.id === reporterId);

    return {
      ...newReport,
      reporter_name: reporterUser?.name,
      details: newDetails.map(d => {
        const uObj = users.find(u => u.id === d.student_id);
        return { ...d, student_name: uObj?.name, student_nipd: uObj?.nipd };
      })
    };
  },

  verifyReport: async (reportId: number, status: 'verified' | 'rejected'): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);
      
      if (!error) return true;
      console.warn('Supabase verifyReport failed, updating local storage:', error);
    }

    const reports = localDb.getReports();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      reports[idx].status = status;
      localDb.saveReports(reports);
      return true;
    }
    return false;
  },

  // --- DYNAMIC LEADERBOARD POINTS & STREAKS CALCULATOR ---
  // Verified piket presence = +15 points.
  // Streaks = consecutive days present in reports that are verified.
  
  getLeaderboard: async (): Promise<(User & { points: number; streak: number })[]> => {
    const allUsers = await db.getAllUsers();
    const students = allUsers.filter(u => u.role === 'siswa');
    const logs = await db.getLogs();
    
    // Filter only verified logs
    const verifiedLogs = logs.filter(l => l.status === 'verified');

    return students.map(student => {
      // 1. Calculate points
      // Each presence in a verified log = 15 points
      const presences = verifiedLogs.filter(log => {
        const detail = log.details?.find(d => d.student_id === student.id);
        return detail && detail.is_present === 1;
      });
      const points = presences.length * 15;

      // 2. Calculate streak (consecutive verified days present)
      // Sort presence logs by date (descending)
      const sortedPresences = presences.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let streak = 0;
      if (sortedPresences.length > 0) {
        streak = 1;
        let lastDate = new Date(sortedPresences[0].date);
        
        for (let i = 1; i < sortedPresences.length; i++) {
          const currentDate = new Date(sortedPresences[i].date);
          const diffTime = Math.abs(lastDate.getTime() - currentDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            streak++;
            lastDate = currentDate;
          } else if (diffDays > 1) {
            break; // Streak broken
          }
        }
      }

      return {
        ...student,
        points,
        streak,
      };
    }).sort((a, b) => b.points - a.points);
  },

  updateProfilePhoto: async (userId: number, photoUrl: string): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from('users')
        .update({ photo_url: photoUrl })
        .eq('id', userId);
      if (!error) return true;
      console.warn('Supabase updateProfilePhoto error:', error);
    }

    const users = localDb.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].photo_url = photoUrl;
      localDb.saveUsers(users);
      return true;
    }
    return false;
  },

  changePassword: async (userId: number, newPassword: string): Promise<boolean> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', userId);
      if (!error) return true;
      console.warn('Supabase changePassword error:', error);
    }

    const users = localDb.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].password = newPassword;
      localDb.saveUsers(users);
      return true;
    }
    return false;
  },

  syncToSupabase: async (): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, message: 'Supabase belum terkonfigurasi.' };

    try {
      // 1. Sync Users
      const { data: remoteUsers } = await supabase.from('users').select('id');
      if (remoteUsers && remoteUsers.length === 0) {
        const localUsers = localDb.getUsers();
        if (localUsers.length > 0) {
          const { error } = await supabase.from('users').insert(
            localUsers.map(u => ({
              id: u.id,
              name: u.name,
              nipd: u.nipd,
              password: u.password || '123',
              role: u.role,
              photo_url: u.photo_url || null
            }))
          );
          if (error) console.error('Error syncing users:', error);
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
              user_id: s.user_id,
              is_pj: s.is_pj
            }))
          );
          if (error) console.error('Error syncing schedules:', error);
        }
      }

      // 3. Sync Reports
      const { data: remoteReports } = await supabase.from('reports').select('id');
      if (remoteReports && remoteReports.length === 0) {
        const localReports = localDb.getReports();
        if (localReports.length > 0) {
          const { error } = await supabase.from('reports').insert(
            localReports.map(r => ({
              id: r.id,
              date: r.date,
              reporter_id: r.reporter_id,
              image_path: r.image_path,
              status: r.status,
              created_at: r.created_at
            }))
          );
          if (error) console.error('Error syncing reports:', error);
        }
      }

      // 4. Sync Details
      const { data: remoteDetails } = await supabase.from('report_details').select('id');
      if (remoteDetails && remoteDetails.length === 0) {
        const localDetails = localDb.getReportDetails();
        if (localDetails.length > 0) {
          const { error } = await supabase.from('report_details').insert(
            localDetails.map(d => ({
              id: d.id,
              report_id: d.report_id,
              student_id: d.student_id,
              is_present: d.is_present
            }))
          );
          if (error) console.error('Error syncing report details:', error);
        }
      }

      return { success: true, message: 'Sinkronisasi berhasil! Semua data lokal telah dipindahkan ke Supabase Cloud.' };
    } catch (e: any) {
      return { success: false, message: 'Gagal melakukan sinkronisasi: ' + e.message };
    }
  }
};

export const SUPABASE_SQL_SCHEMA = `-- COPY DAN PASTE SCRIPT INI DI SQL EDITOR SUPABASE ANDA:

-- 1. Buat Tabel Siswa/Guru (Users)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    nipd TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL DEFAULT '123',
    role TEXT NOT NULL DEFAULT 'siswa',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete users" ON public.users FOR DELETE USING (true);

-- 2. Buat Tabel Jadwal Piket (Schedules)
CREATE TABLE IF NOT EXISTS public.schedules (
    id SERIAL PRIMARY KEY,
    day TEXT NOT NULL, -- 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_pj BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert schedules" ON public.schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update schedules" ON public.schedules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete schedules" ON public.schedules FOR DELETE USING (true);

-- 3. Buat Tabel Laporan Piket (Reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    reporter_id INTEGER REFERENCES public.users(id) ON DELETE SET NULL,
    image_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update reports" ON public.reports FOR UPDATE USING (true);

-- 4. Buat Tabel Rincian Kehadiran Laporan (Report Details)
CREATE TABLE IF NOT EXISTS public.report_details (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES public.reports(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    is_present INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Policies
ALTER TABLE public.report_details ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read details" ON public.report_details FOR SELECT USING (true);
CREATE POLICY "Allow public insert details" ON public.report_details FOR INSERT WITH CHECK (true);
`;
