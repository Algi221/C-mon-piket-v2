'use client';

import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Check, X, ArrowLeft, ArrowRight, Eye, Video, FileText } from 'lucide-react';
import { Report } from '../lib/db';

interface CalendarHistoryProps {
  logs: Report[];
}

export default function CalendarHistory({ logs }: CalendarHistoryProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 23)); // Set default to May 2026
  const [selectedDateString, setSelectedDateString] = useState<string | null>(null);

  // Month names Indonesian
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Change Month Handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDateString(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDateString(null);
  };

  // Get days in month
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  
  // Get start weekday (0 = Sunday, 1 = Monday...)
  const startDayIndex = useMemo(() => {
    const day = new Date(year, month, 1).getDay();
    // Align with Monday as start day: (day + 6) % 7
    return day === 0 ? 6 : day - 1;
  }, [year, month]);

  // Verified days lookup mapping (format YYYY-MM-DD -> Report[])
  const reportsByDate = useMemo(() => {
    const mapping: { [dateStr: string]: Report[] } = {};
    logs.forEach((log) => {
      // Clean date formatting
      const dateKey = log.date;
      if (!mapping[dateKey]) mapping[dateKey] = [];
      mapping[dateKey].push(log);
    });
    return mapping;
  }, [logs]);

  // Generate calendar cells
  const calendarCells = useMemo(() => {
    const cells = [];
    
    // Empty prefix cells
    for (let i = 0; i < startDayIndex; i++) {
      cells.push({ dayNum: null, dateStr: '' });
    }

    // Active days
    for (let i = 1; i <= daysInMonth; i++) {
      const padM = String(month + 1).padStart(2, '0');
      const padD = String(i).padStart(2, '0');
      const dateStr = `${year}-${padM}-${padD}`;
      cells.push({ dayNum: i, dateStr });
    }

    return cells;
  }, [daysInMonth, startDayIndex, year, month]);

  // Details of report selected
  const activeReports = selectedDateString ? (reportsByDate[selectedDateString] || []) : [];

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
    <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] font-sans">
      
      {/* Calendar Header Switcher */}
      <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
        <h2 className="text-2xl font-black uppercase flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 stroke-[3px] text-pink-500" />
          Riwayat Kalender Piket
        </h2>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="flex h-9 w-9 items-center justify-center border-2 border-black bg-yellow-300 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer font-bold text-sm"
          >
            ◀
          </button>
          <span className="font-black uppercase text-sm border-2 border-black bg-zinc-900 text-white px-4 py-1.5 shadow-[2px_2px_0px_0px_#000000]">
            {monthNames[month].toUpperCase()} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="flex h-9 w-9 items-center justify-center border-2 border-black bg-yellow-300 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer font-bold text-sm"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* Calendar Grid Box */}
        <div className="lg:col-span-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 text-center font-black text-xs uppercase mb-2">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
              <div key={d} className="border-2 border-black bg-zinc-100 py-1.5 shadow-[1.5px_1.5px_0px_0px_#000000]">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cell grids */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              if (cell.dayNum === null) {
                return (
                  <div key={`empty-${idx}`} className="aspect-square border border-dashed border-zinc-200" />
                );
              }

              const dayReports = reportsByDate[cell.dateStr] || [];
              const isVerified = dayReports.some((r) => r.status === 'verified');
              const isPending = dayReports.some((r) => r.status === 'pending');
              const isSelected = selectedDateString === cell.dateStr;

              let cellBg = 'bg-white hover:bg-zinc-50';
              if (isVerified) {
                cellBg = 'bg-green-400 font-black text-black';
              } else if (isPending) {
                cellBg = 'bg-yellow-300 font-bold text-black';
              }

              const borderClass = isSelected ? 'border-4 border-pink-500' : 'border-2 border-black';

              return (
                <button
                  key={cell.dateStr}
                  onClick={() => setSelectedDateString(cell.dateStr)}
                  className={`aspect-square ${cellBg} ${borderClass} flex flex-col justify-between p-1.5 shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-left`}
                >
                  <span className="text-xs font-black">{cell.dayNum}</span>
                  {dayReports.length > 0 && (
                    <span className="h-2 w-2 rounded-full border border-black bg-black block self-end" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-bold uppercase justify-center">
            <div className="flex items-center gap-1.5">
              <div className="h-4.5 w-4.5 border-2 border-black bg-green-400 shadow-[1.5px_1.5px_0px_0px_#000000]" />
              <span>Piket Disetujui (Hijau)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4.5 w-4.5 border-2 border-black bg-yellow-300 shadow-[1.5px_1.5px_0px_0px_#000000]" />
              <span>Piket Pending (Kuning)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-4.5 w-4.5 border-2 border-black bg-white shadow-[1.5px_1.5px_0px_0px_#000000]" />
              <span>Belum Ada Piket</span>
            </div>
          </div>
        </div>

        {/* Selected Date Reports Details */}
        <div className="lg:col-span-2 border-4 border-black bg-zinc-50 p-4 shadow-[4px_4px_0px_0px_#000000] overflow-y-auto max-h-[50vh]">
          {selectedDateString ? (
            <div>
              <h3 className="text-lg font-black uppercase mb-4 border-b-2 border-black pb-2 flex items-center justify-between">
                <span>Rincian: {selectedDateString}</span>
                <span className="border border-black bg-yellow-300 text-[10px] font-black px-2 py-0.5 uppercase">
                  {activeReports.length} LAPORAN
                </span>
              </h3>

              {activeReports.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 font-bold uppercase text-xs">
                  <FileText className="mx-auto h-10 w-10 opacity-40 mb-1" />
                  Tidak ada laporan piket dikirim pada tanggal ini.
                </div>
              ) : (
                <div className="space-y-6">
                  {activeReports.map((report) => {
                    const media = parseReportMedia(report.image_path);
                    return (
                      <div key={report.id} className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_#000000] space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-black">Oleh: {report.reporter_name}</span>
                          <span className={`border px-2 py-0.5 text-[9px] font-black uppercase ${
                            report.status === 'verified' ? 'bg-green-100 border-green-700 text-green-800' : 'bg-yellow-100 border-yellow-700 text-yellow-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>

                        {report.notes && (
                          <p className="text-xs font-bold text-zinc-700 bg-zinc-50 border-l-4 border-black p-2 italic leading-relaxed uppercase">
                            &ldquo;{report.notes}&rdquo;
                          </p>
                        )}

                        {/* Attendees checklist */}
                        {report.details && report.details.length > 0 && (
                          <div>
                            <span className="text-[8px] font-black text-zinc-400 uppercase block mb-1">Kehadiran Petugas:</span>
                            <div className="flex flex-wrap gap-1">
                              {report.details.map((det) => (
                                <span
                                  key={det.id}
                                  className={`border px-1.5 py-0.2 text-[9px] font-black uppercase flex items-center gap-1 ${
                                    det.is_present === 1 ? 'bg-green-100 border-green-700 text-green-800' : 'bg-red-100 border-red-700 text-red-800'
                                  }`}
                                >
                                  {det.is_present === 1 ? <Check className="h-3 w-3 stroke-[4px]" /> : <X className="h-3 w-3 stroke-[4px]" />}
                                  {det.student_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Photos Gallery */}
                        {media.images.length > 0 && (
                          <div>
                            <span className="text-[8px] font-black text-zinc-400 uppercase block mb-1">Foto Bukti ({media.images.length}):</span>
                            <div className="grid grid-cols-3 gap-2">
                              {media.images.map((imgUrl, i) => (
                                <a 
                                  key={i} 
                                  href={imgUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="border border-black aspect-square overflow-hidden bg-zinc-900 block group relative max-h-20"
                                >
                                  <img src={imgUrl} alt={`Bukti ${i+1}`} className="object-cover h-full w-full group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-black uppercase">
                                    <Eye className="h-3 w-3" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Video Proof */}
                        {media.video && (
                          <div>
                            <span className="text-[8px] font-black text-zinc-400 uppercase block mb-1">Video Bukti:</span>
                            <div className="border border-black overflow-hidden bg-zinc-900 max-h-40 rounded">
                              <video src={media.video} controls className="w-full max-h-40 object-cover" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-400 font-bold uppercase text-xs">
              <CalendarIcon className="mx-auto h-12 w-12 opacity-30 mb-2" />
              PILIH TANGGAL DI KALENDER UNTUK MELIHAT ABSENSI & BUKTI PIKET
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
