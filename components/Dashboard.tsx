'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Sparkles, AlertCircle, Camera, Check, Plus, ClipboardList, ShieldAlert, Award, FileSpreadsheet, CheckSquare, Trash2, Eye, Video, FileText } from 'lucide-react';
import { db, User, Schedule, Report } from '../lib/db';
import CalendarHistory from './CalendarHistory';
import ScheduleManager from './ScheduleManager';
import StudentManagement from './StudentManagement';
import SupabaseSetup from './SupabaseSetup';
import confetti from 'canvas-confetti';

interface DashboardProps {
  currentUser: User | null;
  students: User[];
  schedules: Schedule[];
  logs: Report[];
  onActionComplete: () => void;
  setCurrentTab: (tab: string) => void;
  supabaseConnected: boolean;
  onConnectionChange: () => void;
}

export default function Dashboard({ 
  currentUser, 
  students, 
  schedules, 
  logs, 
  onActionComplete, 
  setCurrentTab,
  supabaseConnected,
  onConnectionChange
}: DashboardProps) {
  
  const [currentDay, setCurrentDay] = useState('');
  const [currentDateString, setCurrentDateString] = useState('');
  const [liveTime, setLiveTime] = useState('');
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([]);
  const [todayCompleted, setTodayCompleted] = useState(false);

  // Guru Sub-navigation tabs
  const [activeSubTab, setActiveSubTab] = useState('verification'); // 'verification', 'calendar', 'roster', 'students', 'supabase'

  // Student Form Reporting State
  const [selectedStudentForForm, setSelectedStudentForForm] = useState<User | null>(null);
  const [attendanceStatuses, setAttendanceStatuses] = useState<{ [userId: number]: boolean }>({});
  const [notes, setNotes] = useState('');
  const [photoFiles, setPhotoFiles] = useState<string[]>([]); // holds multiple base64 images
  const [videoFile, setVideoFile] = useState<string | null>(null); // holds single base64 video
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // Preset Simulation Photos for rapid testing
  const presetImages = [
    { name: 'Sapu Bersih', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' },
    { name: 'Pel Wangi', url: 'https://images.unsplash.com/photo-1603712726208-41d72402f127?auto=format&fit=crop&w=400&q=80' },
    { name: 'Meja Rapi', url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=400&q=80' },
  ];

  // Time & Day clock
  useEffect(() => {
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const updateTime = () => {
      const d = new Date();
      const dayName = daysIndo[d.getDay()];
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

  // Fetch today's schedule and completed statuses
  useEffect(() => {
    if (!currentDay) return;

    // Filter schedules for today
    const filteredToday = schedules.filter((s) => s.day === currentDay);
    setTodaySchedule(filteredToday);

    // Initial check values for attendance
    const initialAttendance: { [userId: number]: boolean } = {};
    filteredToday.forEach((sch) => {
      initialAttendance[sch.user_id] = true; // Present by default
    });
    setAttendanceStatuses(initialAttendance);

    // Check if report already made today
    const todayStr = new Date().toISOString().split('T')[0];
    const hasTodayReport = logs.some(
      (l) => l.date === todayStr && (l.status === 'verified' || l.status === 'pending')
    );
    setTodayCompleted(hasTodayReport);
  }, [currentDay, schedules, logs]);

  // Handle Multi-Photo Picker (Base64 file reader)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoFiles((prev) => [...prev, reader.result as string].slice(0, 5)); // Limit up to 5 photos
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Preset Selection
  const addPresetPhoto = (url: string) => {
    if (photoFiles.includes(url)) return;
    setPhotoFiles((prev) => [...prev, url].slice(0, 5));
  };

  const removePhoto = (idx: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Handle Video Picker (Base64 file reader)
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert('File video terlalu besar! Maksimum ukuran video adalah 15MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
  };

  const toggleAttendance = (userId: number) => {
    setAttendanceStatuses((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Submit report to Supabase/LocalStorage
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (photoFiles.length < 3) {
      alert('Tolong unggah minimal 3 foto bukti kebersihan kelas!');
      return;
    }

    setSubmitting(true);

    try {
      // Structure attendance records mapping
      const attendanceList = todaySchedule.map((sch) => ({
        studentId: sch.user_id,
        isPresent: attendanceStatuses[sch.user_id] || false,
      }));

      // Serialize multiple photos and video into reports.image_path as JSON
      const serializedMedia = JSON.stringify({
        images: photoFiles,
        video: videoFile
      });

      await db.createReport(
        currentUser.id,
        serializedMedia,
        attendanceList,
        notes
      );

      // Trigger Confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Clear Form State
      setSelectedStudentForForm(null);
      setNotes('');
      setPhotoFiles([]);
      setVideoFile(null);
      setTodayCompleted(true);
      
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert('Gagal mengirimkan laporan piket ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  // Teacher Approval Actions
  const handleVerify = async (reportId: number, status: 'verified' | 'rejected') => {
    setVerifyingId(reportId);
    try {
      const success = await db.verifyReport(reportId, status);
      if (success) {
        if (status === 'verified') {
          confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#4ADE80', '#FACC15', '#22D3EE']
          });
        }
        onActionComplete();
      } else {
        alert('Gagal memperbarui status laporan.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifyingId(null);
    }
  };

  // PJ Locking verification
  const todayPJ = todaySchedule.find(sch => sch.is_pj);
  const isUserPJToday = currentUser && todayPJ ? todayPJ.user_id === currentUser.id : false;

  // Pending reports for Teacher
  const pendingReports = logs.filter(l => l.status === 'pending');

  // Parse custom serialized media paths
  const parseReportMedia = (imagePath: string): { images: string[]; video: string | null } => {
    if (!imagePath) return { images: [], video: null };
    if (imagePath.startsWith('{') && imagePath.endsWith('}')) {
      try {
        const parsed = JSON.parse(imagePath);
        return {
          images: parsed.images || [],
          video: parsed.video || null
        };
      } catch (e) {
        console.error('Error parsing JSON image_path:', e);
      }
    }
    // Fallback to simple image path
    return { images: [imagePath], video: null };
  };

  return (
    <div className="mx-auto max-w-7xl p-4 font-sans md:p-6 animate-fade-in dark:text-white">
      
      {/* 1. TEACHER (GURU) CONSOLIDATED TABBED DASHBOARD VIEW */}
      {currentUser && currentUser.role === 'guru' ? (
        <div className="space-y-6">
          
          {/* Guru Info Banner */}
          <div className="border-4 border-black bg-yellow-300 p-6 shadow-[6px_6px_0px_0px_#000000] text-black dark:border-white">
            <span className="inline-block border-2 border-black bg-white px-2 py-0.5 text-xs font-black uppercase shadow-[2.5px_2.5px_0px_0px_#000000] mb-2 animate-bounce">
              👨‍🏫 PANEL KONTROL GURU
            </span>
            <h1 className="text-4xl font-black tracking-tight leading-none uppercase">
              Dasbor Administrasi XI-J
            </h1>
            <p className="mt-2 text-xs font-bold text-zinc-800 uppercase">
              Selamat datang kembali, **{currentUser.name}**. Kelola semua kebutuhan piket kelas SMA Yadika 11 dari satu tempat!
            </p>
          </div>

          {/* Guru Neubrutalism Sub-tab Navigation */}
          <div className="flex flex-wrap gap-2.5 border-b-4 border-black pb-3 dark:border-white">
            {[
              { id: 'verification', name: `VERIFIKASI (${pendingReports.length})`, color: 'bg-red-400' },
              { id: 'calendar', name: 'RIWAYAT KALENDER', color: 'bg-green-400' },
              { id: 'roster', name: 'ATUR ROSTER PIKET', color: 'bg-cyan-400' },
              { id: 'students', name: 'KELOLA SISWA', color: 'bg-purple-300' },
              { id: 'supabase', name: 'SETUP DATABASE', color: 'bg-zinc-400' },
            ].map((tab) => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`border-2 border-black px-4 py-2 text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer dark:border-white dark:shadow-[2px_2px_0px_0px_#ffffff] ${
                    isActive ? `${tab.color} text-black translate-x-0.5 translate-y-0.5 shadow-none` : 'bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Active Guru Component Renders */}
          <div className="mt-6">
            
            {/* SUBTAB 1: Verifikasi Antrean Laporan */}
            {activeSubTab === 'verification' && (
              <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] dark:bg-zinc-900 dark:border-white">
                <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2 dark:border-white">
                  <ShieldAlert className="h-6 w-6 text-red-500 stroke-[3px] animate-pulse" />
                  Persetujuan Laporan Piket Pending ({pendingReports.length})
                </h2>

                {pendingReports.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 font-bold uppercase text-xs">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                    Semua laporan bersih! Roster piket berjalan lancar.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pendingReports.map((report) => {
                      const media = parseReportMedia(report.image_path);
                      return (
                        <div 
                          key={report.id} 
                          className="border-2 border-black p-4 bg-zinc-50 shadow-[3px_3px_0px_0px_#000000] dark:bg-zinc-800 dark:border-white flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-2 border-b border-zinc-200 pb-1.5 dark:border-zinc-700">
                              <span className="text-[10px] font-black text-black dark:text-white">TGL: {report.date}</span>
                              <span className="border border-black bg-red-100 text-red-700 px-2 py-0.5 text-[8px] font-black uppercase">
                                PENDING
                              </span>
                            </div>

                            {/* Multiple Photos Gallery preview (limited sizes) */}
                            {media.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-1 mb-2">
                                {media.images.map((img, i) => (
                                  <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="border border-black aspect-square overflow-hidden bg-zinc-900 block max-h-16 relative">
                                    <img src={img} alt="pending-bukti" className="object-cover h-full w-full" />
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Video Proof preview */}
                            {media.video && (
                              <div className="border border-black overflow-hidden bg-zinc-900 max-h-24 mb-2 rounded">
                                <video src={media.video} controls className="w-full max-h-24 object-cover" />
                              </div>
                            )}

                            <p className="text-[10px] font-black text-zinc-900 mt-2 uppercase dark:text-zinc-300">
                              PJ Melapor: {report.reporter_name}
                            </p>

                            {report.notes && (
                              <p className="text-[9px] font-bold italic text-zinc-600 bg-white border border-zinc-200 p-2 mt-2 leading-relaxed truncate dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600 uppercase">
                                &ldquo;{report.notes}&rdquo;
                              </p>
                            )}

                            {/* Attendees list */}
                            {report.details && report.details.length > 0 && (
                              <div className="mt-3">
                                <span className="text-[8px] text-zinc-400 font-black block uppercase">Presensi Kehadiran:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {report.details.map((det) => (
                                    <span 
                                      key={det.id} 
                                      className={`border px-1.5 py-0.2 text-[8px] font-black uppercase ${
                                        det.is_present === 1 ? 'bg-green-100 border-green-700 text-green-800' : 'bg-red-100 border-red-700 text-red-800'
                                      }`}
                                    >
                                      {det.student_name}: {det.is_present === 1 ? 'Hadir' : 'Absen'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                            <button
                              onClick={() => handleVerify(report.id, 'verified')}
                              disabled={verifyingId !== null}
                              className="flex-1 border-2 border-black bg-green-400 py-1.5 text-[9px] font-black uppercase text-black shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 cursor-pointer"
                            >
                              SETUJUI (VERIFIED)
                            </button>
                            <button
                              onClick={() => handleVerify(report.id, 'rejected')}
                              disabled={verifyingId !== null}
                              className="flex-1 border-2 border-black bg-red-300 py-1.5 text-[9px] font-black uppercase text-black shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 cursor-pointer"
                            >
                              TOLAK
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 2: Verified logs Calendar history */}
            {activeSubTab === 'calendar' && (
              <CalendarHistory logs={logs} />
            )}

            {/* SUBTAB 3: Week Scheduler with PJ assignment capabilities */}
            {activeSubTab === 'roster' && (
              <ScheduleManager 
                currentUser={currentUser}
                students={students}
                schedules={schedules}
                onActionComplete={onActionComplete}
              />
            )}

            {/* SUBTAB 4: Students CRUD Management */}
            {activeSubTab === 'students' && (
              <StudentManagement 
                currentUser={currentUser}
                students={students}
                onActionComplete={onActionComplete}
              />
            )}

            {/* SUBTAB 5: Supabase Dynamic configuration credentials */}
            {activeSubTab === 'supabase' && (
              <SupabaseSetup 
                supabaseConnected={supabaseConnected}
                onConnectionChange={onConnectionChange}
              />
            )}

          </div>

        </div>
      ) : (
        
        // 2. STUDENT (SISWA) / GUEST DUTY DASHBOARD & REPORTING LOCKS
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Today's Schedule and Roster Renders */}
            <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] md:col-span-2 dark:bg-zinc-900 dark:border-white">
              <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-3 dark:border-white">
                <CalendarIcon className="h-6 w-6 stroke-[3px] text-pink-500" />
                Petugas Piket Hari Ini ({currentDay})
              </h2>

              {todaySchedule.length === 0 ? (
                <div className="border-4 border-dashed border-zinc-200 py-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-zinc-300 stroke-[2px] mb-2" />
                  <p className="text-base font-black text-zinc-400 uppercase">Tidak ada jadwal piket hari ini!</p>
                  <p className="text-xs font-bold text-zinc-400 uppercase">Silakan hubungi Guru Anda untuk membuat jadwal.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Today's designated PJ highlights */}
                  {todayPJ ? (
                    <div className="border-2 border-black bg-pink-100 p-3 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase text-black flex items-center gap-2">
                      <Award className="h-5 w-5 text-pink-600 stroke-[2.5px]" />
                      <span>Penanggung Jawab (PJ) Hari Ini: **{todayPJ.student?.name}**</span>
                    </div>
                  ) : (
                    <div className="border-2 border-black bg-yellow-100 p-3 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase text-black flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 stroke-[2.5px]" />
                      <span>Belum ada Penanggung Jawab (PJ) yang ditunjuk hari ini!</span>
                    </div>
                  )}

                  {/* Teammates List */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {todaySchedule.map((item) => {
                      const s = item.student;
                      if (!s) return null;
                      return (
                        <div
                          key={item.id}
                          className="border-2 border-black p-3 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000] dark:bg-zinc-800 dark:border-white"
                        >
                          <div className="flex items-center justify-between">
                            <span className="border border-black bg-zinc-950 px-1.5 py-0.2 text-[8px] font-black text-white uppercase">
                              NIPD: {s.nipd}
                            </span>
                            {item.is_pj && (
                              <span className="border border-black bg-yellow-300 text-black px-1.5 py-0.2 text-[8px] font-black uppercase">
                                PJ KELAS 👑
                              </span>
                            )}
                          </div>
                          <h4 className="font-black uppercase text-xs mt-2 text-black truncate dark:text-white">{s.name}</h4>
                        </div>
                      );
                    })}
                  </div>

                  {/* PJ reporting lockout controller block */}
                  <div className="mt-8 border-4 border-black p-5 bg-cyan-50 shadow-[4px_4px_0px_0px_#000000] dark:bg-zinc-800 dark:border-white">
                    <h3 className="text-xl font-black uppercase mb-1.5 flex items-center gap-2 text-black dark:text-white">
                      <CheckSquare className="h-5 w-5 text-cyan-600 stroke-[3px]" />
                      Kirim Laporan Piket
                    </h3>
                    
                    {todayCompleted ? (
                      <div className="border-2 border-green-600 bg-green-100 p-3 text-center text-xs font-black uppercase text-green-700 flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000000] dark:text-green-800">
                        <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
                        Laporan Roster Hari Ini Telah Dikirim!
                      </div>
                    ) : (
                      currentUser ? (
                        isUserPJToday ? (
                          <button
                            onClick={() => setSelectedStudentForForm(currentUser)}
                            className="w-full border-2 border-black bg-pink-400 py-3 font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer text-black"
                          >
                            BUKA PENGUNGGAH BUKTI LAPORAN (PJ ONLY) 🚀
                          </button>
                        ) : (
                          <div className="border-4 border-black bg-red-100 p-4 shadow-[4px_4px_0px_0px_#000000] text-xs font-black uppercase text-red-900 flex items-start gap-3">
                            <AlertCircle className="h-6 w-6 stroke-[3px] text-red-700 shrink-0" />
                            <div>
                              <p className="text-red-700">AKSES DITOLAK! 🔒</p>
                              <p className="mt-1 text-zinc-700 normal-case leading-relaxed font-bold">
                                Hanya Penanggung Jawab (PJ) piket hari ini (<b>{todayPJ ? todayPJ.student?.name : 'Belum Ditunjuk'}</b>) yang diizinkan untuk mengirimkan laporan kebersihan kelas.
                              </p>
                            </div>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => setCurrentTab('welcome')}
                          className="w-full border-2 border-black bg-yellow-300 py-3 font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 cursor-pointer text-black"
                        >
                          MASUK KE AKUN ANDA UNTUK LAPOR 🔒
                        </button>
                      )
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Instruction lists sidebar */}
            <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] dark:bg-zinc-900 dark:border-white h-fit">
              <h2 className="text-xl font-black uppercase mb-3 flex items-center gap-2 border-b-2 border-black pb-2 dark:border-white">
                <ClipboardList className="h-5 w-5 text-yellow-500 stroke-[3px]" />
                Aturan & Panduan
              </h2>
              <ul className="space-y-2.5 font-bold text-zinc-700 text-[10px] uppercase leading-relaxed dark:text-zinc-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-yellow-600 font-bold shrink-0">1.</span>
                  <span>PJ Regu wajib meneliti absensi kehadiran piket harian.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-yellow-600 font-bold shrink-0">2.</span>
                  <span>Unggah minimal 3 foto bukti kebersihan sudut kelas.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-yellow-600 font-bold shrink-0">3.</span>
                  <span>Guru kelas akan memverifikasi log untuk pencairan +15 poin!</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* Lapor Piket Form Modal Overlay (Up to 5 Photos + 1 Video) */}
      {selectedStudentForForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-sans p-4 overflow-y-auto">
          <div className="w-full max-w-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000] relative animate-scale-in my-8 dark:bg-zinc-900 dark:border-white dark:shadow-[8px_8px_0px_0px_#ffffff]">
            
            {/* Modal Title */}
            <div className="border-b-4 border-black pb-4 mb-4 flex items-center justify-between dark:border-white">
              <div>
                <span className="border-2 border-black bg-yellow-300 px-2 py-0.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] text-black">
                  PJ LAPORAN ABSENSI
                </span>
                <h3 className="text-2xl font-black uppercase text-black mt-1 leading-none dark:text-white">
                  Unggah Bukti Kebersihan
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentForForm(null);
                  setNotes('');
                  setPhotoFiles([]);
                  setVideoFile(null);
                }}
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-red-400 text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              
              {/* Present / Absent Students list checklist */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5 dark:text-white">
                  Absensi Kehadiran Regu Piket Hari Ini
                </label>
                <div className="border-4 border-black p-3 space-y-2 shadow-[2px_2px_0px_0px_#000000] bg-zinc-50 dark:bg-zinc-800 dark:border-white max-h-40 overflow-y-auto">
                  {todaySchedule.map((sch) => {
                    const isChecked = attendanceStatuses[sch.user_id] || false;
                    const s = sch.student;
                    if (!s) return null;

                    return (
                      <button
                        type="button"
                        key={sch.id}
                        onClick={() => toggleAttendance(sch.user_id)}
                        className={`flex w-full items-center justify-between p-1.5 border-2 text-left font-bold text-xs uppercase transition-all ${
                          isChecked 
                            ? 'bg-cyan-200 border-black text-black shadow-[1px_1px_0px_0px_#000000]' 
                            : 'bg-white border-zinc-200 text-zinc-600 hover:border-black'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center border-2 border-black ${isChecked ? 'bg-black text-white' : 'bg-white'}`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[4px]" />}
                          </span>
                          <span className="truncate">{s.name}</span>
                        </span>
                        <span className="text-[9px] font-black border border-black bg-white px-1 py-0.2 shrink-0 text-black">
                          {isChecked ? 'HADIR ✅' : 'ABSEN ✕'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text notes */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1 dark:text-white">Deskripsi Catatan Kegiatan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Menyapu sudut kelas, membuang sampah, merapikan meja guru, dan menyeka papan tulis..."
                  rows={2}
                  className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000] dark:bg-zinc-800 dark:border-white"
                />
              </div>

              {/* Multi-Photo Picker (Required min 3, max 5) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-black uppercase text-black dark:text-white">
                    Bukti Foto (MINIMAL 3 FOTO!)
                  </label>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 border ${photoFiles.length >= 3 ? 'bg-green-100 text-green-700 border-green-700' : 'bg-red-100 text-red-700 border-red-700'}`}>
                    {photoFiles.length} / 5 FOTO
                  </span>
                </div>

                <div className="flex gap-2.5 items-stretch">
                  <label className="flex-1 flex items-center justify-center gap-2 border-4 border-dashed border-black bg-zinc-50 hover:bg-zinc-100 p-2.5 font-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_0px_#000000] transition-all dark:bg-zinc-800 dark:border-white">
                    <Camera className="h-5 w-5 stroke-[2.5px]" />
                    PILIH DARI KAMERA HP
                    <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>

                {/* Preset Fast Picker */}
                <div className="mt-2">
                  <span className="text-[8px] font-black uppercase text-zinc-400 block mb-1">PRESET CEPAT (UNTUK UJI COBA):</span>
                  <div className="flex gap-1.5">
                    {presetImages.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addPresetPhoto(p.url)}
                        className="flex-1 border border-black p-1 text-[9px] font-bold uppercase bg-white hover:bg-zinc-50 text-black cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid preview of uploaded photos */}
                {photoFiles.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-3">
                    {photoFiles.map((img, i) => (
                      <div key={i} className="aspect-square border-2 border-black relative overflow-hidden bg-zinc-900 shadow-[1.5px_1.5px_0px_0px_#000000] dark:border-white">
                        <img src={img} alt="Bukti Upload" className="object-cover h-full w-full" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-0.5 right-0.5 bg-red-400 text-black border border-black h-4 w-4 flex items-center justify-center text-[8px] font-black rounded-none cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Picker (Max 15MB) */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1 dark:text-white">
                  Unggah Video Bukti (Opsional, Maks 15MB)
                </label>
                
                {videoFile ? (
                  <div className="border-2 border-black p-2 bg-zinc-50 flex items-center justify-between shadow-[2px_2px_0px_0px_#000000] dark:border-white dark:bg-zinc-800">
                    <div className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-cyan-600 stroke-[2.5px]" />
                      <span className="text-[10px] font-black text-black dark:text-white">VIDEO_BUKTI_TERPILIH.MP4</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="border border-black bg-red-400 text-black px-2 py-0.5 text-[8px] font-black uppercase cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                    >
                      BATAL
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 border-4 border-dashed border-black bg-zinc-50 hover:bg-zinc-100 p-2.5 font-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_0px_#000000] transition-all dark:bg-zinc-800 dark:border-white">
                    <Video className="h-5 w-5 stroke-[2.5px]" />
                    PILIH VIDEO DARI GALERI/KAMERA
                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Submit triggers */}
              <button
                type="submit"
                disabled={submitting || photoFiles.length < 3}
                className="w-full border-4 border-black bg-emerald-400 p-3 font-black text-xs uppercase text-black transition-all shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'SEDANG MENGIRIM...' : 'KIRIM LAPORAN PIKET KELAS! 🚀'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
