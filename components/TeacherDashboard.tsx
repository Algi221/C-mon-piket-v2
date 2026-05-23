'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar as CalendarIcon, 
  ClipboardList, 
  Settings as SettingsIcon, 
  LogOut, 
  Check, 
  X, 
  Menu,
  Sparkles, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  AlertTriangle, 
  Film, 
  Image as ImageIcon,
  Award,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { db, User, Schedule, Report } from '../lib/db';
import StudentManagement from './StudentManagement';
import ScheduleManager from './ScheduleManager';
import AttendanceLogs from './AttendanceLogs';
import Settings from './Settings';
import TextType from './TextType';
import confetti from 'canvas-confetti';

interface TeacherDashboardProps {
  currentUser: User | null;
  students: User[];
  schedules: Schedule[];
  logs: Report[];
  onActionComplete: () => void;
  onLogout: () => void;
  supabaseConnected: boolean;
  onProfileUpdate: (updatedUser: User) => void;
}

export default function TeacherDashboard({ 
  currentUser, 
  students, 
  schedules, 
  logs, 
  onActionComplete, 
  onLogout,
  supabaseConnected,
  onProfileUpdate
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'schedule' | 'history' | 'settings'>('dashboard');
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark') || localStorage.getItem('cmon_theme') === 'dark');
      const handleThemeChange = () => {
        setIsDark(document.documentElement.classList.contains('dark'));
      };
      window.addEventListener('cmon-theme-change', handleThemeChange);
      return () => window.removeEventListener('cmon-theme-change', handleThemeChange);
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDark;
    setIsDark(nextMode);
    if (typeof window !== 'undefined') {
      if (nextMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cmon_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('cmon_theme', 'light');
      }
      window.dispatchEvent(new Event('cmon-theme-change'));
    }
  };

  const handleTabClick = (tab: 'dashboard' | 'students' | 'schedule' | 'history' | 'settings') => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  // Calendar States
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // May
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  useEffect(() => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }, []);

  const pendingReports = useMemo(() => logs.filter(l => l.status === 'pending'), [logs]);
  const verifiedReports = useMemo(() => logs.filter(l => l.status === 'verified'), [logs]);
  const rejectedReports = useMemo(() => logs.filter(l => l.status === 'rejected'), [logs]);

  // Ratios for Visual Neubrutalist Charts
  const statsChartData = useMemo(() => {
    const total = logs.length || 1;
    return {
      verifiedPct: Math.round((verifiedReports.length / total) * 100),
      pendingPct: Math.round((pendingReports.length / total) * 100),
      rejectedPct: Math.round((rejectedReports.length / total) * 100)
    };
  }, [logs, verifiedReports, pendingReports, rejectedReports]);

  // Verification approvals handler
  const handleVerify = async (reportId: number, status: 'verified' | 'rejected') => {
    setVerifyingId(reportId);
    try {
      const success = await db.verifyReport(reportId, status);
      if (success) {
        if (status === 'verified') {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#4ADE80', '#FACC15', '#EC4899']
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

  // Helper to parse Base64 attachments
  const parseMedia = (imagePath: string): { photos: string[]; video: string | null } => {
    try {
      if (imagePath.startsWith('{')) {
        const parsed = JSON.parse(imagePath);
        return {
          photos: (parsed.photos || []).slice(0, 3), // Max 3 photos
          video: parsed.video || null,
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
    setSelectedDateStr(null);
    setSelectedReport(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDateStr(null);
    setSelectedReport(null);
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
    setSelectedDateStr(dateStr);
    const reportOnDate = logs.find(l => l.date === dateStr);
    setSelectedReport(reportOnDate || null);
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#fbfbf8] font-sans text-black">
      
      {/* Mobile Top Header Navigation */}
      <header className="lg:hidden flex items-center justify-between border-b-4 border-black bg-white px-4 py-3 sticky top-0 z-40 w-full shrink-0">
        <button 
          onClick={() => { setActiveTab('dashboard'); setIsMobileOpen(false); }} 
          className="flex items-center gap-2 text-lg font-black tracking-wider text-black cursor-pointer"
        >
          <span className="flex h-8 w-8 items-center justify-center border-2 border-black bg-yellow-300 text-sm font-bold shadow-[1.5px_1.5px_0px_0px_#000000]">
            ⚡
          </span>
          <span>C-MON PIKET</span>
        </button>
        
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-zinc-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
        >
          {isMobileOpen ? <X className="h-5 w-5 stroke-[3px]" /> : <Menu className="h-5 w-5 stroke-[3px]" />}
        </button>
      </header>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      {/* ==========================================
         LEFT STICKY SIDEBAR (ADMIN PANELS)
         ========================================== */}
      <aside className={`w-64 border-r-4 border-black bg-white flex flex-col justify-between z-50 shrink-0 transition-transform duration-300 fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div>
          {/* Logo Header */}
          <div className="border-b-4 border-black p-5 bg-yellow-300 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center border-4 border-black bg-white text-lg font-bold shadow-[1.5px_1.5px_0px_0px_#000000]">
              ⚡
            </span>
            <div className="text-left leading-none">
              <h1 className="text-lg font-black tracking-tight uppercase leading-none">C-MON PIKET</h1>
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-0.5 inline-block">Dashboard admin</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => handleTabClick('dashboard')}
              className={`w-full py-2.5 px-4 text-xs font-black uppercase text-left flex items-center gap-3 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-cyan-300 translate-x-0.5 shadow-none' : 'bg-white'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5 stroke-[3px]" />
              DASHBOARD
            </button>

            <button
              onClick={() => handleTabClick('students')}
              className={`w-full py-2.5 px-4 text-xs font-black uppercase text-left flex items-center gap-3 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer ${
                activeTab === 'students' ? 'bg-purple-300 translate-x-0.5 shadow-none' : 'bg-white'
              }`}
            >
              <Users className="h-4.5 w-4.5 stroke-[3px]" />
              KELOLA SISWA
            </button>

            <button
              onClick={() => handleTabClick('schedule')}
              className={`w-full py-2.5 px-4 text-xs font-black uppercase text-left flex items-center gap-3 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer ${
                activeTab === 'schedule' ? 'bg-pink-300 translate-x-0.5 shadow-none' : 'bg-white'
              }`}
            >
              <CalendarIcon className="h-4.5 w-4.5 stroke-[3px]" />
              KELOLA JADWAL PIKET
            </button>

            <button
              onClick={() => handleTabClick('history')}
              className={`w-full py-2.5 px-4 text-xs font-black uppercase text-left flex items-center gap-3 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer ${
                activeTab === 'history' ? 'bg-green-300 translate-x-0.5 shadow-none' : 'bg-white'
              }`}
            >
              <ClipboardList className="h-4.5 w-4.5 stroke-[3px]" />
              RIWAYAT PIKET
            </button>

            <button
              onClick={() => handleTabClick('settings')}
              className={`w-full py-2.5 px-4 text-xs font-black uppercase text-left flex items-center gap-3 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer ${
                activeTab === 'settings' ? 'bg-amber-300 translate-x-0.5 shadow-none' : 'bg-white'
              }`}
            >
              <SettingsIcon className="h-4.5 w-4.5 stroke-[3px]" />
              PROFIL & SETELAN
            </button>
          </nav>
        </div>

        {/* Sidebar bottom */}
        <div className="p-4 border-t-2 border-black bg-zinc-50 space-y-3">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase text-zinc-500">
            <div className={`h-2.5 w-2.5 rounded-full border border-black ${supabaseConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span>{supabaseConnected ? 'SUPABASE CONNECTED' : 'OFFLINE MODE'}</span>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full border-2 border-black bg-yellow-300 p-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
          >
            {isDark ? <Sun className="h-4 w-4 stroke-[3px]" /> : <Moon className="h-4 w-4 stroke-[3px]" />}
            <span>{isDark ? 'MODE TERANG' : 'MODE GELAP'}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full border-2 border-black bg-red-400 p-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4 stroke-[3px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* ==========================================
         RIGHT CONTENT SCROLLER AREA
         ========================================== */}
      <main className="flex-1 p-4 md:p-6 lg:overflow-y-auto lg:h-screen w-full max-w-full">

        {/* 1. DASHBOARD TAB VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Header Greeting Banner */}
            <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setActiveTab('settings')}
                  className="h-28 w-28 rounded-full border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_#000000] hover:scale-105 transition-transform shrink-0 bg-yellow-100 flex items-center justify-center cursor-pointer"
                >
                  {currentUser.photo_url ? (
                    <img src={currentUser.photo_url} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-12 w-12 stroke-[2px]" />
                  )}
                </div>
                <div>
                  <div className="text-2xl font-black flex items-center gap-1.5 leading-none">
                    <span>Halo Ibu/Bapak,</span>
                    <TextType 
                      text={currentUser.name} 
                      showCursor={true} 
                      typingSpeed={80} 
                      loop={false}
                      className="text-cyan-500 font-black"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">
                    Selamat datang di Dasbor Guru Kelas XI-J SMA Yadika 11
                  </p>
                </div>
              </div>

              <div className="border-2 border-black bg-yellow-300 px-3.5 py-1.5 text-xs font-black uppercase shadow-[2.5px_2.5px_0px_0px_#000000]">
                SMA YADIKA 11 🏫
              </div>
            </div>

            {/* Neubrutalist Analytics Charts Block */}
            <div className="grid gap-6 md:grid-cols-4">
              
              {/* Counters */}
              <div className="border-4 border-black bg-emerald-100 p-4 shadow-[4px_4px_0px_0px_#000000] text-left">
                <span className="text-[9px] font-black text-emerald-800 uppercase block mb-1">LOGS TERVERIFIKASI</span>
                <span className="text-4xl font-black text-black leading-none">{verifiedReports.length}</span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase block mt-1">LAPORAN DI-ACCEPT GURU</span>
              </div>

              <div className="border-4 border-black bg-yellow-100 p-4 shadow-[4px_4px_0px_0px_#000000] text-left">
                <span className="text-[9px] font-black text-yellow-800 uppercase block mb-1">ANTREAN PENDING</span>
                <span className="text-4xl font-black text-black leading-none">{pendingReports.length}</span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase block mt-1">BUTUH APPROVAL GURU</span>
              </div>

              <div className="border-4 border-black bg-red-100 p-4 shadow-[4px_4px_0px_0px_#000000] text-left">
                <span className="text-[9px] font-black text-red-800 uppercase block mb-1">LOGS DITOLAK</span>
                <span className="text-4xl font-black text-black leading-none">{rejectedReports.length}</span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase block mt-1">TIDAK LOLOS VERIFIKASI</span>
              </div>

              {/* Neubrutalist ratio progress bar chart */}
              <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-center gap-2">
                <span className="text-[9px] font-black text-zinc-900 uppercase block">Rasio Kebersihan Kelas (%)</span>
                <div className="h-6 w-full border-2 border-black flex overflow-hidden bg-zinc-100 shadow-[1px_1px_0px_0px_#000000]">
                  <div style={{ width: `${statsChartData.verifiedPct}%` }} className="bg-emerald-400 h-full border-r-2 border-black" title="Verified" />
                  <div style={{ width: `${statsChartData.pendingPct}%` }} className="bg-yellow-300 h-full border-r-2 border-black" title="Pending" />
                  <div style={{ width: `${statsChartData.rejectedPct}%` }} className="bg-red-400 h-full" title="Rejected" />
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase text-zinc-500">
                  <span className="text-emerald-700">ACC: {statsChartData.verifiedPct}%</span>
                  <span className="text-yellow-700">PEND: {statsChartData.pendingPct}%</span>
                  <span className="text-red-700">REJ: {statsChartData.rejectedPct}%</span>
                </div>
              </div>

            </div>

            {/* Big Verification Card Deck - ELIMINATED CRAMPED TABLE AND DENSE VIEW */}
            <div className="border-4 border-black dark:border-white bg-white dark:bg-zinc-900 p-6 shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#ffffff] mb-8">
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <ClipboardList className="h-6 w-6 stroke-[3px]" />
                Verifikasi Laporan Hari Ini ({pendingReports.length})
              </h2>

              {pendingReports.length === 0 ? (
                <div className="border-4 border-dashed border-zinc-200 dark:border-zinc-800 py-12 text-center rounded-sm">
                  <span className="text-4xl animate-pulse block mb-2">✨</span>
                  <p className="text-base font-black text-zinc-400 dark:text-zinc-500 uppercase">Semua Laporan Piket Bersih!</p>
                  <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mt-1">Belum ada antrean verifikasi baru dari siswa.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {pendingReports.map((report) => {
                    const media = parseMedia(report.image_path);
                    return (
                      <div 
                        key={report.id} 
                        className="border-4 border-black dark:border-white bg-zinc-50 dark:bg-zinc-800 p-6 sm:p-8 shadow-[8px_8px_0px_0px_#7c3aed] dark:shadow-[8px_8px_0px_0px_#ffffff] grid md:grid-cols-2 gap-8 items-start rounded-sm"
                      >
                        
                        {/* LEFT COLUMN: EVIDENCE MEDIA & NOTES */}
                        <div className="space-y-6">
                          <div>
                            <span className="border-2 border-black dark:border-white bg-pink-300 dark:bg-pink-300 text-black px-3 py-1 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000] block w-fit mb-3">
                              BUKTI VISUAL KEBERSIHAN
                            </span>
                            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-4">
                              KLIK PADA FOTO UNTUK MEMPERBESAR DAN MELIHAT SATU PER SATU SECARA FULL-SCREEN:
                            </p>

                            {/* Large clickable visual list */}
                            {media.photos.length > 0 ? (
                              <div className="flex flex-wrap gap-4">
                                {media.photos.map((src, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => setZoomPhoto(src)}
                                    className="border-4 border-black dark:border-white h-28 w-28 sm:h-32 sm:w-32 overflow-hidden bg-zinc-950 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] shrink-0 rounded-sm relative group"
                                    title="Klik untuk perbesar foto"
                                  >
                                    <img src={src} alt="Verify Zoom Preview" className="object-cover h-full w-full" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <span className="text-[10px] font-black text-white uppercase tracking-wider">ZOOM 🔍</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs font-bold text-red-500 uppercase">TIDAK ADA FOTO BUKTI TERLAMPIR</p>
                            )}
                          </div>

                          {/* HTML5 Spacious controls Video Player */}
                          {media.video && (
                            <div className="mt-4 pt-4 border-t-2 border-dashed border-zinc-200 dark:border-zinc-700">
                              <span className="border-2 border-black dark:border-white bg-purple-300 dark:bg-purple-300 text-black px-3 py-1 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000] block w-fit mb-3">
                                DOKUMENTASI VIDEO BUKTI (PLAYBACK KONTROL)
                              </span>
                              <div className="border-4 border-black dark:border-white bg-zinc-950 p-1.5 shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] rounded-sm max-w-sm">
                                <video src={media.video} controls className="w-full max-h-60 object-contain rounded-sm" />
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {report.notes && (
                            <div className="border-4 border-black dark:border-white bg-yellow-100 dark:bg-yellow-900/30 p-4 shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] text-black dark:text-white rounded-sm">
                              <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Catatan Roster Reporter:</span>
                              <p className="text-xs font-black italic">"{report.notes}"</p>
                            </div>
                          )}
                        </div>

                        {/* RIGHT COLUMN: METADATA, PRESENSI & ACTIONS */}
                        <div className="space-y-6 flex flex-col justify-between h-full w-full">
                          
                          <div>
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-black dark:border-white pb-3 mb-4">
                              <div>
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block">Tanggal Pelaporan</span>
                                <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{report.date}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-wider block">Reporter PJ Utama</span>
                                <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">{report.reporter_name}</span>
                              </div>
                            </div>

                            {/* Attendance details list - highly readable */}
                            <div>
                              <span className="border-2 border-black dark:border-white bg-yellow-300 dark:bg-yellow-300 text-black px-3 py-1 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000] block w-fit mb-4">
                                RINCIAN PRESENSI REGU PIKET
                              </span>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {report.details?.map((det) => (
                                  <div 
                                    key={det.id} 
                                    className={`border-2 border-black dark:border-white p-2.5 flex items-center justify-between text-[10px] font-black shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#ffffff] rounded-sm ${
                                      det.is_present === 1 
                                        ? 'bg-green-100 border-green-700 text-green-900 dark:bg-green-950/40 dark:text-green-200' 
                                        : 'bg-red-100 border-red-700 text-red-900 dark:bg-red-950/40 dark:text-red-200'
                                    }`}
                                  >
                                    <span className="truncate max-w-[80%] text-zinc-900 dark:text-zinc-100">{det.student_name}</span>
                                    <span className={`px-2 py-0.5 border border-black dark:border-white text-[8px] font-black uppercase shrink-0 ${
                                      det.is_present === 1 ? 'bg-green-400 text-white' : 'bg-red-400 text-white'
                                    }`}>
                                      {det.is_present === 1 ? 'HADIR' : 'ABSEN'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Massive neubrutalist Action Buttons */}
                          <div className="pt-6 border-t-2 border-zinc-100 dark:border-zinc-800 flex gap-4 w-full">
                            <button
                              onClick={() => handleVerify(report.id, 'verified')}
                              disabled={verifyingId !== null}
                              className="flex-1 border-4 border-black dark:border-white bg-green-400 hover:bg-green-300 text-black p-4 font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                            >
                              ✔ SETUJUI LAPORAN
                            </button>
                            <button
                              onClick={() => handleVerify(report.id, 'rejected')}
                              disabled={verifyingId !== null}
                              className="flex-1 border-4 border-black dark:border-white bg-red-400 hover:bg-red-300 text-black p-4 font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                            >
                              ✕ TOLAK LAPORAN
                            </button>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Calendar Log History with Details */}
            <div className="grid gap-6 lg:grid-cols-5">
              
              {/* Green-highlight Calendar */}
              <div className="lg:col-span-3 border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_#000000]">
                <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-4">
                  <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                    <CalendarIcon className="h-6 w-6 text-emerald-500 stroke-[3px]" />
                    Kalender Riwayat Piket
                  </h2>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={prevMonth}
                      className="h-9 w-9 border-2 border-black bg-white hover:bg-zinc-100 flex items-center justify-center shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
                    >
                      <ChevronLeft className="h-5 w-5 stroke-[3px]" />
                    </button>
                    <span className="border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000000]">
                      {monthsIndo[currentMonth]} {currentYear}
                    </span>
                    <button
                      onClick={nextMonth}
                      className="h-9 w-9 border-2 border-black bg-white hover:bg-zinc-100 flex items-center justify-center shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
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
                    const isSelected = selectedDateStr === cell.dateStr;

                    let cellBg = 'bg-white hover:bg-zinc-100';
                    if (hasReport) {
                      cellBg = isVerified 
                        ? 'bg-green-300 hover:bg-green-200 border-green-700 text-black shadow-[1px_1px_0px_0px_#16a34a]' 
                        : 'bg-yellow-300 hover:bg-yellow-200 border-yellow-700 text-black shadow-[1px_1px_0px_0px_#ca8a04]';
                    }

                    if (isSelected) {
                      cellBg += ' scale-105 border-4 border-black shadow-none translate-x-0.5 z-10';
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

                {!selectedDateStr ? (
                  <div className="py-12 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200">
                    <HelpCircle className="mx-auto h-8 w-8 stroke-[2px] mb-2 opacity-50" />
                    <p className="text-[10px] uppercase">PILIH TANGGAL DI KALENDER</p>
                    <p className="text-[8px] text-zinc-400 mt-1 uppercase">HARI HIJAU MEMILIKI LAPORAN PIKET KELAS</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 bg-zinc-50 border border-black p-3.5 text-xs font-black uppercase flex items-center justify-between">
                      <span>TANGGAL: {selectedDateStr}</span>
                      <span className="bg-yellow-300 border border-black px-2 py-0.5">
                        {selectedReport ? (selectedReport.status === 'verified' ? 'DISETUJUI' : 'PENDING') : 'KOSONG'}
                      </span>
                    </div>

                    {!selectedReport ? (
                      <div className="py-12 text-center text-zinc-400 font-bold border border-dashed border-zinc-200">
                        <AlertTriangle className="mx-auto h-9 w-9 stroke-[2px] mb-2 text-zinc-300" />
                        <p className="text-xs uppercase">Tidak ada laporan piket</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="space-y-1 text-[11px] sm:text-xs font-black uppercase text-zinc-800">
                          <p>Dilaporkan Oleh: <span className="text-cyan-600">{selectedReport.reporter_name}</span></p>
                          {selectedReport.notes && (
                            <p className="normal-case bg-zinc-50 border border-zinc-200 p-3 text-xs font-bold text-zinc-600 italic mt-1.5 leading-relaxed">
                              &ldquo;{selectedReport.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        {/* Media display */}
                        <div>
                          <span className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase block mb-1.5">Bukti Kebersihan (Max 3 Foto):</span>
                          {(() => {
                            const media = parseMedia(selectedReport.image_path);
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
                                    <video controls playsInline className="w-full h-full max-h-44" src={media.video} />
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* Attendance present students */}
                        {selectedReport.details && (
                          <div>
                            <span className="text-[10px] sm:text-xs font-black text-zinc-500 uppercase block mb-2">Presensi Anggota Piket:</span>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto">
                              {selectedReport.details.map((det) => (
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

          </div>
        )}

        {/* 2. KELOLA SISWA TAB VIEW */}
        {activeTab === 'students' && (
          <StudentManagement 
            currentUser={currentUser}
            students={students}
            onActionComplete={onActionComplete}
          />
        )}

        {/* 3. KELOLA JADWAL PIKET TAB VIEW */}
        {activeTab === 'schedule' && (
          <ScheduleManager 
            currentUser={currentUser}
            students={students}
            schedules={schedules}
            onActionComplete={onActionComplete}
          />
        )}

        {/* 4. RIWAYAT PIKET TAB VIEW */}
        {activeTab === 'history' && (
          <AttendanceLogs 
            logs={logs}
          />
        )}

        {/* 5. PROFIL & SECURITY TAB VIEW */}
        {activeTab === 'settings' && (
          <Settings 
            currentUser={currentUser}
            onProfileUpdate={onProfileUpdate}
            onLogout={onLogout}
          />
        )}

      </main>

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
