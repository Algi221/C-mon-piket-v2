'use client';

import React, { useState } from 'react';
import { BookOpen, KeyRound, Sparkles, Smile, ShieldCheck, Flame, Star, AlertCircle, Quote, School } from 'lucide-react';
import { db, User } from '../lib/db';
import ScrollVelocity from './ScrollVelocity';
import confetti from 'canvas-confetti';

interface WelcomeProps {
  onLoginSuccess: (user: User) => void;
  currentUser: User | null;
  setCurrentTab: (tab: string) => void;
}

export default function Welcome({ onLoginSuccess, currentUser, setCurrentTab }: WelcomeProps) {
  const [nipd, setNipd] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Motivational Slogans
  const slogans = [
    { title: 'Tanggung Jawab Bersama', desc: 'Kebersihan kelas bukan tugas satu orang saja, melainkan cermin kerja sama kita semua!', color: 'bg-yellow-300' },
    { title: 'Belajar Lebih Nyaman', desc: 'Kelas yang bersih melahirkan suasana belajar yang kondusif untuk prestasi maksimal!', color: 'bg-cyan-300' },
    { title: 'Disiplin & Konsistensi', desc: 'Kebiasaan kecil membuang sampah pada tempatnya membentuk karakter disiplin masa depan!', color: 'bg-pink-300' }
  ];

  // Interactive Quotes
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const quotes = [
    "\"Kebersihan adalah sebagian dari iman. Mari kita jaga kelas kita dengan hati gembira.\" - Budaya Sekolah",
    "\"Kerja sama membuat beban yang berat terasa jauh lebih ringan. Semangat piket hari ini!\" - Kelas Unggul",
    "\"Disiplin dimulai dari hal-hal kecil seperti merapikan kursi setelah belajar.\" - Inspirasi Harian",
    "\"Hari ini bersih, esok hari berprestasi. Masa depan yang cerah dimulai dari kelas yang rapi!\" - Slogan Juara"
  ];

  const handleNextQuote = () => {
    setCurrentQuoteIdx((prev) => (prev + 1) % quotes.length);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nipd || !password) {
      setErrorMsg('NIPD / ID dan Password wajib diisi!');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const matchedUser = await db.verifyLogin(nipd, password);
      if (matchedUser) {
        // Confetti!
        confetti({
          particleCount: 150,
          spread: 60,
          origin: { y: 0.7 }
        });
        
        onLoginSuccess(matchedUser);
        setCurrentTab('dashboard'); // Redirect to dashboard
      } else {
        setErrorMsg('NIPD / Password salah! Silakan coba lagi.');
      }
    } catch (e: any) {
      setErrorMsg('Terjadi kesalahan saat masuk: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 font-sans md:p-6 animate-fade-in">
      
      {/* Slogan Hero Grid */}
      <div className="grid gap-8 lg:grid-cols-5 items-stretch mb-12">
        
        {/* Slogan Intro */}
        <div className="lg:col-span-3 border-4 border-black bg-yellow-300 p-8 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between">
          <div>
            <span className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] mb-4">
              ⚡ CMON PIKET V2
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-black leading-none uppercase">
              Kelas Bersih,<br />Belajar Lebih Nyaman!
            </h1>
            <p className="mt-4 text-xs sm:text-sm font-black text-zinc-900 leading-relaxed uppercase">
              Kombinasi Disiplin dan Kerja Sama untuk Kebersihan Bersama! Selamat datang di platform pencatatan roster piket kelas XI-J SMA Yadika 11.
            </p>
          </div>

          <div className="mt-8 border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Quote className="h-6 w-6 stroke-[3px] text-pink-500 shrink-0 mt-0.5" />
              <p className="text-xs font-black text-zinc-800 uppercase italic">
                {quotes[currentQuoteIdx]}
              </p>
            </div>
            <button
              onClick={handleNextQuote}
              className="border-2 border-black bg-cyan-300 hover:bg-cyan-200 px-3 py-1.5 text-[10px] font-black uppercase shrink-0 shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
            >
              ACAK ⚡
            </button>
          </div>
        </div>

        {/* Dynamic Login Block */}
        <div className="lg:col-span-2 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between">
          {currentUser ? (
            // Logged in View
            <div className="h-full flex flex-col justify-between py-4">
              <div>
                <span className="border-2 border-black bg-green-300 px-2 py-0.5 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000]">
                  AKTIF SESSION
                </span>
                <h2 className="text-2xl font-black uppercase mt-3 leading-tight truncate">
                  Halo, {currentUser.name}!
                </h2>
                <p className="text-xs font-bold text-zinc-500 uppercase mt-1">
                  Anda masuk sebagai **{currentUser.role.toUpperCase()}** (NIPD: {currentUser.nipd})
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="w-full border-2 border-black bg-cyan-300 p-3 font-black text-xs uppercase text-black transition-all shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
                >
                  BUKA BERANDA PIKET ➔
                </button>
                <div className="border-2 border-black bg-zinc-50 p-3 text-[10px] font-bold text-zinc-600 uppercase text-center">
                  Nikmati kemudahan pelaporan piket dengan verifikasi langsung oleh guru!
                </div>
              </div>
            </div>
          ) : (
            // Form Login View
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                  <KeyRound className="h-6 w-6 stroke-[3px] text-pink-500" />
                  MASUK SISTEM
                </h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">
                  Gunakan kredensial terdaftar di database untuk masuk
                </p>
              </div>

              {errorMsg && (
                <div className="border-2 border-black bg-red-100 p-3 text-[10px] font-bold text-red-700 flex items-start gap-2 shadow-[2px_2px_0px_0px_#000000]">
                  <AlertCircle className="h-4 w-4 stroke-[3px] text-red-700 shrink-0" />
                  <span className="uppercase">{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-0.5">NIPD / ID USER</label>
                  <input
                    type="text"
                    required
                    value={nipd}
                    onChange={(e) => setNipd(e.target.value)}
                    placeholder="Contoh: 0002 (Siswa) atau admin (Guru)"
                    className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-0.5">PASSWORD KREDENSIAL</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contoh: 123 (Siswa) atau admin (Guru)"
                    className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full border-2 border-black bg-pink-400 p-3.5 font-black text-xs uppercase text-black transition-all shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'MEMVERIFIKASI...' : 'MASUK KELAS! 🚀'}
              </button>

              <div className="border-t border-zinc-200 pt-3 text-[9px] font-bold text-zinc-400 uppercase text-center">
                STUDENT PASS: 123 | GURU PASS: admin
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Parallax Scroll Banner */}
      <div className="my-12 border-y-4 border-black bg-zinc-950 py-4 shadow-[4px_4px_0px_0px_#000000] relative overflow-hidden">
        <ScrollVelocity 
          texts={['XI-J YADIKA 11 PIKET', 'DISIPLIN KERJASAMA KONSISTENSI']} 
          velocity={15} 
          className="text-yellow-300 font-extrabold uppercase select-none font-sans text-xl md:text-3xl tracking-wider" 
        />
      </div>

      {/* School Illustration Decoration Block */}
      <div className="mb-12 grid gap-8 md:grid-cols-2 items-center">
        {/* Left Column: Slogan Callout */}
        <div className="border-4 border-black bg-purple-200 p-8 shadow-[6px_6px_0px_0px_#000000]">
          <h2 className="text-3xl font-black uppercase text-black mb-4">Kebersihan Bersama Untuk XI-J Yadika 11</h2>
          <p className="text-xs font-bold text-zinc-800 leading-relaxed uppercase space-y-3">
            Sistem piket ini dirancang khusus untuk mempererat kerja sama dan kedisiplinan siswa di kelas XI-J SMA Yadika 11. Setiap petugas piket berkontribusi langsung pada kesehatan, kebersihan, dan kenyamanan lingkungan belajar kelas kita.
          </p>
          <div className="mt-6 flex items-center gap-2 border-t-2 border-black pt-4">
            <School className="h-6 w-6 stroke-[2.5px] text-zinc-900" />
            <span className="text-[10px] font-black text-zinc-900 uppercase">SMA YADIKA 11 KELAS XI-J • KAMPUS RAMAH LINGKUNGAN</span>
          </div>
        </div>

        {/* Right Column: Premium Illustration Frame */}
        <div className="border-4 border-black bg-white p-3 shadow-[6px_6px_0px_0px_#000000] rounded-sm">
          <div className="border-2 border-black relative overflow-hidden bg-zinc-100 max-h-[420px] aspect-[9/16] flex items-center justify-center">
            <img src="/welcome_piket.png" alt="Siswa Piket Yadika 11" className="object-cover w-full h-full max-h-[410px]" />
          </div>
        </div>
      </div>

      {/* Slogan Details Section */}
      <h2 className="text-3xl font-black uppercase text-center mb-8">Pilar Kebersihan Kelas Kita</h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        {slogans.map((slo, idx) => (
          <div
            key={idx}
            className="border-4 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000000] transition-all flex flex-col justify-between"
          >
            <div>
              <div className={`h-12 w-12 border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center mb-4 ${slo.color}`}>
                {idx === 0 ? <Smile className="h-6 w-6 stroke-[3px]" /> : idx === 1 ? <BookOpen className="h-6 w-6 stroke-[3px]" /> : <ShieldCheck className="h-6 w-6 stroke-[3px]" />}
              </div>
              <h3 className="text-xl font-black uppercase text-black leading-none my-1">{slo.title}</h3>
              <p className="text-xs font-bold text-zinc-600 uppercase leading-relaxed mt-2">{slo.desc}</p>
            </div>
            
            <div className="mt-4 border-t border-zinc-100 pt-3 flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase">
              <span>PILAR #{idx + 1}</span>
              <span>⚡ KONSISTEN</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
