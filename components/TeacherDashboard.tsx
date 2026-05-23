'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Database, Users, Calendar as CalendarIcon, ClipboardList, Check, X, ShieldAlert, Sparkles, UserPlus, Play, Film, Image as ImageIcon, AlertTriangle, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { db, User, Schedule, Report, ReportDetail } from '../lib/db';
import StudentManagement from './StudentManagement';
import confetti from 'canvas-confetti';

interface TeacherDashboardProps {
  currentUser: User | null;
  students: User[];
  schedules: Schedule[];
  logs: Report[];
  onActionComplete: () => void;
}

export default function TeacherDashboard({ currentUser, students, schedules, logs, onActionComplete }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'verify' | 'students' | 'calendar'>('verify');
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  // Calendar States
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed, so 4 = May
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Auto-select today or first log on mount
  useEffect(() => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  }, []);

  const pendingReports = logs.filter(l => l.status === 'pending');

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

  // Helper to parse serialized media URLs (JSON structure fallback)
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
      console.warn('Failed to parse JSON media from image_path, using raw string:', e);
    }
    
    // Fallback: check if it's a video file or preset image
    const isVideo = imagePath.endsWith('.mp4') || imagePath.startsWith('data:video');
    return {
      photos: isVideo ? [] : [imagePath],
      video: isVideo ? imagePath : null,
    };
  };

  // ==========================================
  // CUSTOM CALENDAR COMPONENT CALCULATIONS
  // ==========================================
  
  // Navigate Months
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

  // Generate days in month
  const calendarCells = useMemo(() => {
    const cells = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Day of week (0=Sunday, 1=Monday...)
    const numDays = new Date(currentYear, currentMonth + 1, 0).getDate(); // Days in current month

    // Indonesian Calendar adjustment: Monday is 1st column, Sunday is last column
    // Standard getDay() is 0=Sun, 1=Mon, 2=Tue...
    const padCells = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    // Pad prior month cells
    for (let i = 0; i < padCells; i++) {
      cells.push({ day: null, dateStr: null });
    }

    // Month days
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
    
    // Find if a report exists for this date
    const reportOnDate = logs.find(l => l.date === dateStr);
    setSelectedReport(reportOnDate || null);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 font-sans md:p-6 animate-fade-in">
      
      {/* Dynamic Tab Switcher */}
      <div className="mb-6 border-4 border-black bg-white p-2 shadow-[4px_4px_0px_0px_#000000] flex gap-2">
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex-1 py-3 text-xs font-black uppercase border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'verify' ? 'bg-cyan-300 translate-x-0.5 shadow-none' : 'bg-white'
          }`}
        >
          <ClipboardList className="h-4 w-4 stroke-[3px]" />
          VERIFIKASI ({pendingReports.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex-1 py-3 text-xs font-black uppercase border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'students' ? 'bg-purple-300 translate-x-0.5 shadow-none' : 'bg-white'
          }`}
        >
          <Users className="h-4 w-4 stroke-[3px]" />
          KELOLA SISWA
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
      </div>

      {/* ==========================================
         TAB 1: REPORTS VERIFICATION DECK
         ========================================== */}
      {activeTab === 'verify' && (
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
          <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 stroke-[3px] text-cyan-500" />
            Antrean Verifikasi Laporan Piket
          </h2>

          {pendingReports.length === 0 ? (
            <div className="border-4 border-dashed border-zinc-200 py-16 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-zinc-300 stroke-[2px] mb-2" />
              <p className="text-lg font-black text-zinc-400 uppercase">Semua Laporan Terverifikasi!</p>
              <p className="text-xs font-bold text-zinc-400 uppercase">Belum ada antrean baru dari siswa piket.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {pendingReports.map((report) => {
                const media = parseMedia(report.image_path);
                
                return (
                  <div
                    key={report.id}
                    className="border-4 border-black p-4 bg-zinc-50 shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-black pb-2 mb-3 text-[10px] font-black text-zinc-500 uppercase">
                        <span>TANGGAL: {report.date}</span>
                        <span className="border border-black bg-yellow-200 px-1.5 py-0.2">PENDING</span>
                      </div>

                      {/* Photo/Video Grid */}
                      <div className="space-y-3">
                        {media.photos.length > 0 && (
                          <div className={`grid gap-2 ${media.photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {media.photos.map((src, idx) => (
                              <div key={idx} className="border border-black h-24 overflow-hidden bg-zinc-950">
                                <img src={src} alt="Bukti" className="object-cover h-full w-full max-h-24" />
                              </div>
                            ))}
                          </div>
                        )}

                        {media.video && (
                          <div className="border border-black bg-zinc-900 overflow-hidden relative rounded shadow-[2px_2px_0px_0px_#000000] max-h-44 flex items-center justify-center">
                            <video controls className="w-full h-full max-h-40" src={media.video} />
                          </div>
                        )}
                      </div>

                      {/* Info logs */}
                      <div className="mt-4 space-y-1.5 text-left text-[10px] font-black uppercase text-zinc-900">
                        <p>Dilaporkan Oleh: <span className="text-cyan-600">{report.reporter_name}</span></p>
                        
                        {report.notes && (
                          <p className="normal-case border-l-4 border-black bg-white border border-zinc-200 p-2 text-zinc-500 italic mt-1 leading-relaxed">
                            &ldquo;{report.notes}&rdquo;
                          </p>
                        )}

                        {/* Attendance present students */}
                        <div className="mt-3">
                          <span className="text-[8px] text-zinc-400 block mb-1">PRESENSI REGU PIKET:</span>
                          <div className="flex flex-wrap gap-1">
                            {report.details?.map((det) => (
                              <span
                                key={det.id}
                                className={`border px-1.5 py-0.2 text-[8px] font-black ${
                                  det.is_present === 1 ? 'bg-green-100 border-green-700 text-green-800' : 'bg-red-100 border-red-700 text-red-800'
                                }`}
                              >
                                {det.student_name}: {det.is_present === 1 ? 'HADIR' : 'ABSEN'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Verifications trigger actions */}
                    <div className="mt-5 flex gap-3 border-t border-black pt-3">
                      <button
                        onClick={() => handleVerify(report.id, 'verified')}
                        disabled={verifyingId !== null}
                        className="flex-1 border-2 border-black bg-green-300 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                      >
                        SETUJUI LAPORAN ✔
                      </button>
                      <button
                        onClick={() => handleVerify(report.id, 'rejected')}
                        disabled={verifyingId !== null}
                        className="flex-1 border-2 border-black bg-red-300 py-2 text-xs font-black uppercase text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                      >
                        TOLAK LAPORAN ✕
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
         TAB 2: STUDENT MANAGEMENT CRUD
         ========================================== */}
      {activeTab === 'students' && (
        <StudentManagement
          currentUser={currentUser}
          students={students}
          onActionComplete={onActionComplete}
        />
      )}

      {/* ==========================================
         TAB 3: CALENDAR HISTORY WITH LOG DETAILS
         ========================================== */}
      {activeTab === 'calendar' && (
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Calendar visualizer component */}
          <div className="lg:col-span-2 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
              <h2 className="text-2xl font-black uppercase flex items-center gap-2 leading-none">
                <CalendarIcon className="h-6 w-6 stroke-[3px] text-green-500" />
                Kalender Riwayat Piket
              </h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="h-9 w-9 border-2 border-black bg-white hover:bg-zinc-100 flex items-center justify-center font-bold shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5 stroke-[2.5px]" />
                </button>
                <span className="border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000]">
                  {monthsIndo[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="h-9 w-9 border-2 border-black bg-white hover:bg-zinc-100 flex items-center justify-center font-bold shadow-[1.5px_1.5px_0px_0px_#000000] cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5 stroke-[2.5px]" />
                </button>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center font-black text-[10px] uppercase border-b-2 border-black pb-2 mb-3 bg-zinc-900 text-white p-1">
              <div>Sen</div>
              <div>Sel</div>
              <div>Rab</div>
              <div>Kam</div>
              <div>Jum</div>
              <div className="text-red-400">Sab</div>
              <div className="text-red-400">Min</div>
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((cell, idx) => {
                if (!cell.day) {
                  return <div key={idx} className="h-10 sm:h-12 bg-zinc-50 border border-transparent" />;
                }

                // Check if a report exists for this cell's date
                const reportOnDate = logs.find(l => l.date === cell.dateStr);
                const hasReport = !!reportOnDate;
                const isVerified = reportOnDate?.status === 'verified';
                const isSelected = selectedDateStr === cell.dateStr;

                let cellBg = 'bg-white hover:bg-zinc-100';
                if (hasReport) {
                  cellBg = isVerified 
                    ? 'bg-green-300 hover:bg-green-200 text-black border-green-700 shadow-[1.5px_1.5px_0px_0px_#15803d]' 
                    : 'bg-yellow-300 hover:bg-yellow-200 text-black border-yellow-700 shadow-[1.5px_1.5px_0px_0px_#a16207]';
                }

                if (isSelected) {
                  cellBg += ' scale-105 border-4 border-black z-10 shadow-none translate-x-0.5 translate-y-0.5';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleCellClick(cell.dateStr)}
                    className={`h-10 sm:h-12 border-2 border-black flex flex-col items-center justify-between p-1 font-black transition-all cursor-pointer text-xs ${cellBg}`}
                  >
                    <span>{cell.day}</span>
                    {hasReport && (
                      <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Log Details Display (Rendered below/beside calendar) */}
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
            <h2 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-yellow-500 stroke-[3px]" />
              Detail Riwayat Hari
            </h2>

            {!selectedDateStr ? (
              <div className="py-12 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200">
                <HelpCircle className="mx-auto h-10 w-10 stroke-[2px] mb-2 opacity-50" />
                <p className="text-xs uppercase">PILIH TANGGAL DI KALENDER</p>
                <p className="text-[10px] text-zinc-400 mt-1">HARI HIJAU MEMILIKI LAPORAN PIKET KELAS</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 bg-zinc-50 border-2 border-black p-3 text-xs font-black uppercase flex items-center justify-between">
                  <span>TANGGAL: {selectedDateStr}</span>
                  <span className="bg-yellow-300 border border-black px-1.5 py-0.2">
                    {selectedReport ? (selectedReport.status === 'verified' ? 'DISETUJUI' : 'PENDING') : 'KOSONG'}
                  </span>
                </div>

                {!selectedReport ? (
                  <div className="py-8 text-center text-zinc-400 font-bold border border-dashed border-zinc-200">
                    <AlertTriangle className="mx-auto h-8 w-8 stroke-[2px] mb-1 text-zinc-300" />
                    <p className="text-xs uppercase">Tidak ada laporan piket</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1 text-[10px] font-black uppercase text-zinc-800">
                      <p>Dilaporkan Oleh: <span className="text-cyan-600">{selectedReport.reporter_name}</span></p>
                      
                      {selectedReport.notes && (
                        <p className="normal-case bg-zinc-50 border border-zinc-200 p-2 font-bold text-zinc-500 italic mt-1">
                          &ldquo;{selectedReport.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Photos slider inside details */}
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Galeri Foto Bukti:</span>
                      {(() => {
                        const media = parseMedia(selectedReport.image_path);
                        return (
                          <div className="space-y-3">
                            {media.photos.length > 0 && (
                              <div className="grid gap-2 grid-cols-2">
                                {media.photos.map((src, i) => (
                                  <div key={i} className="border border-black h-24 overflow-hidden bg-zinc-950 rounded shadow-[1.5px_1.5px_0px_0px_#000000]">
                                    <img src={src} alt="Bukti Kalender" className="object-cover h-full w-full max-h-24 max-w-full" />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {media.video && (
                              <div className="mt-2 border-2 border-black bg-zinc-900 rounded overflow-hidden shadow-[2px_2px_0px_0px_#000000] max-h-44 flex items-center justify-center">
                                <video controls className="w-full h-full max-h-40" src={media.video} />
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Present/Absent list */}
                    {selectedReport.details && (
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">Presensi Anggota Piket:</span>
                        <div className="space-y-1 max-h-28 overflow-y-auto">
                          {selectedReport.details.map((det) => (
                            <div
                              key={det.id}
                              className={`border px-2 py-1 text-[9px] font-black uppercase flex items-center justify-between ${
                                det.is_present === 1 ? 'bg-green-50 border-green-600 text-green-700' : 'bg-red-50 border-red-600 text-red-700'
                              }`}
                            >
                              <span>{det.student_name}</span>
                              <span>{det.is_present === 1 ? 'HADIR' : 'ABSEN'}</span>
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

    </div>
  );
}
