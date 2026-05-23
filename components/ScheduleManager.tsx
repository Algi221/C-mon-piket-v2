'use client';

import React, { useState } from 'react';
import { Calendar, Users, Edit3, Check, Star, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { db, User, Schedule } from '../lib/db';

interface ScheduleManagerProps {
  currentUser: User | null;
  students: User[];
  schedules: Schedule[];
  onActionComplete: () => void;
}

export default function ScheduleManager({ currentUser, students, schedules, onActionComplete }: ScheduleManagerProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [assignedRoster, setAssignedRoster] = useState<{ userId: number; isPj: boolean }[]>([]);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  const colorMap: { [key: string]: string } = {
    'Senin': 'bg-yellow-300',
    'Selasa': 'bg-pink-300',
    'Rabu': 'bg-cyan-300',
    'Kamis': 'bg-green-300',
    'Jumat': 'bg-purple-300',
  };

  const handleEditClick = (day: string) => {
    if (!currentUser || currentUser.role !== 'guru') {
      alert('Akses Ditolak! Hanya guru yang diizinkan untuk mengubah jadwal roster piket.');
      return;
    }

    setSelectedDay(day);
    // Fetch currently assigned students with isPj values for this day
    const dayAssignments = schedules
      .filter((s) => s.day === day)
      .map((s) => ({
        userId: s.user_id,
        isPj: s.is_pj,
      }));
    setAssignedRoster(dayAssignments);
  };

  const toggleStudentSelection = (studentId: number) => {
    const isAlreadyAssigned = assignedRoster.some(r => r.userId === studentId);
    if (isAlreadyAssigned) {
      setAssignedRoster(assignedRoster.filter(r => r.userId !== studentId));
    } else {
      setAssignedRoster([...assignedRoster, { userId: studentId, isPj: false }]);
    }
  };

  const setPJStudent = (studentId: number) => {
    setAssignedRoster(assignedRoster.map(r => ({
      ...r,
      isPj: r.userId === studentId, // Mark selected student as PJ, set others to false
    })));
  };

  const handleSave = async () => {
    if (!selectedDay) return;
    setSaving(true);
    try {
      await db.setSchedule(selectedDay, assignedRoster);
      setSelectedDay(null);
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert('Gagal memperbarui roster jadwal.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 font-sans md:p-6 animate-fade-in">
      
      {/* Header Info Banner */}
      <div className="mb-8 border-4 border-black bg-cyan-300 p-6 shadow-[6px_6px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
            <Calendar className="h-10 w-10 stroke-[3px]" />
            JADWAL PIKET KELAS
          </h1>
          <p className="mt-2 text-sm font-bold text-zinc-800 uppercase">
            Jadwal pembagian regu piket kelas Senin sampai Jumat. Klik &apos;Edit Roster&apos; untuk mengatur anggota atau menunjuk Penanggung Jawab!
          </p>
        </div>
        
        <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase text-center shrink-0">
          👑 PJ PIKET BERTANGGUNG JAWAB MEMANDU REGU
        </div>
      </div>

      {/* Roster Calendar Board */}
      <div className="grid gap-6 md:grid-cols-5">
        {daysOfWeek.map((day) => {
          const daySchedules = schedules.filter((s) => s.day === day);
          const bgHeader = colorMap[day] || 'bg-zinc-300';

          return (
            <div
              key={day}
              className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_#000000] flex flex-col justify-between"
            >
              <div>
                {/* Day Header */}
                <div className={`border-b-4 border-black p-3 ${bgHeader} text-center`}>
                  <h2 className="text-2xl font-black uppercase text-black leading-none">{day}</h2>
                  <span className="text-[10px] font-black text-zinc-700 uppercase">
                    {daySchedules.length} PETUGAS
                  </span>
                </div>

                {/* Duty List */}
                <div className="p-4 space-y-3">
                  {daySchedules.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200">
                      <Users className="mx-auto h-8 w-8 stroke-[2px] mb-1 opacity-50" />
                      <p className="text-xs uppercase">Belum ada petugas</p>
                    </div>
                  ) : (
                    daySchedules.map((item) => {
                      const s = item.student;
                      if (!s) return null;
                      return (
                        <div
                          key={item.id}
                          className={`border-2 border-black p-2 shadow-[2px_2px_0px_0px_#000000] transition-all flex items-center justify-between ${
                            item.is_pj ? 'bg-yellow-50' : 'bg-zinc-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-black truncate leading-tight uppercase flex items-center gap-1">
                              {item.is_pj && <Star className="h-3 w-3 fill-yellow-400 stroke-black shrink-0" />}
                              <span className="truncate">{s.name}</span>
                            </p>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">
                              NO: {s.nipd} {item.is_pj ? '• PJ KELAS' : '• Anggota'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Button - Only enabled/visible for Guru */}
              <div className="p-3 border-t-2 border-black">
                {currentUser && currentUser.role === 'guru' ? (
                  <button
                    onClick={() => handleEditClick(day)}
                    className="w-full border-2 border-black bg-white px-2 py-2 text-xs font-black uppercase text-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 stroke-[3px]" />
                    EDIT ROSTER
                  </button>
                ) : (
                  <div className="text-center py-2 text-[9px] font-black uppercase text-zinc-400 border border-dashed border-zinc-200">
                    Hanya Edit Guru
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Schedules Modal Overlay */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-sans p-4 overflow-y-auto">
          <div className="w-full max-w-xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000] relative animate-scale-in my-8">
            
            {/* Modal Title */}
            <div className="border-b-4 border-black pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className={`border-2 border-black ${colorMap[selectedDay] || 'bg-yellow-300'} px-2.5 py-0.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000]`}>
                  PENGATURAN ROSTER GURU
                </span>
                <h3 className="text-3xl font-black uppercase text-black mt-1 leading-none">
                  Roster Hari {selectedDay}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-red-400 text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold"
              >
                ✕
              </button>
            </div>

            {/* Checklist of all students with PJ selectors */}
            <div className="space-y-4">
              <div className="border-2 border-black bg-cyan-50 p-3 text-xs font-bold text-cyan-900 flex items-start gap-2 shadow-[2px_2px_0px_0px_#000000]">
                <Info className="h-4.5 w-4.5 stroke-[2.5px] text-cyan-700 shrink-0 mt-0.5" />
                <span>
                  Centang siswa piket hari **{selectedDay.toUpperCase()}**, lalu ketuk bintang kuning 👑 untuk menunjuk penanggung jawab regu.
                </span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-black mb-2">
                  Daftar Anggota Siswa Kelas ({students.length})
                </label>
                
                {students.length === 0 ? (
                  <p className="text-xs font-bold text-red-500 uppercase">
                    Tidak ada siswa terdaftar! Silakan tambahkan siswa di menu Kelola Siswa.
                  </p>
                ) : (
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 max-h-56 overflow-y-auto border-4 border-black p-3 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                    {students.map((student) => {
                      const rosterIndex = assignedRoster.findIndex(r => r.userId === student.id);
                      const isSelected = rosterIndex !== -1;
                      const isPj = isSelected ? assignedRoster[rosterIndex].isPj : false;

                      return (
                        <div
                          key={student.id}
                          className={`flex items-center justify-between p-2 border-2 transition-all ${
                            isSelected
                              ? 'bg-yellow-100 border-black shadow-[1.5px_1.5px_0px_0px_#000000]'
                              : 'bg-white border-zinc-200 hover:border-black'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleStudentSelection(student.id)}
                            className="flex-1 flex items-center gap-2 text-left font-bold text-xs uppercase truncate cursor-pointer"
                          >
                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center border-2 border-black ${isSelected ? 'bg-black text-white' : 'bg-white'}`}>
                              {isSelected && <Check className="h-3 w-3 stroke-[4px]" />}
                            </span>
                            <span className="truncate">{student.name}</span>
                          </button>

                          {isSelected && (
                            <button
                              type="button"
                              onClick={() => setPJStudent(student.id)}
                              title={isPj ? 'Penanggung Jawab Aktif' : 'Jadikan Penanggung Jawab'}
                              className={`h-7 w-7 border border-black flex items-center justify-center transition-all ${
                                isPj ? 'bg-yellow-300 shadow-[1px_1px_0px_0px_#000000]' : 'bg-white hover:bg-zinc-100'
                              } cursor-pointer`}
                            >
                              <Star className={`h-4 w-4 stroke-[2.5px] ${isPj ? 'fill-yellow-500 text-black' : 'text-zinc-400'}`} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t-2 border-black pt-4">
                <span className="text-xs font-black uppercase text-zinc-500">
                  {assignedRoster.length} Siswa Terdaftar
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAssignedRoster([])}
                    className="border border-black bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 text-xs font-bold uppercase cursor-pointer"
                  >
                    KOSONGKAN
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="border-2 border-black bg-emerald-300 px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
                  >
                    {saving ? 'MENYIMPAN...' : 'SIMPAN ROSTER'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
