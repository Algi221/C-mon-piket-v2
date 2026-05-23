'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Image as ImageIcon, Sparkles, Calendar, Check, ExternalLink } from 'lucide-react';
import { db, PiketLog } from '../lib/db';

interface AttendanceLogsProps {
  logs: PiketLog[];
}

export default function AttendanceLogs({ logs }: AttendanceLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) =>
    log.student_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl p-4 font-sans md:p-6">
      {/* Page Header */}
      <div className="mb-8 border-4 border-black bg-pink-300 p-6 shadow-[6px_6px_0px_0px_#000000]">
        <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
          <BookOpen className="h-10 w-10 stroke-[3px]" />
          LOG ABSENSI & LAPORAN
        </h1>
        <p className="mt-2 text-sm font-bold text-zinc-800 uppercase">
          Daftar riwayat piket harian siswa. Klik gambar bukti piket untuk memperbesar tampilan foto!
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-8 border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000000] flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full flex-1">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[3px] text-zinc-400" />
          <input
            type="text"
            placeholder="CARI NAMA SISWA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-4 border-black bg-zinc-50 py-3 pl-11 pr-4 font-black uppercase text-black placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
          />
        </div>
        <div className="shrink-0 font-black text-sm uppercase border-2 border-black bg-yellow-300 px-4 py-3 shadow-[2px_2px_0px_0px_#000000]">
          Total Data: {filteredLogs.length} Laporan
        </div>
      </div>

      {/* Logs Cards Grid */}
      {filteredLogs.length === 0 ? (
        <div className="border-4 border-dashed border-zinc-300 bg-white p-12 text-center shadow-[4px_4px_0px_0px_#000000]">
          <BookOpen className="mx-auto h-16 w-16 text-zinc-300 stroke-[2.5px] mb-2" />
          <h2 className="text-xl font-black text-zinc-400 uppercase">Tidak Ada Riwayat Piket!</h2>
          <p className="text-xs font-bold text-zinc-400 uppercase mt-1">Belum ada siswa yang melaporkan piket atau pencarian tidak ditemukan.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredLogs.map((log) => {
            const formatTime = (isoString: string) => {
              try {
                const date = new Date(isoString);
                return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              } catch (e) {
                return '00:00';
              }
            };

            const formatDate = (isoString: string) => {
              try {
                const date = new Date(isoString);
                return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
              } catch (e) {
                return log.date;
              }
            };

            return (
              <div
                key={log.id}
                className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000000] transition-all"
              >
                <div>
                  {/* Card Header */}
                  <div className="border-b-2 border-black p-3 bg-zinc-50 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-black text-zinc-700 uppercase">
                      <Calendar className="h-3.5 w-3.5 stroke-[2.5px]" />
                      {formatDate(log.created_at)}
                    </span>
                    <span className="border border-black bg-green-300 text-[10px] font-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000] uppercase">
                      +{log.points_awarded} POIN
                    </span>
                  </div>

                  {/* Image Proof */}
                  {log.photo_url && (
                    <div 
                      onClick={() => setSelectedPhoto(log.photo_url || null)}
                      className="border-b-2 border-black h-40 w-full relative overflow-hidden bg-zinc-900 cursor-pointer group"
                    >
                      <img 
                        src={log.photo_url} 
                        alt="Bukti Piket" 
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-black text-xs uppercase">
                        <ExternalLink className="h-4 w-4 stroke-[3px]" />
                        Perbesar Foto
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-4">
                    <h3 className="text-xl font-black text-black leading-none uppercase">{log.student_name}</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">Pukul: {formatTime(log.created_at)} WIB</p>
                    
                    {log.notes && (
                      <p className="mt-3 border-l-4 border-black bg-zinc-50 p-2 text-xs font-bold text-zinc-700 uppercase leading-relaxed">
                        &ldquo;{log.notes}&rdquo;
                      </p>
                    )}

                    {/* Task checklist completed */}
                    <div className="mt-4">
                      <p className="text-[9px] font-black uppercase text-zinc-400 mb-1.5">Tugas Selesai:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {log.completed_tasks.map((task, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1 border border-black bg-cyan-100 px-1.5 py-0.5 text-[9px] font-black uppercase"
                          >
                            <Check className="h-2.5 w-2.5 stroke-[4px] text-cyan-800" />
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-black bg-zinc-50 text-[10px] font-black uppercase text-zinc-500 text-center">
                  LOG ID: {log.id}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Zoom Modal Overlay */}
      {selectedPhoto && (
        <div 
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-pointer"
        >
          <div className="relative border-4 border-black bg-white p-2 shadow-[8px_8px_0px_0px_#000000] max-w-2xl max-h-[85vh] overflow-hidden animate-scale-in">
            <img src={selectedPhoto} alt="Bukti Piket Zoom" className="max-w-full max-h-[75vh] object-contain" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-red-400 text-black border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000000]"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
