'use client';

import React, { useState } from 'react';
import { Calendar, Users, Edit3, Check, Trash2, Shuffle, Info, AlertTriangle } from 'lucide-react';
import { db, Student, DutySchedule } from '../lib/db';

interface ScheduleManagerProps {
  students: Student[];
  schedules: DutySchedule[];
  onActionComplete: () => void;
}

export default function ScheduleManager({ students, schedules, onActionComplete }: ScheduleManagerProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
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
    setSelectedDay(day);
    // Find students currently assigned to this day
    const currentAssignments = schedules
      .filter((s) => s.day === day)
      .map((s) => s.student_id);
    setAssignedStudentIds(currentAssignments);
  };

  const toggleStudentSelection = (studentId: string) => {
    if (assignedStudentIds.includes(studentId)) {
      setAssignedStudentIds(assignedStudentIds.filter((id) => id !== studentId));
    } else {
      setAssignedStudentIds([...assignedStudentIds, studentId]);
    }
  };

  const handleSave = async () => {
    if (!selectedDay) return;
    setSaving(true);
    try {
      await db.setSchedule(selectedDay, assignedStudentIds);
      setSelectedDay(null);
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert('Gagal memperbarui jadwal piket.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 font-sans md:p-6">
      
      {/* Header Info Banner */}
      <div className="mb-8 border-4 border-black bg-cyan-300 p-6 shadow-[6px_6px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
            <Calendar className="h-10 w-10 stroke-[3px]" />
            JADWAL PIKET KELAS
          </h1>
          <p className="mt-2 text-sm font-bold text-zinc-800 uppercase">
            Kelola pembagian regu piket kelas dari Senin sampai Jumat. Klik &apos;Edit Petugas&apos; pada hari terkait untuk mengubah regu!
          </p>
        </div>
        
        <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0px_0px_#000000] text-xs font-black uppercase text-center shrink-0">
          🔥 STREAK DIBERIKAN UNTUK PIKET BERUNTUN
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
                          className="border-2 border-black p-2 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000] hover:bg-white transition-all flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-black text-black truncate leading-tight uppercase">
                              {s.name}
                            </p>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase">
                              No. {s.roll_number} • Poin: {s.points}
                            </p>
                          </div>
                          {s.streak > 0 && (
                            <span className="text-[9px] font-black bg-red-100 text-red-700 border border-red-700 px-1 py-0.2 shrink-0">
                              🔥 {s.streak}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-3 border-t-2 border-black">
                <button
                  onClick={() => handleEditClick(day)}
                  className="w-full border-2 border-black bg-white px-2 py-2 text-xs font-black uppercase text-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5 stroke-[3px]" />
                  EDIT PETUGAS
                </button>
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
                  PENGATURAN ROSTER
                </span>
                <h3 className="text-3xl font-black uppercase text-black mt-1 leading-none">
                  Atur Petugas Hari {selectedDay}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-red-400 text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold"
              >
                ✕
              </button>
            </div>

            {/* Checklist of all students */}
            <div className="space-y-4">
              <div className="border-2 border-black bg-amber-50 p-3 text-xs font-bold text-amber-900 flex items-start gap-2 shadow-[2px_2px_0px_0px_#000000]">
                <Info className="h-4 w-4 stroke-[3px] text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Centang nama siswa yang ingin Anda tugaskan untuk piket di hari **{selectedDay.toUpperCase()}**.
                </span>
              </div>

              <div>
                <label className="block text-sm font-black uppercase text-black mb-2">
                  Daftar Siswa Kelas ({students.length})
                </label>
                
                {students.length === 0 ? (
                  <p className="text-sm font-bold text-red-500 uppercase">
                    Tidak ada siswa terdaftar! Silakan tambahkan siswa di menu Manajemen Siswa.
                  </p>
                ) : (
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 max-h-60 overflow-y-auto border-4 border-black p-3 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                    {students.map((student) => {
                      const isSelected = assignedStudentIds.includes(student.id);
                      return (
                        <button
                          type="button"
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`flex items-center gap-2 p-2 border-2 text-left font-bold text-xs uppercase transition-all truncate ${
                            isSelected
                              ? 'bg-yellow-100 border-black shadow-[1.5px_1.5px_0px_0px_#000000]'
                              : 'bg-white border-zinc-300 hover:border-black'
                          }`}
                        >
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center border-2 border-black ${isSelected ? 'bg-black text-white' : 'bg-white'}`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[4px]" />}
                          </span>
                          <span className="truncate">{student.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t-2 border-black pt-4">
                <span className="text-xs font-black uppercase text-zinc-500">
                  {assignedStudentIds.length} Siswa Terpilih
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAssignedStudentIds([])}
                    className="border border-black bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 text-xs font-bold uppercase"
                  >
                    KOSONGKAN
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="border-2 border-black bg-emerald-300 px-4 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none"
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
