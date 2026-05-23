'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, Sparkles, AlertCircle, Camera, Check, Plus, ClipboardList } from 'lucide-react';
import { db, Student, DutySchedule, PiketTask, PiketLog } from '../lib/db';
import confetti from 'canvas-confetti';

interface DashboardProps {
  students: Student[];
  schedules: DutySchedule[];
  tasks: PiketTask[];
  onActionComplete: () => void;
}

export default function Dashboard({ students, schedules, tasks, onActionComplete }: DashboardProps) {
  const [currentDay, setCurrentDay] = useState('');
  const [currentDateString, setCurrentDateString] = useState('');
  const [liveTime, setLiveTime] = useState('');
  const [todaySchedule, setTodaySchedule] = useState<DutySchedule[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]); // Student IDs who completed today
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Time & Date effect
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

  // Fetch today's schedule and today's logs to see who completed duty
  useEffect(() => {
    if (!currentDay) return;

    // Filter schedules for today
    const filteredToday = schedules.filter((s) => s.day === currentDay);
    setTodaySchedule(filteredToday);

    // Fetch logs to check who has checked off today
    const checkCompletion = async () => {
      try {
        const logs = await db.getLogs();
        const todayStr = new Date().toISOString().split('T')[0];
        const doneTodayIds = logs
          .filter((l) => l.date === todayStr)
          .map((l) => l.student_id);
        
        setCompletedToday(doneTodayIds);
      } catch (e) {
        console.error('Failed to load logs on dashboard:', e);
      }
    };

    checkCompletion();
  }, [currentDay, schedules, completedToday.length]);

  // Handle Photo proof selection (Base64 file reader)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        setImageUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Choose preset images
  const selectPresetImage = (url: string) => {
    setImagePreview(url);
    setImageUrl(url);
  };

  const presetImages = [
    { name: 'Sapu Bersih', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80' },
    { name: 'Pel Wangi', url: 'https://images.unsplash.com/photo-1603712726208-41d72402f127?auto=format&fit=crop&w=400&q=80' },
    { name: 'Meja Rapi', url: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&w=400&q=80' },
  ];

  // Submit Piket Laporan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (selectedTasks.length === 0) {
      alert('Tolong pilih minimal satu tugas yang diselesaikan!');
      return;
    }

    try {
      await db.createLog(
        selectedStudent.id,
        selectedTasks,
        notes,
        imageUrl || presetImages[0].url
      );

      // Trigger Confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#F472B6', '#22D3EE', '#4ADE80', '#C084FC']
      });

      // Clear Form & Refresh State
      setSelectedStudent(null);
      setSelectedTasks([]);
      setNotes('');
      setImageUrl('');
      setImagePreview(null);
      
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert('Gagal mengirimkan laporan piket.');
    }
  };

  const toggleTask = (taskName: string) => {
    if (selectedTasks.includes(taskName)) {
      setSelectedTasks(selectedTasks.filter((t) => t !== taskName));
    } else {
      setSelectedTasks([...selectedTasks, taskName]);
    }
  };

  const selectAllTasks = () => {
    const activeTaskNames = tasks.filter(t => t.is_active).map(t => t.name);
    setSelectedTasks(activeTaskNames);
  };

  return (
    <div className="mx-auto max-w-4xl p-4 font-sans md:p-6">
      
      {/* Dynamic Neubrutalism Header Panel */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        
        {/* Welcome Block */}
        <div className="border-4 border-black bg-yellow-300 p-6 shadow-[6px_6px_0px_0px_#000000] md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="inline-block border-2 border-black bg-white px-2 py-0.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] mb-2 animate-bounce">
              ⚡ LIVE REPORT
            </span>
            <h1 className="text-4xl font-black tracking-tight text-black uppercase leading-none mt-1">
              Sistem Rapor & Piket Kelas
            </h1>
            <p className="mt-3 text-sm font-bold text-zinc-900 uppercase">
              Pantau jadwal harian, lapor piket dengan foto bukti, kumpulkan poin dan raih peringkat teratas di papan juara kelas!
            </p>
          </div>
          
          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm font-black border-2 border-black bg-white px-2 py-1 shadow-[2px_2px_0px_0px_#000000] uppercase">
              JUMAT: {schedules.filter(s => s.day === 'Jumat').length} SISWA
            </span>
            <span className="text-sm font-black border-2 border-black bg-white px-2 py-1 shadow-[2px_2px_0px_0px_#000000] uppercase">
              TOTAL MEMBER: {students.length}
            </span>
          </div>
        </div>

        {/* Live Clock Block */}
        <div className="border-4 border-black bg-cyan-300 p-6 shadow-[6px_6px_0px_0px_#000000] flex flex-col justify-between">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black text-sm uppercase">Waktu Saat Ini</span>
            <Clock className="h-5 w-5 stroke-[3px]" />
          </div>
          <div className="py-4 text-center">
            <p className="text-5xl font-black tracking-widest text-black tabular-nums">{liveTime || '00:00:00'}</p>
            <p className="text-xs font-black uppercase mt-1 tracking-wider">{currentDay}, {currentDateString}</p>
          </div>
          <div className="border-t-2 border-black pt-2 text-center text-xs font-bold uppercase text-zinc-800">
            Piket selesai sebelum jam pulang!
          </div>
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        
        {/* Today's Piket List */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] md:col-span-2">
          <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6 stroke-[3px] text-pink-500" />
            Petugas Piket Hari Ini ({currentDay})
          </h2>

          {todaySchedule.length === 0 ? (
            <div className="border-4 border-dashed border-zinc-300 p-8 text-center rounded-sm">
              <AlertCircle className="mx-auto h-12 w-12 text-zinc-400 stroke-[2px] mb-2" />
              <p className="text-lg font-black text-zinc-400 uppercase">Tidak ada jadwal piket hari ini!</p>
              <p className="text-sm font-bold text-zinc-400 uppercase">Silakan periksa halaman Jadwal untuk mengatur.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {todaySchedule.map((item) => {
                const isCompleted = completedToday.includes(item.student_id);
                const s = item.student;
                if (!s) return null;

                return (
                  <div
                    key={item.id}
                    className={`border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000000] transition-all flex flex-col justify-between ${
                      isCompleted ? 'bg-green-100 hover:shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5' : 'bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000000]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="border-2 border-black bg-zinc-900 px-2 py-0.5 text-xs font-black text-white uppercase">
                          No. {s.roll_number}
                        </span>
                        
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-xs font-black text-green-700 bg-green-200 border-2 border-green-700 px-1.5 py-0.5 uppercase">
                            <Check className="h-3 w-3 stroke-[3px]" /> Selesai
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-black text-red-700 bg-red-100 border-2 border-red-700 px-1.5 py-0.5 uppercase">
                            Belum Piket
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-black leading-none my-1">{s.name}</h3>
                      <p className="text-xs font-bold text-zinc-500 uppercase mt-1">Total Poin: {s.points} • Streak 🔥: {s.streak}</p>
                    </div>

                    <div className="mt-4">
                      {isCompleted ? (
                        <div className="w-full border-2 border-green-600 bg-green-50 text-center py-2 text-xs font-black uppercase text-green-700 flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-4 w-4 stroke-[3px]" />
                          Laporan Masuk (+15 Poin)
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="w-full border-2 border-black bg-pink-400 text-center py-2 text-xs font-black uppercase text-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 active:bg-pink-300"
                        >
                          LAPOR PIKET SEKARANG
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Panel / Quick stats */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
          <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 stroke-[3px] text-yellow-500" />
            Petunjuk Tugas
          </h2>
          
          <ul className="space-y-3 font-bold text-zinc-800 text-xs uppercase">
            {tasks.filter(t => t.is_active).map((task) => (
              <li key={task.id} className="flex items-start gap-2 border-2 border-black p-2 bg-zinc-50 shadow-[2px_2px_0px_0px_#000000]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center border-2 border-black bg-yellow-300 text-xs font-black">
                  ✔
                </span>
                <span>{task.name}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-4 border-black bg-purple-100 p-4 shadow-[4px_4px_0px_0px_#000000]">
            <p className="text-xs font-black uppercase flex items-center gap-1 mb-1">
              <Sparkles className="h-4 w-4 stroke-[3px] text-purple-600 animate-spin" />
              SISTEM POIN
            </p>
            <p className="text-xs font-bold text-zinc-800 uppercase leading-relaxed">
              Setiap pelaporan piket yang berhasil disubmit akan memberikan **+15 Poin** kepada petugas yang piket, serta meningkatkan streak mereka!
            </p>
          </div>
        </div>

      </div>

      {/* Report Duty Modal Overlay */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 font-sans p-4 overflow-y-auto">
          <div className="w-full max-w-lg border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000] relative animate-scale-in my-8">
            
            {/* Modal Title */}
            <div className="border-b-4 border-black pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className="border-2 border-black bg-yellow-300 px-2 py-0.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                  FORM ABSENSI
                </span>
                <h3 className="text-2xl font-black uppercase text-black mt-1 leading-none">
                  Lapor Piket: {selectedStudent.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedStudent(null);
                  setSelectedTasks([]);
                  setNotes('');
                  setImageUrl('');
                  setImagePreview(null);
                }}
                className="flex h-10 w-10 items-center justify-center border-2 border-black bg-red-400 text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Task list selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-black uppercase text-black">Tugas yang Diselesaikan</label>
                  <button 
                    type="button" 
                    onClick={selectAllTasks}
                    className="border border-black bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 text-xs font-bold uppercase"
                  >
                    PILIH SEMUA
                  </button>
                </div>
                <div className="border-4 border-black p-3 space-y-2 max-h-40 overflow-y-auto shadow-[2px_2px_0px_0px_#000000] bg-zinc-50">
                  {tasks.filter((t) => t.is_active).map((task) => {
                    const isChecked = selectedTasks.includes(task.name);
                    return (
                      <button
                        type="button"
                        key={task.id}
                        onClick={() => toggleTask(task.name)}
                        className={`flex w-full items-center gap-2.5 p-1.5 border-2 text-left font-bold text-xs uppercase transition-all ${
                          isChecked 
                            ? 'bg-cyan-200 border-black shadow-[1px_1px_0px_0px_#000000]' 
                            : 'bg-white border-zinc-300 hover:border-black'
                        }`}
                      >
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center border-2 border-black ${isChecked ? 'bg-black text-white' : 'bg-white'}`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[4px]" />}
                        </span>
                        <span>{task.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Notes */}
              <div>
                <label className="block text-sm font-black uppercase text-black mb-1">Catatan / Laporan Tambahan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Lantai disapu bersih, sampah sudah dibuang ke bak luar, AC dimatikan."
                  rows={2}
                  className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                />
              </div>

              {/* Photo Proof (Custom Upload + Presets) */}
              <div>
                <label className="block text-sm font-black uppercase text-black mb-1">Foto Bukti Kebersihan</label>
                
                {/* File picker */}
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 border-4 border-dashed border-black bg-zinc-50 hover:bg-zinc-100 p-2 font-black text-xs uppercase cursor-pointer shadow-[2px_2px_0px_0px_#000000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all">
                    <Camera className="h-4 w-4 stroke-[3px]" />
                    UPLOAD DARI GALERI
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>

                {/* Preset Options if user doesn't have camera ready */}
                <div className="mt-2">
                  <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">ATAU GUNAKAN FOTO SIMULASI:</p>
                  <div className="flex gap-2">
                    {presetImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectPresetImage(img.url)}
                        className={`flex-1 border-2 border-black p-1 text-[10px] font-bold uppercase transition-all shadow-[1.5px_1.5px_0px_0px_#000000] ${
                          imageUrl === img.url ? 'bg-pink-300' : 'bg-white hover:bg-zinc-100'
                        }`}
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Thumbnail */}
                {imagePreview && (
                  <div className="mt-3 border-4 border-black relative h-28 w-full overflow-hidden shadow-[2px_2px_0px_0px_#000000]">
                    <img src={imagePreview} alt="Bukti Piket" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageUrl('');
                      }}
                      className="absolute top-1.5 right-1.5 bg-red-400 text-black border-2 border-black px-1.5 py-0.5 text-[8px] font-black uppercase shadow-[1px_1px_0px_0px_#000000]"
                    >
                      BATAL
                    </button>
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full border-4 border-black bg-emerald-400 p-3 font-black text-sm uppercase text-black transition-all shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                KIRIM LAPORAN PIKET! 🚀
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
