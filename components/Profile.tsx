'use client';

import React, { useState, useEffect } from 'react';
import { User as UserIcon, Lock, Sparkles, Image as ImageIcon, Sun, Moon, Check, ShieldCheck, KeyRound } from 'lucide-react';
import { db, User } from '../lib/db';
import confetti from 'canvas-confetti';

interface ProfileProps {
  currentUser: User | null;
  onProfileUpdate: (updatedUser: User) => void;
}

export default function Profile({ currentUser, onProfileUpdate }: ProfileProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setPhotoUrl(currentUser.photo_url || '');
      setPhotoPreview(currentUser.photo_url || null);
    }

    // Load Dark Mode Preference
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
      setDarkMode(isDark);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl p-6 font-sans text-center">
        <div className="border-4 border-black bg-white p-8 shadow-[4px_4px_0px_0px_#000000] uppercase font-black text-sm">
          Akses Ditolak! Harap masuk terlebih dahulu untuk mengelola profil.
        </div>
      </div>
    );
  }

  // Handle Photo Picker (Base64 file reader)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setPhotoUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Change Profile Picture Action
  const handleUpdatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await db.updateStudent(
        currentUser.id,
        currentUser.name,
        currentUser.nipd,
        currentUser.password // keep existing password
      );

      if (updated) {
        // Update photo_url on returned object and trigger sync
        const supabase = (await import('../lib/supabase')).getSupabaseClient();
        if (supabase) {
          await supabase.from('users').update({ photo_url: photoUrl }).eq('id', currentUser.id);
        }
        
        const finalUser = { ...currentUser, photo_url: photoUrl };
        onProfileUpdate(finalUser);

        confetti({ particleCount: 80, spread: 50 });
        setSuccessMsg('FOTO PROFIL BERHASIL DIPERBARUI! 🌟');
      } else {
        setErrorMsg('Gagal memperbarui profil.');
      }
    } catch (e: any) {
      setErrorMsg('Gagal memperbarui: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Change Password Action
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg('Harap masukkan password baru Anda!');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Password konfirmasi tidak cocok!');
      return;
    }

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await db.updateStudent(
        currentUser.id,
        currentUser.name,
        currentUser.nipd,
        password
      );

      if (updated) {
        const finalUser = { ...currentUser, password: password };
        onProfileUpdate(finalUser);
        setPassword('');
        setConfirmPassword('');
        confetti({ particleCount: 80, spread: 50 });
        setSuccessMsg('PASSWORD BERHASIL DIUBAH! 🔑');
      } else {
        setErrorMsg('Gagal memperbarui password.');
      }
    } catch (e: any) {
      setErrorMsg('Error update: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Dark Mode
  const handleToggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    
    if (typeof window !== 'undefined') {
      if (nextMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-4 font-sans md:p-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="mb-8 border-4 border-black bg-purple-300 p-6 shadow-[6px_6px_0px_0px_#000000]">
        <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
          <UserIcon className="h-10 w-10 stroke-[3px]" />
          PENGATURAN PROFIL
        </h1>
        <p className="mt-2 text-sm font-bold text-zinc-800 uppercase">
          Kelola foto profil Anda, amankan password, dan sesuaikan mode tampilan sistem!
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 border-4 border-black bg-green-300 p-4 font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000000] flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 stroke-[3px] text-green-800" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 border-4 border-black bg-red-300 p-4 font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000000] flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 stroke-[3px] text-red-800" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Body Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Profile Card & Custom Display */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] text-center flex flex-col justify-between items-center h-fit">
          <div className="w-full flex flex-col items-center">
            {/* Animated Profile Avatar Card */}
            <div className="relative group overflow-hidden border-4 border-black rounded-none h-36 w-36 shadow-[4px_4px_0px_0px_#000000] mb-4 bg-yellow-100 flex items-center justify-center transition-transform hover:scale-105">
              {photoPreview ? (
                <img src={photoPreview} alt="Avatar" className="object-cover h-full w-full" />
              ) : (
                <span className="text-5xl font-black">{currentUser.name.charAt(0)}</span>
              )}
            </div>

            <h3 className="text-xl font-black uppercase text-black leading-tight truncate w-full">{currentUser.name}</h3>
            <span className="border-2 border-black bg-yellow-300 text-[10px] font-black px-2.5 py-0.5 shadow-[1.5px_1.5px_0px_0px_#000000] uppercase mt-2">
              {currentUser.role}
            </span>
            <p className="text-[10px] font-bold text-zinc-400 uppercase mt-2">NIPD / ID: {currentUser.nipd}</p>
          </div>

          {/* Dark Mode Switcher Card */}
          <div className="mt-8 border-4 border-black bg-zinc-900 text-white p-4 shadow-[4px_4px_0px_0px_#000000] w-full">
            <h4 className="text-xs font-black uppercase mb-3 flex items-center justify-center gap-1.5">
              {darkMode ? <Moon className="h-4.5 w-4.5 text-yellow-300 shrink-0" /> : <Sun className="h-4.5 w-4.5 text-orange-400 shrink-0" />}
              MODE TAMPILAN
            </h4>
            
            <button
              onClick={handleToggleDarkMode}
              className={`w-full border-2 border-white py-2 text-[10px] font-black uppercase transition-all shadow-[2px_2px_0px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${
                darkMode ? 'bg-yellow-300 text-black' : 'bg-white/10 text-white'
              }`}
            >
              {darkMode ? 'AKTIFKAN LIGHT MODE ☀️' : 'AKTIFKAN DARK MODE 🌙'}
            </button>
          </div>
        </div>

        {/* Configurations Forms Drawer */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Avatar Picture Update Card */}
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
              <ImageIcon className="h-6 w-6 stroke-[3px] text-pink-500" />
              Ubah Foto Profil
            </h2>

            <form onSubmit={handleUpdatePhoto} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <div className="flex-1">
                  <label className="block text-[10px] font-black uppercase text-black mb-1">PILIH DARI GALERI / AMBIL DARI KAMERA HP</label>
                  <label className="flex items-center justify-center gap-2 border-4 border-dashed border-black bg-zinc-50 hover:bg-zinc-100 p-4 font-black text-xs uppercase cursor-pointer shadow-[3px_3px_0px_0px_#000000] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all w-full text-center">
                    <ImageIcon className="h-5 w-5 stroke-[2.5px]" />
                    PILIH FOTO PROFIL
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="border-2 border-black bg-pink-400 p-4 font-black text-xs uppercase text-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer text-center w-full"
                  >
                    {loading ? 'MEMPROSES...' : 'SIMPAN FOTO PROFIL! 📸'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Secure Password Update Card */}
          <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
              <KeyRound className="h-6 w-6 stroke-[3px] text-cyan-500" />
              Ganti Password Akun
            </h2>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">PASSWORD BARU</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-black mb-1">KONFIRMASI PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru..."
                    className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full border-2 border-black bg-cyan-300 p-3.5 font-black text-xs uppercase text-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
              >
                {loading ? 'MEMPERBARUI...' : 'UPDATE PASSWORD KREDENSIAL! 🔑'}
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
