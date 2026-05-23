'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Sparkles, AlertCircle, Camera, Check, Plus, ClipboardList, ShieldAlert, Award, FileSpreadsheet, CheckSquare, Play, X, User as UserIcon, Film, AlertTriangle } from 'lucide-react';
import { db, User, Schedule, Report, ReportDetail } from '../lib/db';
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

export default function Dashboard({ currentUser, students, schedules, logs, onActionComplete, setCurrentTab }: DashboardProps) {
  const [currentDay, setCurrentDay] = useState('');
  const [currentDateString, setCurrentDateString] = useState('');
  const [liveTime, setLiveTime] = useState('');
  
  // Roster states
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([]);
  const [todayPj, setTodayPj] = useState<Schedule | null>(null);
  const [isWeekend, setIsWeekend] = useState(false);
  const [todayCompleted, setTodayCompleted] = useState(false);

  // Active student logs view
  const [activeTab, setActiveTab] = useState<'roster' | 'history'>('roster');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Form State (Lapor Piket)
  const [reportingOpen, setReportingOpen] = useState(false);
  const [attendanceStatuses, setAttendanceStatuses] = useState<{ [userId: number]: boolean }>({});
  const [notes, setNotes] = useState('');
  
  // 3 Photo uploads & 1 Video upload
  const [photos, setPhotos] = useState<(string | null)[]>([null, null, null]);
  const [video, setVideo] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Time & Weekend effects
  useEffect(() => {
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const updateTime = () => {
      const d = new Date();
      const dayIndex = d.getDay();
      setIsWeekend(dayIndex === 0 || dayIndex === 6); // Sat & Sun check
      
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
  useEffect(() => {
    if (!currentDay || isWeekend) return;

    // Filter today's duty schedules
    const filteredToday = schedules.filter((s) => s.day === currentDay);
    setTodaySchedule(filteredToday);

    // Find if a PJ exists today
    const pj = filteredToday.find((s) => s.is_pj);
    setTodayPj(pj || null);

    // Pre-populate teammate presence checkboxes
    const initialAttendance: { [userId: number]: boolean } = {};
    filteredToday.forEach((sch) => {
      initialAttendance[sch.user_id] = true; // Present by default
    });
    setAttendanceStatuses(initialAttendance);

    // Check if report has already been completed today
    const checkReportExists = () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const hasTodayReport = logs.some(
        (l) => l.date === todayStr && (l.status === 'verified' || l.status === 'pending')
      );
      setTodayCompleted(hasTodayReport);
    };

    checkReportExists();
  }, [currentDay, schedules, logs, isWeekend]);

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
      if (file.size > 15 * 1024 * 1024) { // Max 15MB for video
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

  // Presets simulation files
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

  // Submit report to Supabase / LocalStorage
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Check if at least 3 photos are uploaded
    const uploadedPhotos = photos.filter(p => p !== null) as string[];
    if (uploadedPhotos.length < 3) {
      alert('Anda wajib melampirkan minimal 3 foto bukti kebersihan!');
      return;
    }

    setSubmitting(true);

    try {
      // Serialize all photos and optional video into a single JSON string
      const mediaPayload = {
        photos: uploadedPhotos,
        video: video,
      };
      const serializedImagePath = JSON.stringify(mediaPayload);

      // Structure attendance array
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

      // Blasts Confetti!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Clear states
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

  // Parse photos and videos from image_path JSON
  const parseMedia = (imagePath: string): { photos: string[]; video: string | null } => {
    try {
      if (imagePath.startsWith('{')) {
        const parsed = JSON.parse(imagePath);
        return {
          photos: parsed.photos || [],
          video: parsed.video || null,
        };
      }
    } catch (e) {
      console.warn('Failed to parse media:', e);
    }
    
    // Fallback: check if it's a video file or preset image
    const isVideo = imagePath.endsWith('.mp4') || imagePath.startsWith('data:video');
    return {
      photos: isVideo ? [] : [imagePath],
      video: isVideo ? imagePath : null,
    };
  };

  // Dynamic lock check logic
  // Only the Penanggung Jawab (PJ) for TODAY is allowed to submit a report!
  const isUserPjToday = currentUser && todayPj ? todayPj.user_id === currentUser.id : false;

  // ==========================================
  // RENDER SATURDAY & SUNDAY HOLIDAY SCREEN
  // ==========================================
  if (isWeekend) {
    return (
      <div className="mx-auto max-w-4xl p-4 font-sans md:p-6 text-center animate-fade-in">
        <div className="border-4 border-black bg-yellow-300 p-8 shadow-[8px_8px_0px_0px_#000000] rounded-sm max-w-2xl mx-auto my-12">
          <span className="text-6xl animate-bounce inline-block mb-4">🏖️</span>
          <h1 className="text-4xl font-black uppercase text-black leading-none mb-4">
            AKHIR PEKAN LIBUR!
          </h1>
          <p className="text-sm font-bold text-zinc-800 uppercase leading-relaxed max-w-md mx-auto">
            Hari {currentDay} sekolah libur! Tidak ada jadwal piket kelas untuk **XI-J SMA Yadika 11**. Selamat beristirahat dan sampai jumpa di hari Senin!
          </p>
          <div className="mt-8 border-t-2 border-black pt-4 text-xs font-black uppercase text-zinc-900">
            {currentDay}, {currentDateString} • KAMPUS YADIKA 11
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-4 font-sans md:p-6 animate-fade-in">
      
      {/* Typewriter Hello greetings beside Profile photo */}
      <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Rounded Profile Photo with premium Neubrutalism frame */}
          <div 
            onClick={() => setCurrentTab('settings')}
            className="h-16 w-16 rounded-full border-4 border-black overflow-hidden shadow-[2px_2px_0px_0px_#000000] hover:scale-105 transition-transform shrink-0 bg-yellow-100 flex items-center justify-center cursor-pointer"
          >
            {currentUser && currentUser.photo_url ? (
              <img src={currentUser.photo_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-8 w-8 stroke-[2px] text-zinc-900" />
            )}
          </div>

          <div className="text-left">
            {currentUser ? (
              <div className="text-2xl font-black text-black leading-none flex items-center gap-1">
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

        <div className="shrink-0 flex items-center gap-2 border-2 border-black bg-yellow-300 px-3 py-2 shadow-[2px_2px_0px_0px_#000000] text-xs font-black uppercase">
          <Clock className="h-4 w-4 stroke-[3px]" />
          <span>{liveTime || '00:00'} WIB</span>
        </div>
      </div>

      {/* Tab Switcher */}
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
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-black uppercase border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'history' ? 'bg-pink-300 translate-x-0.5 shadow-none' : 'bg-white'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4 stroke-[3px]" />
          RIWAYAT LAPORAN PIKET
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

            {todaySchedule.length === 0 ? (
              <div className="border-4 border-dashed border-zinc-200 py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-zinc-300 stroke-[2px] mb-2" />
                <p className="text-base font-black text-zinc-400 uppercase">Roster hari ini kosong!</p>
                <p className="text-xs font-bold text-zinc-400 uppercase">Silakan hubungi guru Anda untuk menyetel roster kelas.</p>
              </div>
            ) : (
              <div>
                {/* PJ Card Indicator */}
                {todayPj ? (
                  <div className="mb-6 border-2 border-black bg-yellow-100 p-3 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600 stroke-[2.5px]" />
                    <span>Penanggung Jawab (PJ) Hari Ini: **{todayPj.student?.name}**</span>
                  </div>
                ) : (
                  <div className="mb-6 border-2 border-black bg-red-100 p-3 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase flex items-center gap-2 text-red-700">
                    <ShieldAlert className="h-5 w-5 stroke-[2.5px]" />
                    <span>Belum ada Penanggung Jawab (PJ) yang ditunjuk oleh guru!</span>
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
                    // LOCK LOGIC: ONLY THE PJ FOR TODAY CAN REPORT!
                    currentUser ? (
                      isUserPjToday ? (
                        <button
                          onClick={() => setReportingOpen(true)}
                          className="w-full border-2 border-black bg-pink-400 py-3.5 font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
                        >
                          BUAT LAPORAN ABSENSI PIKET 📸
                        </button>
                      ) : (
                        <div className="border-2 border-black bg-yellow-100 p-3 text-xs font-bold text-yellow-800 flex items-start gap-2.5 shadow-[2px_2px_0px_0px_#000000]">
                          <AlertTriangle className="h-5 w-5 stroke-[2.5px] text-yellow-700 shrink-0 mt-0.5" />
                          <span>
                            Akses Dikunci! Hanya Penanggung Jawab (PJ) piket hari **{currentDay.toUpperCase()}** (**{todayPj?.student?.name || 'Belum ditunjuk'}**) yang berhak mengirimkan laporan piket hari ini.
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
                <span>Hanya **PJ Regu** berjalan yang diizinkan memicu pelaporan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold shrink-0">2.</span>
                <span>Wajib melampirkan **minimal 3 foto** kebersihan kelas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold shrink-0">3.</span>
                <span>Dapat melampirkan **1 video opsional** (maksimal 15MB).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold shrink-0">4.</span>
                <span>Skor Poin dihitung dinamis setelah diverifikasi guru!</span>
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* ==========================================
         TAB 2: ATTENDANCE HISTORY LOGS
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
            
            {/* Modal Title */}
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
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-red-400 text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              
              {/* Teammates attendance checklist */}
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
                        className={`flex w-full items-center gap-2 p-1.5 border-2 text-left font-bold text-xs uppercase transition-all ${
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

              {/* Text Notes */}
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

              {/* 3 Photos uploads (Required, min 3) */}
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

                {/* Preset Trigger Simulator */}
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={applyPresetPhotos}
                    className="border border-black bg-yellow-100 hover:bg-yellow-200 px-3 py-1 text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_#000000]"
                  >
                    GUNAKAN 3 FOTO SIMULASI CEPAT ⚡
                  </button>
                </div>
              </div>

              {/* Optional 1 Video Upload */}
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

              {/* Submit triggers */}
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
            
            {/* Header */}
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
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-red-400 text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold"
              >
                ✕
              </button>
            </div>

            {/* Media Gallery Display */}
            {(() => {
              const media = parseMedia(selectedReport.image_path);
              return (
                <div className="space-y-4">
                  {/* Photo Gallery Grid */}
                  {media.photos.length > 0 && (
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Foto Bukti Kebersihan:</span>
                      <div className={`grid gap-2.5 ${media.photos.length > 1 ? 'grid-cols-3' : 'grid-cols-1'}`}>
                        {media.photos.map((src, i) => (
                          <div key={i} className="border-2 border-black h-36 overflow-hidden bg-zinc-950 rounded shadow-[2px_2px_0px_0px_#000000]">
                            <img src={src} alt="Bukti Detail" className="object-cover h-full w-full max-h-36 max-w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Player Display */}
                  {media.video && (
                    <div className="mt-3">
                      <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Video Bukti Piket:</span>
                      <div className="border-2 border-black bg-zinc-900 rounded overflow-hidden shadow-[3px_3px_0px_0px_#000000] flex justify-center max-h-60">
                        <video controls className="w-full h-full max-h-56 max-w-md" src={media.video} />
                      </div>
                    </div>
                  )}

                  {/* Report details info */}
                  <div className="space-y-2 text-[10px] font-black uppercase text-zinc-900 mt-4">
                    <p>Reporter: <span className="text-cyan-600">{selectedReport.reporter_name}</span></p>
                    <p>Status: <span className="text-pink-600">{selectedReport.status}</span></p>
                    
                    {selectedReport.notes && (
                      <p className="normal-case bg-zinc-50 border border-zinc-200 p-2.5 text-zinc-500 italic mt-1 leading-relaxed">
                        &ldquo;{selectedReport.notes}&rdquo;
                      </p>
                    )}

                    {/* Attendance checklist list */}
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

    </div>
  );
}
