'use client';

import React, { useState } from 'react';
import { KeyRound, Sparkles, Smile, ShieldCheck, Flame, Star, AlertCircle, Quote } from 'lucide-react';
import { db, User } from '../lib/db';
import TextPressure from './react-bits/TextPressure';
import TextType from './react-bits/TextType';
import ScrollVelocity from './react-bits/ScrollVelocity';
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

  // Motivational values cards
  const slogans = [
    { title: 'Tanggung Jawab Bersama', desc: 'Kebersihan kelas bukan tugas satu orang saja, melainkan cermin kerja sama kita semua!', color: 'bg-yellow-300' },
    { title: 'Belajar Lebih Nyaman', desc: 'Kelas yang bersih melahirkan suasana belajar yang kondusif untuk prestasi maksimal!', color: 'bg-cyan-300' },
    { title: 'Disiplin & Konsistensi', desc: 'Kebiasaan kecil membuang sampah pada tempatnya membentuk karakter disiplin masa depan!', color: 'bg-pink-300' }
  ];

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
    <div className="mx-auto max-w-7xl p-4 font-sans md:p-6 animate-fade-in dark:text-white">
      
      {/* Scroll Parallax Text Velocity Ticker */}
      <div className="mb-8 border-4 border-black bg-zinc-950 text-yellow-300 py-3 shadow-[4px_4px_0px_0px_#000000] overflow-hidden dark:border-white">
        <ScrollVelocity 
          texts={['KELAS BERSIH BELAJAR NYAMAN ⚡ DISIPLIN KELAS XI-J SMA YADIKA 11']} 
          velocity={50}
          className="text-lg font-black tracking-widest uppercase"
        />
      </div>

      {/* Slogan Hero Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-5 items-stretch mb-12">
        
        {/* Left Side: Compressa VF text, Typing animation, and custom Illustration */}
        <div className="lg:col-span-3 border-4 border-black bg-yellow-300 p-6 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between text-black dark:border-white">
          <div>
            <span className="inline-block border-2 border-black bg-white px-2 py-0.5 text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000] mb-3">
              ⚡ CMON PIKET KELAS XI-J
            </span>
            
            {/* React Bits TextPressure - Dynamic weight stretching */}
            <div className="h-16 w-full mb-3 select-none">
              <TextPressure 
                text="CMON PIKET" 
                textColor="#000000" 
                strokeColor="#000000"
                minFontSize={28}
                flex={true}
                className="font-black tracking-tighter"
              />
            </div>

            {/* React Bits TextType - typing animation slogan shuffler */}
            <div className="min-h-12 flex items-center">
              <TextType 
                text={[
                  "Kombinasi Disiplin dan Kerja Sama!",
                  "Kelas Bersih Adalah Cermin Jiwa Kita!",
                  "Tanggung Jawab Bersama untuk Kenyamanan Bersama!"
                ]}
                typingSpeed={50}
                deletingSpeed={25}
                pauseDuration={2000}
                className="text-lg font-black uppercase text-zinc-900"
                cursorClassName="text-pink-600 font-bold"
              />
            </div>
          </div>

          {/* Welcome Illustration Image - Beautifully framed with Neubrutalism style */}
          <div className="mt-6 border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_#000000] overflow-hidden flex flex-col items-center">
            <div className="w-full max-w-sm aspect-[9/16] relative overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
              <img 
                src="/welcome_piket.png" 
                alt="Illustration Piket Yadika 11 XI-J" 
                className="object-cover w-full h-full"
              />
            </div>
            <p className="mt-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center">
              Ilustrasi Regu Piket Aktif XI-J SMA Yadika 11
            </p>
          </div>
        </div>

        {/* Right Side: Secure Unified Login Panel */}
        <div className="lg:col-span-2 border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between dark:bg-zinc-900 dark:border-white dark:shadow-[8px_8px_0px_0px_#ffffff]">
          {currentUser ? (
            // Logged in View
            <div className="h-full flex flex-col justify-between py-4">
              <div>
                <span className="border-2 border-black bg-green-300 text-black px-2 py-0.5 text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000]">
                  SESI AKTIF ✅
                </span>
                
                {/* Profile Pic Anim from React bits or Neubrutalism hover frame */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-16 w-16 border-4 border-black overflow-hidden bg-yellow-100 shadow-[2px_2px_0px_0px_#000000] hover:scale-105 transition-transform dark:border-white">
                    {currentUser.photo_url ? (
                      <img src={currentUser.photo_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-black text-xl text-black">{currentUser.name.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase leading-none dark:text-white">
                      Halo, {currentUser.name}!
                    </h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">
                      Role: **{currentUser.role.toUpperCase()}** • NIPD: {currentUser.nipd}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="w-full border-2 border-black bg-cyan-300 p-3.5 font-black text-xs uppercase text-black transition-all shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
                >
                  BUKA BERANDA PIKET KELAS ➔
                </button>
                <div className="border-2 border-black bg-zinc-50 p-3 text-[10px] font-bold text-zinc-500 uppercase text-center dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                  Nikmati pengalaman piket kelas yang bersih, menyenangkan, dan disiplin!
                </div>
              </div>
            </div>
          ) : (
            // Form Login View
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <h2 className="text-2xl font-black uppercase flex items-center gap-2">
                  <KeyRound className="h-6 w-6 stroke-[3px] text-pink-500 animate-pulse" />
                  MASUK SISTEM
                </h2>
                <p className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5">
                  Gunakan Kredensial NIPD Kelas untuk masuk
                </p>
              </div>

              {errorMsg && (
                <div className="border-2 border-black bg-red-100 p-3 text-[10px] font-bold text-red-700 flex items-start gap-2 shadow-[2px_2px_0px_0px_#000000]">
                  <AlertCircle className="h-4 w-4 stroke-[3px] text-red-700 shrink-0 mt-0.5" />
                  <span className="uppercase">{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-black uppercase text-black mb-0.5 dark:text-white">NIPD / LOGIN USER</label>
                  <input
                    type="text"
                    required
                    value={nipd}
                    onChange={(e) => setNipd(e.target.value)}
                    placeholder="Masukkan NIPD (Contoh: 0002 atau admin)"
                    className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000] dark:bg-zinc-800 dark:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-black mb-0.5 dark:text-white">PASSWORD KREDENSIAL</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password (Contoh: 123 atau admin)"
                    className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000] dark:bg-zinc-800 dark:border-white"
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

              <div className="border-t border-zinc-200 pt-3 text-[9px] font-bold text-zinc-400 uppercase text-center dark:border-zinc-700">
                SISWA: NIPD 0002 / PASS 123 | GURU: NIPD admin / PASS admin
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Slogan Details Section */}
      <h2 className="text-3xl font-black uppercase text-center mb-8">Pilar Kebersihan Kelas XI-J</h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        {slogans.map((slo, idx) => (
          <div
            key={idx}
            className="border-4 border-black bg-white p-6 shadow-[5px_5px_0px_0px_#000000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000000] transition-all flex flex-col justify-between dark:bg-zinc-900 dark:border-white dark:shadow-[5px_5px_0px_0px_#ffffff]"
          >
            <div>
              <div className={`h-12 w-12 border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center mb-4 ${slo.color} text-black`}>
                <Star className="h-6 w-6 stroke-[3px]" />
              </div>
              <h3 className="text-xl font-black uppercase text-black leading-none my-1 dark:text-white">{slo.title}</h3>
              <p className="text-xs font-bold text-zinc-500 uppercase leading-relaxed mt-2">{slo.desc}</p>
            </div>
            
            <div className="mt-4 border-t border-zinc-100 pt-3 flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase dark:border-zinc-800">
              <span>PILAR #{idx + 1}</span>
              <span>⚡ KONSISTENSI</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
