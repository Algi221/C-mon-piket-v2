'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, AlertCircle, User as UserIcon, Lock, ChevronLeft, Sparkles } from 'lucide-react';
import { db, User } from '../lib/db';
import confetti from 'canvas-confetti';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  currentUser: User | null;
  setCurrentTab: (tab: string) => void;
}

export default function Login({ onLoginSuccess, currentUser, setCurrentTab }: LoginProps) {
  const [nipd, setNipd] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      setCurrentTab('dashboard');
    }
  }, [currentUser]);

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
          origin: { y: 0.65 }
        });
        
        onLoginSuccess(matchedUser);
        setCurrentTab('dashboard'); // Redirect to dashboard
      } else {
        setErrorMsg('ID / Password salah! Silakan coba lagi.');
      }
    } catch (e: any) {
      setErrorMsg('Terjadi kesalahan saat masuk: ' + e.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="mx-auto max-w-6xl p-4 font-sans md:p-6 animate-fade-in flex flex-col justify-center min-h-[85vh] items-center text-black dark:text-white">
      
      {/* Back Button - COLORFUL NO BLACK BORDERS */}
      <button
        onClick={() => setCurrentTab('welcome')}
        className="self-start mb-6 border-2 border-[#7c3aed] dark:border-white bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 px-4 py-2 text-xs font-black uppercase shadow-[2.5px_2.5px_0px_0px_#0ea5e9] dark:shadow-[2.5px_2.5px_0px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1 cursor-pointer text-[#7c3aed] dark:text-white"
      >
        <ChevronLeft className="h-4 w-4 stroke-[3px]" />
        KEMBALI KE UTAMA
      </button>

      {/* Main Login Split-Card - VIBRANT DEEP PURPLE BORDERS & SKY BLUE SHADOW */}
      <div className="w-full border-4 border-[#7c3aed] dark:border-white bg-white dark:bg-zinc-900 shadow-[12px_12px_0px_0px_#0ea5e9] dark:shadow-[12px_12px_0px_0px_#ffffff] grid md:grid-cols-2 rounded-sm overflow-hidden min-h-[550px]">
        
        {/* LEFT COLUMN: SIGN IN FORM */}
        <div className="p-8 sm:p-12 flex flex-col justify-between bg-white dark:bg-zinc-900 text-black dark:text-white">
          
          <form onSubmit={handleLogin} className="space-y-6 my-auto">
            <div className="text-center md:text-left">
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none text-[#7c3aed] dark:text-white mb-6">
                Sign In
              </h2>
              
              <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 block mb-4 tracking-widest">
                MASUK DENGAN KREDENSIAL NIPD / PASSWORD PIKET:
              </span>
            </div>

            {/* Error Message - Vibrant Red Alert */}
            {errorMsg && (
              <div className="border-2 border-red-500 bg-red-100 p-3.5 text-[10px] font-bold text-red-700 flex items-start gap-2 shadow-[2px_2px_0px_0px_#0ea5e9]">
                <AlertCircle className="h-4 w-4 stroke-[3px] text-red-700 shrink-0 mt-0.5" />
                <span className="uppercase leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Secure Inputs - PURPLE BORDERS & SKY BLUE SHADOWS */}
            <div className="space-y-5">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed] dark:text-zinc-500">
                  <UserIcon className="h-5 w-5 stroke-[2.5px]" />
                </span>
                <input
                  type="text"
                  required
                  value={nipd}
                  onChange={(e) => setNipd(e.target.value)}
                  placeholder="NIPD / ID USER (e.g. 0002)"
                  className="w-full border-4 border-[#7c3aed] dark:border-white bg-zinc-50 dark:bg-zinc-800 py-4 pl-12 pr-4 font-black uppercase text-xs placeholder-zinc-400 outline-none focus:bg-white dark:focus:bg-zinc-800 shadow-[3px_3px_0px_0px_#0ea5e9] dark:shadow-[3px_3px_0px_0px_#ffffff] text-black dark:text-white"
                />
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7c3aed] dark:text-zinc-500">
                  <Lock className="h-5 w-5 stroke-[2.5px]" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="PASSWORD KREDENSIAL"
                  className="w-full border-4 border-[#7c3aed] dark:border-white bg-zinc-50 dark:bg-zinc-800 py-4 pl-12 pr-4 font-black text-xs placeholder-zinc-400 outline-none focus:bg-white dark:focus:bg-zinc-800 shadow-[3px_3px_0px_0px_#0ea5e9] dark:shadow-[3px_3px_0px_0px_#ffffff] text-black dark:text-white"
                />
              </div>
            </div>

            {/* Forgot sandi & submit - EMERALD GREEN BUTTON WITH VIOLET SHADOW */}
            <div className="pt-4 flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase text-zinc-400 hover:text-[#7c3aed] dark:hover:text-white cursor-pointer text-center md:text-left self-start tracking-wider">
                Lupa password akun? Hubungi Admin XI-J
              </span>

              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-44 border-4 border-[#7c3aed] dark:border-white bg-emerald-500 hover:bg-emerald-400 text-white p-4 font-black text-xs uppercase shadow-[4px_4px_0px_0px_#0ea5e9] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5.5px_5.5px_0px_0px_#0ea5e9] dark:hover:shadow-[5.5px_5.5px_0px_0px_#ffffff] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all cursor-pointer text-center"
              >
                {loading ? 'MEMASUKKAN...' : 'SIGN IN ➔'}
              </button>
            </div>
          </form>

        </div>

        {/* RIGHT COLUMN: GORGEOUS CURVED BANNER */}
        <div className="hidden md:flex flex-col justify-center items-center text-center p-12 bg-[#7c3aed] text-white relative rounded-l-[120px] border-l-4 border-[#7c3aed] dark:border-white">
          {/* Sparkles deco */}
          <span className="absolute top-8 right-8 text-yellow-300">
            <Sparkles className="h-7 w-7 stroke-[2.5px] animate-pulse" />
          </span>

          <div className="max-w-sm space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none text-white">
              Hello, Friend!
            </h2>
            <p className="text-xs sm:text-sm font-bold leading-relaxed text-zinc-200 uppercase tracking-wide">
              Platform Pencatatan & Monitoring piket kelas XI-J SMA Yadika 11. Masuk ke dasbor piket untuk melihat riwayat piket dan penanggung jawab piket kelas!
            </p>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-black tracking-widest text-[#c084fc] uppercase">
              SMA YADIKA 11 • XI-J
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
