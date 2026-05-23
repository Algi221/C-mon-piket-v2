'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  Camera, 
  Check, 
  ClipboardList, 
  ShieldAlert, 
  Award, 
  FileSpreadsheet, 
  CheckSquare, 
  Play, 
  X, 
  User as UserIcon, 
  Film, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { db, User, Schedule, Report } from '../lib/db';
import TextType from './TextType';
import confetti from 'canvas-confetti';

interface DashboardProps {
  currentUser: User | null;
  students: User[];
  schedules: Schedule[];
  logs: Report[];
  onActionComplete: () => void;
  setCurrentTab: (tab: string) => void;
}

export default function Dashboard({ 
  currentUser, 
  students, 
  schedules, 
  logs, 
  onActionComplete, 
  setCurrentTab 
}: DashboardProps) {
  const [currentDay, setCurrentDay] = useState('');
  const [currentDateString, setCurrentDateString] = useState('');
  const [liveTime, setLiveTime] = useState('');
  
  // Roster states
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([]);
  const [todayPjs, setTodayPjs] = useState<Schedule[]>([]);
  const [isWeekend, setIsWeekend] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [bypassLocks, setBypassLocks] = useState(false);

  // Active student logs view (roster = Check-in & Roster list, calendar = Calendar log view, history = List view)
  const [activeTab, setActiveTab] = useState<'roster' | 'calendar' | 'history'>('roster');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Calendar States for Students
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // May
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [selectedCalendarReport, setSelectedCalendarReport] = useState<Report | null>(null);

  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Form State (Lapor Piket)
  const [reportingOpen, setReportingOpen] = useState(false);
  const [attendanceStatuses, setAttendanceStatuses] = useState<{ [userId: number]: boolean }>({});
  const [notes, setNotes] = useState('');
  
  // 3 Photo uploads & 1 Video upload
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [video, setVideo] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [todayRejectionReason, setTodayRejectionReason] = useState<string | null>(null);

  // Time effect
  useEffect(() => {
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const updateTime = () => {
      const d = new Date();
      const dayIndex = d.getDay();
      setIsWeekend(dayIndex === 0 || dayIndex === 6);
      
      const dayName = daysIndo[dayIndex];
      setCurrentDay(dayName);
      
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
      setCurrentDateString(d.toLocaleDateString('id-ID', options));
      
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      setLiveTime(`${hh}:${mm}:${ss}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync today's rosters and PJ checks
  const showWeekendScreen = isWeekend && !bypassLocks;

  useEffect(() => {
    if (!currentDay) return;

    if (showWeekendScreen) {
      setTodaySchedule([]);
      setTodayPjs([]);
      return;
    }

    // Filter today's duty schedules (bypass locks on weekends will mock Monday's schedules)
    const activeDay = (isWeekend && bypassLocks) ? 'Senin' : currentDay;
    const filteredToday = schedules.filter((s) => s.day === activeDay);
    setTodaySchedule(filteredToday);

    // Find if PJs exist today (supports multiple PJs)
    const pjs = filteredToday.filter((s) => s.is_pj);
    setTodayPjs(pjs);

    // Pre-populate teammate presence checkboxes
    const initialAttendance: { [userId: number]: boolean } = {};
    filteredToday.forEach((sch) => {
      initialAttendance[sch.user_id] = true;
    });
    setAttendanceStatuses(initialAttendance);

    // Check if report has already been completed today
    const checkReportExists = () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayReport = logs.find(
        (l) => l.date === todayStr
      );
      
      const hasTodayReport = todayReport && (todayReport.status === 'verified' || todayReport.status === 'pending');
      setTodayCompleted(!!hasTodayReport);

      if (todayReport && todayReport.status === 'rejected') {
        const media = parseMedia(todayReport.image_path) as any;
        setTodayRejectionReason(media.rejectionReason || 'Alasan penolakan tidak ditentukan oleh guru.');
      } else {
        setTodayRejectionReason(null);
      }
    };

    checkReportExists();
  }, [currentDay, schedules, logs, showWeekendScreen, bypassLocks]);

  // Handle Photo input (Base64 file reader)
  const handlePhotoChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Foto terlalu besar! Batas ukuran file adalah 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotos(prev => {
          const next = [...prev];
          next[idx] = base64;
          return next;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Video Input
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File video terlalu besar! Batas ukuran video adalah 15MB.');
        return;
      }
      setVideoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setVideo(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPresetPhotos = () => {
    setPhotos([
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1603712726208-41d72402f127?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=400&q=80',
    ]);
  };

  const toggleTeammate = (userId: number) => {
    setAttendanceStatuses(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const uploadedPhotos = photos.filter(p => p !== null) as string[];
    if (uploadedPhotos.length < 3) {
      alert('Anda wajib melampirkan minimal 3 foto bukti kebersihan!');
      return;
    }

    setSubmitting(true);

    try {
      const mediaPayload = {
        photos: uploadedPhotos,
        video: video,
      };
      const serializedImagePath = JSON.stringify(mediaPayload);

      const attendanceList = todaySchedule.map(sch => ({
        studentId: sch.user_id,
        isPresent: attendanceStatuses[sch.user_id] || false,
      }));

      await db.createReport(
        currentUser.id,
        serializedImagePath,
        attendanceList,
        notes
      );

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });

      setReportingOpen(false);
      setNotes('');
      setPhotos([null, null, null]);
      setVideo(null);
      setVideoName(null);
      setTodayCompleted(true);

      onActionComplete();
    } catch (e) {
      console.error(e);
      alert('Gagal mengirimkan laporan.');
    } finally {
      setSubmitting(false);
    }
  };

  const parseMedia = (imagePath: string): { photos: string[]; video: string | null; rejectionReason?: string } => {
    try {
      if (imagePath.startsWith('{')) {
        const parsed = JSON.parse(imagePath);
        return {
          photos: (parsed.photos || []).slice(0, 3), // Max 3 photos
          video: parsed.video || null,
          rejectionReason: parsed.rejectionReason || undefined,
        };
      }
    } catch (e) {
      console.warn('Failed parse:', e);
    }
    
    const isVideo = imagePath.endsWith('.mp4') || imagePath.startsWith('data:video');
    return {
      photos: isVideo ? [] : [imagePath],
      video: isVideo ? imagePath : null,
    };
  };

  // Calendar navigations
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedCalendarDate(null);
    setSelectedCalendarReport(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedCalendarDate(null);
    setSelectedCalendarReport(null);
  };

  const calendarCells = useMemo(() => {
    const cells = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const padCells = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let i = 0; i < padCells; i++) {
      cells.push({ day: null, dateStr: null });
    }
    for (let day = 1; day <= numDays; day++) {
      const dd = String(day).padStart(2, '0');
      const mm = String(currentMonth + 1).padStart(2, '0');
      const dateStr = `${currentYear}-${mm}-${dd}`;
      cells.push({ day, dateStr });
    }
    return cells;
  }, [currentYear, currentMonth]);

  const handleCellClick = (dateStr: string | null) => {
    if (!dateStr) return;
    setSelectedCalendarDate(dateStr);
    const reportOnDate = logs.find(l => l.date === dateStr);
    setSelectedCalendarReport(reportOnDate || null);
  };

  // Dynamic lock check logic (Any today PJ, bypassed in test mode)
  const isUserPjToday = bypassLocks || (currentUser && todayPjs.length > 0 ? todayPjs.some(pj => pj.user_id === currentUser.id) : false);

  return (
    <div className="mx-auto max-w-6xl p-4 font-sans md:p-6 animate-fade-in">
      
      {/* Typewriter Hello greetings beside Profile photo */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setCurrentTab('settings')}
            className="h-32 w-32 rounded-full border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_#000000] hover:scale-105 transition-transform shrink-0 bg-yellow-100 flex items-center justify-center cursor-pointer"
          >
            {currentUser && currentUser.photo_url ? (
              <img src={currentUser.photo_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-16 w-16 stroke-[2px] text-zinc-900" />
            )}
          </div>

          <div className="text-left">
            {currentUser ? (
              <div className="text-2xl font-black text-black leading-none flex items-center gap-1.5">
                <span>Halo,</span>
                <TextType 
                  text={currentUser.name} 
                  showCursor={true} 
                  typingSpeed={80} 
                  loop={false}
                  className="text-pink-500 font-black truncate max-w-sm sm:max-w-md"
                />
              </div>
            ) : (
              <h2 className="text-2xl font-black text-black leading-none uppercase">Selamat Datang!</h2>
            )}
            <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">
              Hari piket Anda: {currentDay}, {currentDateString} • Kelas XI-J SMA Yadika 11
            </p>
          </div>
        </div>

        {/* Live clock and Test Bypass switch button */}
        <div className="flex items-center gap-2.5 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => setBypassLocks(!bypassLocks)}
            className={`border-2 border-black px-2.5 py-1.5 text-[9px] font-black uppercase shadow-[2.5px_2.5px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
              bypassLocks ? 'bg-pink-300 text-black border-black' : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-black hover:text-black'
            }`}
            title="Aktivasi Mode Uji Coba: Bypass PJ & Hari Libur untuk testing"
          >
            {bypassLocks ? '🧪 TEST MODE: BYPASS ON' : '🧪 TEST MODE: OFF'}
          </button>
          <div className="shrink-0 flex items-center gap-2 border-2 border-black bg-yellow-300 px-3 py-2 shadow-[2px_2px_0px_0px_#000000] text-xs font-black uppercase">
            <Clock className="h-4 w-4 stroke-[3px]" />
            <span>{liveTime || '00:00'} WIB</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher (Three beautiful tabs) */}
      <div className="border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_#000000] mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`flex-1 py-3 text-xs font-black uppercase border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'roster' ? 'bg-cyan-300 translate-x-0.5 shadow-none' : 'bg-white'
          }`}
        >
          <ClipboardList className="h-4 w-4 stroke-[3px]" />
          BERANDA & PETUGAS HARI INI
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-3 text-xs font-black uppercase border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'calendar' ? 'bg-green-300 translate-x-0.5 shadow-none' : 'bg-white'
          }`}
        >
          <CalendarIcon className="h-4 w-4 stroke-[3px]" />
          RIWAYAT KALENDER
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-black uppercase border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'history' ? 'bg-pink-300 translate-x-0.5 shadow-none' : 'bg-white'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4 stroke-[3px]" />
          DAFTAR LAPORAN PIKET
        </button>
      </div>

      {/* ==========================================
         TAB 1: TODAY'S DUTY ROSTER & CHECK-IN FORM
         ========================================== */}
      {activeTab === 'roster' && (
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* Today's roster list */}
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] md:col-span-2">
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-3">
              <CalendarIcon className="h-6 w-6 stroke-[3px] text-pink-500" />
              Petugas Piket Hari Ini ({currentDay})
            </h2>

            {showWeekendScreen ? (
              /* Inner Weekend Screen (At the bottom, greeting remains visible) */
              <div className="border-4 border-black bg-yellow-300 p-8 shadow-[4px_4px_0px_0px_#000000] rounded-sm text-center">
                <span className="text-5xl animate-bounce inline-block mb-3">🏖️</span>
                <h3 className="text-2xl font-black uppercase text-black mb-2">AKHIR PEKAN LIBUR!</h3>
                <p className="text-xs font-bold text-zinc-800 uppercase leading-relaxed max-w-sm mx-auto">
                  Hari {currentDay} sekolah libur! Tidak ada jadwal piket kelas untuk **XI-J SMA Yadika 11**. Selamat beristirahat dan sampai jumpa di hari Senin!
                </p>
                <div className="mt-6 pt-3 border-t-2 border-black text-[9px] font-black uppercase text-zinc-900">
                  {currentDay}, {currentDateString} • KAMPUS YADIKA 11
                </div>
              </div>
            ) : todaySchedule.length === 0 ? (
              <div className="border-4 border-dashed border-zinc-200 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-zinc-300 stroke-[2px] mb-2" />
                <p className="text-base font-black text-zinc-400 uppercase">Roster hari ini kosong!</p>
                <p className="text-xs font-bold text-zinc-400 uppercase">Silakan hubungi guru Anda untuk menyetel roster kelas.</p>
              </div>
            ) : (
              <div>
                {/* REJECTION WARNING BANNER */}
                {todayRejectionReason && (
                  <div className="mb-6 border-4 border-red-500 bg-red-100 p-5 shadow-[4px_4px_0px_0px_#ef4444] text-red-950 rounded-sm">
                    <div className="flex items-center gap-2 mb-2 border-b-2 border-red-400 pb-2">
                      <AlertTriangle className="h-6 w-6 stroke-[3px] text-red-600 animate-bounce shrink-0" />
                      <h3 className="text-lg font-black uppercase tracking-tight">LAPORAN PIKET HARI INI DITOLAK GURU! ✕</h3>
                    </div>
                    <p className="text-xs font-bold uppercase block">Alasan Penolakan oleh Guru:</p>
                    <div className="my-2 border-2 border-red-400 bg-white p-3 text-xs font-black italic shadow-[2px_2px_0px_0px_#ef4444] rounded-sm text-red-700">
                      "{todayRejectionReason}"
                    </div>
                    <p className="text-[10px] font-black uppercase text-red-800 leading-tight">
                      Silakan bersihkan kembali area yang ditandai oleh Guru, kumpulkan regu piket, lalu klik tombol **"KIRIM ULANG BUKTI PIKET"** di bawah untuk mengirim ulang laporan!
                    </p>
                  </div>
                )}

                {/* PJ Card Indicator */}
                {todayPjs.length > 0 ? (
                  <div className="mb-6 border-2 border-black bg-yellow-100 p-3 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600 stroke-[2.5px]" />
                    <span>Penanggung Jawab (PJ) Hari Ini: **{todayPjs.map(pj => pj.student?.name).join(', ')}**</span>
                  </div>
                ) : (
                  <div className="mb-6 border-2 border-black bg-red-100 p-3 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase flex items-center gap-2 text-red-700">
                    <ShieldAlert className="h-5 w-5 stroke-[2.5px]" />
                    <span>Belum ada Penanggung Jawab (PJ) yang ditunjuk oleh guru! (Minimal 2)</span>
                  </div>
                )}

                {/* Duty Teammates Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {todaySchedule.map((item) => {
                    const s = item.student;
                    if (!s) return null;
                    return (
                      <div
                        key={item.id}
                        className={`border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000000] transition-all flex flex-col justify-between ${
                          item.is_pj ? 'bg-yellow-50' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="border border-black bg-zinc-950 px-2 py-0.5 text-[8px] font-black text-white uppercase">
                            NO: {s.nipd}
                          </span>
                          {item.is_pj && (
                            <span className="border border-black bg-yellow-300 px-2 py-0.5 text-[8px] font-black text-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000]">
                              PJ REGU 👑
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-black text-black leading-tight uppercase truncate">{s.name}</h3>
                      </div>
                    );
                  })}
                </div>

                {/* STRICT REPORTING CONTROL BOARD */}
                <div className="mt-8 border-4 border-black p-5 bg-cyan-50 shadow-[4px_4px_0px_0px_#000000] space-y-4">
                  <h3 className="text-xl font-black uppercase flex items-center gap-2 leading-none border-b-2 border-black pb-2">
                    <CheckSquare className="h-5 w-5 text-cyan-600 stroke-[3px]" />
                    Kirim Laporan Piket
                  </h3>

                  {todayCompleted ? (
                    <div className="border-2 border-green-600 bg-green-100 p-3 text-center text-xs font-black uppercase text-green-700 flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000000]">
                      <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
                      Laporan Piket Regu Anda Sudah Terkirim ke Guru!
                    </div>
                  ) : (
                    // LOCK LOGIC: ONLY TODAY'S PJS CAN REPORT (Bypassed in Test Mode)
                    currentUser ? (
                      isUserPjToday ? (
                        <button
                          onClick={() => setReportingOpen(true)}
                          className={`w-full border-2 border-black py-3.5 font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer ${
                            todayRejectionReason ? 'bg-red-400 text-white hover:bg-red-300' : 'bg-pink-400 text-black hover:bg-pink-300'
                          }`}
                        >
                          {todayRejectionReason ? 'KIRIM ULANG BUKTI PIKET 📸' : 'BUAT LAPORAN ABSENSI PIKET 📸'}
                        </button>
                      ) : (
                        <div className="border-2 border-black bg-yellow-100 p-3 text-xs font-bold text-yellow-800 flex items-start gap-2.5 shadow-[2px_2px_0px_0px_#000000]">
                          <AlertTriangle className="h-5 w-5 stroke-[2.5px] text-yellow-700 shrink-0 mt-0.5" />
                          <span>
                            Akses Dikunci! Hanya Penanggung Jawab (PJ) piket hari **{currentDay.toUpperCase()}** (**{todayPjs.map(pj => pj.student?.name).join(', ') || 'Belum ditunjuk'}**) yang berhak mengirimkan laporan piket hari ini.
                          </span>
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => setCurrentTab('welcome')}
                        className="w-full border-2 border-black bg-yellow-300 py-3.5 font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 cursor-pointer"
                      >
                        MASUK UNTUK VERIFIKASI SEBAGAI PJ 🔒
                      </button>
                    )
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Rules/Guides Sidepanel */}
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
              <ClipboardList className="h-5 w-5 text-yellow-500 stroke-[3px]" />
              Panduan Laporan
            </h2>
            <ul className="space-y-3 font-bold text-zinc-700 text-[10px] uppercase leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold shrink-0">1.</span>
                <span>Hanya **PJ Regu** piket harian yang diizinkan melakukan pelaporan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold shrink-0">2.</span>
                <span>Wajib melampirkan **minimal 3 foto** kebersihan kelas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold shrink-0">3.</span>
                <span>Dapat melampirkan **1 video bukti opsional** (maksimal 15MB).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold shrink-0">4.</span>
                <span>Skor Poin regu piket dihitung otomatis setelah diverifikasi guru!</span>
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* ==========================================
         TAB 2: INTERACTIVE GREEN CALENDAR FOR STUDENTS
         ========================================== */}
      {activeTab === 'calendar' && (
        <div className="grid gap-6 lg:grid-cols-5">
          
          {/* Read-Only Calendar */}
          <div className="lg:col-span-3 border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000]">
            <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-emerald-500 stroke-[3px]" />
                Kalender Riwayat Piket Kelas
              </h2>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={prevMonth}
                  className="h-9 w-9 border-2 border-black bg-white hover:bg-zinc-100 flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5 stroke-[3px]" />
                </button>
                <span className="border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000]">
                  {monthsIndo[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="h-9 w-9 border-2 border-black bg-white hover:bg-zinc-100 flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5 stroke-[3px]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center font-black text-[11px] sm:text-xs uppercase border-b border-black pb-2 mb-3 bg-zinc-900 text-white p-1.5">
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div className="text-red-400">Sab</div>
              <div className="text-red-400">Min</div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                if (!cell.day) {
                  return <div key={idx} className="h-16 bg-zinc-50 border border-transparent" />;
                }

                const reportOnDate = logs.find(l => l.date === cell.dateStr);
                const hasReport = !!reportOnDate;
                const isVerified = reportOnDate?.status === 'verified';
                const isSelected = selectedCalendarDate === cell.dateStr;

                let cellBg = 'bg-white hover:bg-zinc-100';
                if (hasReport) {
                  cellBg = isVerified 
                    ? 'bg-green-300 hover:bg-green-200 border-green-700 text-black shadow-[1px_1px_0px_0px_#16a34a]' 
                    : 'bg-yellow-300 hover:bg-yellow-200 border-yellow-700 text-black shadow-[1px_1px_0px_0px_#ca8a04]';
                }

                if (isSelected) {
                  cellBg += ' scale-105 border-4 border-black z-10';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(cell.dateStr)}
                    className={`h-16 border-2 border-black flex flex-col items-center justify-between p-2 font-black transition-all cursor-pointer text-sm sm:text-base ${cellBg}`}
                  >
                    <span>{cell.day}</span>
                    {hasReport && <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clicked Day Report Details */}
          <div className="lg:col-span-2 border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000]">
            <h2 className="text-lg font-black uppercase mb-4 border-b-2 border-black pb-1.5 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500 stroke-[3px]" />
              Detail Riwayat Hari
            </h2>

            {!selectedCalendarDate ? (
              <div className="py-12 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200">
                <HelpCircle className="mx-auto h-8 w-8 stroke-[2px] mb-2 opacity-50" />
                <p className="text-[10px] uppercase">PILIH TANGGAL DI KALENDER</p>
                <p className="text-[8px] text-zinc-400 mt-1 uppercase">HARI HIJAU MEMILIKI LAPORAN PIKET KELAS</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 bg-zinc-50 border border-black p-3.5 text-xs font-black uppercase flex items-center justify-between">
                  <span>TANGGAL: {selectedCalendarDate}</span>
                  <span className="bg-yellow-300 border border-black px-2 py-0.5">
                    {selectedCalendarReport ? (selectedCalendarReport.status === 'verified' ? 'DISETUJUI' : 'PENDING') : 'KOSONG'}
                  </span>
                </div>

                {!selectedCalendarReport ? (
                  <div className="py-12 text-center text-zinc-400 font-bold border border-dashed border-zinc-200">
                    <AlertTriangle className="mx-auto h-9 w-9 stroke-[2px] mb-2 text-zinc-300" />
                    <p className="text-xs uppercase">Tidak ada laporan piket</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-1 text-[11px] sm:text-xs font-black uppercase text-zinc-800">
                      <p>Dilaporkan Oleh: <span className="text-cyan-600">{selectedCalendarReport.reporter_name}</span></p>
                      {selectedCalendarReport.notes && (
                        <p className="normal-case bg-zinc-50 border border-zinc-200 p-3 text-xs font-bold text-zinc-600 italic mt-1.5 leading-relaxed">
                          &ldquo;{selectedCalendarReport.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Media display */}
                    <div>
                      <span className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase block mb-1.5">Bukti Kebersihan (Max 3 Foto):</span>
                      {(() => {
                        const media = parseMedia(selectedCalendarReport.image_path);
                        return (
                          <div className="space-y-2">
                            {media.photos.length > 0 && (
                              <div className="grid gap-2.5 grid-cols-3">
                                {media.photos.map((src, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => setZoomPhoto(src)}
                                    className="border border-black h-28 overflow-hidden bg-zinc-950 rounded shadow-[1px_1px_0px_0px_#000000] cursor-pointer hover:scale-105 transition-transform"
                                  >
                                    <img src={src} alt="Bukti Rinci" className="object-cover h-full w-full" />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {media.video && (
                              <div className="border border-black bg-zinc-900 rounded overflow-hidden max-h-48 flex items-center justify-center">
                                <video controls className="w-full h-full max-h-44" src={media.video} />
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Attendance present students */}
                    {selectedCalendarReport.details && (
                      <div>
                        <span className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase block mb-2">Presensi Anggota Piket:</span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                          {selectedCalendarReport.details.map((det) => (
                            <div
                              key={det.id}
                              className={`border p-1.5 text-[10px] font-black uppercase flex items-center justify-between ${
                                det.is_present === 1 ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-600 text-red-700'
                              }`}
                            >
                              <span>{det.student_name}</span>
                              <span>{det.is_present === 1 ? 'Hadir' : 'Absen'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==========================================
         TAB 3: ATTENDANCE HISTORY LIST CARD VIEW
         ========================================== */}
      {activeTab === 'history' && (
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-3">
            <FileSpreadsheet className="h-6 w-6 stroke-[3px] text-pink-500" />
            Riwayat Laporan Piket XI-J
          </h2>

          {logs.length === 0 ? (
            <p className="text-center font-bold text-zinc-400 text-xs uppercase py-12">
              Belum ada riwayat laporan piket yang dikirimkan.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {logs.map((log) => {
                const media = parseMedia(log.image_path);
                
                return (
                  <div
                    key={log.id}
                    className="border-2 border-black p-4 bg-zinc-50 shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000000] transition-all cursor-pointer"
                    onClick={() => setSelectedReport(log)}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex justify-between items-center text-[8px] font-black text-zinc-400 mb-2 uppercase">
                        <span>TANGGAL: {log.date}</span>
                        <span className={`border px-1.5 py-0.2 ${
                          log.status === 'verified' ? 'bg-green-100 border-green-700 text-green-800' : log.status === 'pending' ? 'bg-yellow-100 border-yellow-700 text-yellow-800' : 'bg-red-100 border-red-700 text-red-800'
                        }`}>
                          {log.status === 'verified' ? 'DISETUJUI' : log.status === 'pending' ? 'PENDING' : 'DITOLAK'}
                        </span>
                      </div>

                      {/* Photo Thumbnail */}
                      {media.photos.length > 0 && (
                        <div className="border border-black h-28 overflow-hidden bg-zinc-950 relative">
                          <img src={media.photos[0]} alt="Bukti Piket" className="object-cover w-full h-full" />
                          {media.photos.length > 1 && (
                            <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white border border-white text-[8px] font-black px-1.5 py-0.5">
                              +{media.photos.length - 1} FOTO
                            </span>
                          )}
                        </div>
                      )}

                      <h3 className="text-sm font-black text-black leading-tight uppercase truncate mt-3">
                        Oleh: {log.reporter_name}
                      </h3>
                      
                      {log.notes && (
                        <p className="text-[9px] font-bold text-zinc-500 italic truncate mt-1">
                          &ldquo;{log.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        className="w-full border border-black bg-white hover:bg-zinc-100 py-1.5 text-[9px] font-black uppercase text-black"
                      >
                        LIHAT DETAIL LAPORAN ➔
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
         FORM MODAL: SUBMIT LAPORAN (PJ ONLY)
         ========================================== */}
      {reportingOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-sans p-4 overflow-y-auto">
          <div className="w-full max-w-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000] relative animate-scale-in my-8">
            
            <div className="border-b-4 border-black pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className="border-2 border-black bg-yellow-300 px-2.5 py-0.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                  PRESENSI PJ
                </span>
                <h3 className="text-2xl font-black uppercase text-black mt-1 leading-none">
                  Kirim Laporan Piket Hari Ini
                </h3>
              </div>
              <button
                onClick={() => {
                  setReportingOpen(false);
                  setNotes('');
                  setPhotos([null, null, null]);
                  setVideo(null);
                  setVideoName(null);
                }}
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-red-400 text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1">
                  Absensi Kehadiran Anggota Regu Piket Hari Ini
                </label>
                <div className="border-4 border-black p-3 space-y-2 shadow-[2px_2px_0px_0px_#000000] bg-zinc-50 max-h-32 overflow-y-auto">
                  {todaySchedule.map((sch) => {
                    const isChecked = attendanceStatuses[sch.user_id] || false;
                    const s = sch.student;
                    if (!s) return null;

                    return (
                      <button
                        type="button"
                        key={sch.id}
                        onClick={() => toggleTeammate(sch.user_id)}
                        className={`flex w-full items-center gap-2 p-1.5 border-2 text-left font-bold text-xs uppercase transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-cyan-200 border-black shadow-[1px_1px_0px_0px_#000000]' 
                            : 'bg-white border-zinc-200 hover:border-black'
                        }`}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center border-2 border-black ${isChecked ? 'bg-black text-white' : 'bg-white'}`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[4px]" />}
                        </span>
                        <span className="truncate">{s.name} {sch.is_pj ? '(PJ)' : ''}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1">Laporan / Catatan Kebersihan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Menyapu beres, mengepel beres, membuang sampah, papan tulis dihapus."
                  rows={2}
                  className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1.5">
                  Lampiran 3 Foto Bukti Kebersihan (Wajib)*
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex flex-col gap-1 items-center">
                      <label className="w-full h-16 border-2 border-dashed border-black bg-zinc-50 hover:bg-zinc-100 flex flex-col items-center justify-center cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000000] relative">
                        {photos[idx] ? (
                          <img src={photos[idx] as string} alt="Upload Preview" className="h-full w-full object-cover" />
                        ) : (
                          <>
                            <Camera className="h-5 w-5 stroke-[2.5px] text-zinc-400" />
                            <span className="text-[8px] font-black text-zinc-400 mt-1">FOTO #{idx + 1}</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(idx, e)} />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={applyPresetPhotos}
                    className="border border-black bg-yellow-100 hover:bg-yellow-200 px-3 py-1 text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                  >
                    GUNAKAN 3 FOTO SIMULASI CEPAT ⚡
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-black mb-1">
                  Lampiran Video Bukti (Opsional - Maks 15MB)
                </label>
                <label className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-black bg-zinc-50 hover:bg-zinc-100 p-2 font-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_0px_#000000]">
                  <Film className="h-4.5 w-4.5 stroke-[2.5px] text-black" />
                  {videoName ? `VIDEO: ${videoName.substring(0, 15)}...` : 'PILIH VIDEO DARI GALERI'}
                  <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full border-4 border-black bg-emerald-400 p-3.5 font-black text-xs uppercase text-black transition-all shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
              >
                {submitting ? 'SEDANG MENGIRIM...' : 'KIRIM LAPORAN PIKET! 🚀'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ==========================================
         DETAIL VIEW MODAL: ATTENDANCE DETAILS LOGS
         ========================================== */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-sans p-4 overflow-y-auto">
          <div className="w-full max-w-2xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000] relative animate-scale-in my-8">
            
            <div className="border-b-4 border-black pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className="border-2 border-black bg-yellow-300 px-2 py-0.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                  RINCIAN LAPORAN KELAS
                </span>
                <h3 className="text-2xl font-black uppercase text-black mt-1 leading-none">
                  Laporan Tanggal {selectedReport.date}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-red-400 text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {(() => {
              const media = parseMedia(selectedReport.image_path);
              return (
                <div className="space-y-4">
                  {media.photos.length > 0 && (
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Foto Bukti Kebersihan:</span>
                      <div className={`grid gap-2.5 ${media.photos.length > 1 ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {media.photos.map((src, i) => (
                          <div 
                            key={i} 
                            onClick={() => setZoomPhoto(src)}
                            className="border-2 border-black h-36 overflow-hidden bg-zinc-950 rounded shadow-[2px_2px_0px_0px_#000000] cursor-pointer hover:scale-105 transition-transform"
                          >
                            <img src={src} alt="Bukti Detail" className="object-cover h-full w-full max-h-36 max-w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {media.video && (
                    <div className="mt-3">
                      <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Video Bukti Piket:</span>
                      <div className="border-2 border-black bg-zinc-900 rounded overflow-hidden shadow-[3px_3px_0px_0px_#000000] flex justify-center max-h-60">
                        <video controls className="w-full h-full max-h-56 max-w-md" src={media.video} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-[10px] font-black uppercase text-zinc-900 mt-4">
                    <p>Reporter: <span className="text-cyan-600">{selectedReport.reporter_name}</span></p>
                    <p>Status: <span className="text-pink-600">{selectedReport.status}</span></p>
                    
                    {selectedReport.notes && (
                      <p className="normal-case bg-zinc-50 border border-zinc-200 p-2.5 text-zinc-500 italic mt-1 leading-relaxed">
                        &ldquo;{selectedReport.notes}&rdquo;
                      </p>
                    )}

                    {selectedReport.details && (
                      <div className="pt-2 border-t-2 border-zinc-100">
                        <span className="text-[9px] font-black text-zinc-400 block mb-1.5">Presensi Anggota Piket:</span>
                        <div className="grid gap-2 grid-cols-2">
                          {selectedReport.details.map((det) => (
                            <div
                              key={det.id}
                              className={`border p-2 text-[9px] font-black uppercase flex items-center justify-between ${
                                det.is_present === 1 ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-600 text-red-700'
                              }`}
                            >
                              <span>{det.student_name}</span>
                              <span>{det.is_present === 1 ? 'Hadir' : 'Absen'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

      {/* Neubrutalist Zoom Modal for Calendar Details */}
      {zoomPhoto && (
        <div 
          onClick={() => setZoomPhoto(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 cursor-pointer"
        >
          <div className="relative border-4 border-black bg-white p-2 shadow-[8px_8px_0px_0px_#000000] max-w-3xl max-h-[85vh] overflow-hidden animate-scale-in">
            <img src={zoomPhoto} alt="Zoom Bukti Piket" className="max-w-full max-h-[75vh] object-contain" />
            <button
              onClick={() => setZoomPhoto(null)}
              className="absolute top-4 right-4 bg-red-400 text-black border-2 border-black px-3.5 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
