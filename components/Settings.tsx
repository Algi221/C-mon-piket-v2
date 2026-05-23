'use client';

import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield, Moon, Sun, Camera, LogOut, CheckCircle2, Lock, UserCheck } from 'lucide-react';
import { db, User } from '../lib/db';
import confetti from 'canvas-confetti';

interface SettingsProps {
  currentUser: User | null;
  onProfileUpdate: (updatedUser: User) => void;
  onLogout: () => void;
}

export default function Settings({ currentUser, onProfileUpdate, onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'system' | 'logout'>('profile');

  // Profile Tab State
  const [name, setName] = useState('');
  const [nipd, setNipd] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Settings Tab State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Default avatars
  const defaultAvatars = [
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Aira',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alvira',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ahmad',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Teacher',
  ];

  // Initialize fields
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setNipd(currentUser.nipd);
      setPhotoUrl(currentUser.photo_url || '');
      setPhotoPreview(currentUser.photo_url || null);
    }

    // Check dark mode state
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') || 
                     localStorage.getItem('cmon_theme') === 'dark';
      setDarkMode(isDark);

      const handleThemeChange = () => {
        setDarkMode(document.documentElement.classList.contains('dark'));
      };
      window.addEventListener('cmon-theme-change', handleThemeChange);
      return () => {
        window.removeEventListener('cmon-theme-change', handleThemeChange);
      };
    }
  }, [currentUser]);

  // Handle Photo Picker (Base64 file reader)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File terlalu besar! Batas maksimal foto adalah 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setPhotoUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    setPhotoPreview(url);
    setPhotoUrl(url);
  };

  // Save Profile Photo uploader
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setProfileSaving(true);
    setProfileSuccess(false);

    try {
      const success = await db.updateProfilePhoto(currentUser.id, photoUrl);
      if (success) {
        const updatedUser: User = {
          ...currentUser,
          photo_url: photoUrl,
        };
        onProfileUpdate(updatedUser);
        setProfileSuccess(true);
        confetti({ particleCount: 80, spread: 50 });
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        alert('Gagal memperbarui foto profil.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Save System settings (Password & Dark mode)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (password && password !== confirmPassword) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

    setSettingsSaving(true);
    setSettingsSuccess(false);

    try {
      let success = true;

      // 1. Change password if filled
      if (password) {
        success = await db.changePassword(currentUser.id, password);
      }

      if (success) {
        setSettingsSuccess(true);
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setSettingsSuccess(false), 3000);
      } else {
        alert('Gagal menyimpan pembaruan.');
      }
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleToggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (typeof window !== 'undefined') {
      if (nextMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cmon_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('cmon_theme', 'light');
      }
      window.dispatchEvent(new Event('cmon-theme-change'));
    }
  };

  if (!currentUser) return null;

  return (
    <div className="mx-auto max-w-4xl p-4 font-sans md:p-6 animate-fade-in">
      
      {/* Page Title */}
      <div className="mb-8 border-4 border-black bg-cyan-300 p-6 shadow-[6px_6px_0px_0px_#000000]">
        <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
          <Shield className="h-10 w-10 stroke-[3px]" />
          PENGATURAN AKUN
        </h1>
        <p className="mt-2 text-sm font-bold text-zinc-800 uppercase">
          Atur profil siswa/guru, ganti password, kelola tema gelap, dan logout session disini!
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-4">
        
        {/* Settings Tab Sidebar Selector */}
        <div className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_#000000] flex flex-row md:flex-col gap-2 md:col-span-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 md:flex-initial py-3 px-4 text-xs font-black uppercase text-left flex items-center gap-2 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer ${
              activeTab === 'profile' ? 'bg-yellow-300 translate-x-0.5 shadow-none' : 'bg-white'
            }`}
          >
            <UserIcon className="h-4 w-4 stroke-[3px]" />
            PROFIL DIRI
          </button>
          
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 md:flex-initial py-3 px-4 text-xs font-black uppercase text-left flex items-center gap-2 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer ${
              activeTab === 'system' ? 'bg-pink-300 translate-x-0.5 shadow-none' : 'bg-white'
            }`}
          >
            <Lock className="h-4 w-4 stroke-[3px]" />
            SISTEM & SANDI
          </button>

          <button
            onClick={() => setActiveTab('logout')}
            className={`flex-1 md:flex-initial py-3 px-4 text-xs font-black uppercase text-left flex items-center gap-2 border-2 border-black bg-red-100 text-red-700 transition-all shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none cursor-pointer ${
              activeTab === 'logout' ? 'bg-red-400 text-black translate-x-0.5 shadow-none' : ''
            }`}
          >
            <LogOut className="h-4 w-4 stroke-[3px]" />
            LOGOUT
          </button>
        </div>

        {/* Settings Tab Work Area */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] md:col-span-3">
          
          {/* TAB 1: PROFILE MANAGEMENT */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <h2 className="text-2xl font-black uppercase border-b-2 border-black pb-2 flex items-center gap-2">
                <UserCheck className="h-6 w-6 stroke-[3px] text-yellow-500" />
                Profil Pengguna
              </h2>

              {profileSuccess && (
                <div className="border-2 border-black bg-green-100 p-3 text-xs font-bold text-green-700 flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000]">
                  <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
                  <span>Foto profil berhasil disimpan ke database cloud!</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Profile Avatar Frame */}
                <div className="relative group">
                  <div className="h-40 w-40 rounded-full border-4 border-black overflow-hidden bg-zinc-100 shadow-[5px_5px_0px_0px_#000000] transition-transform hover:scale-105">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-yellow-100 text-black">
                        <UserIcon className="h-16 w-16 stroke-[2px]" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-1 right-1 h-11 w-11 bg-pink-300 border-2 border-black rounded-full flex items-center justify-center cursor-pointer shadow-[2.5px_2.5px_0px_0px_#000000] hover:translate-y-0.5 active:shadow-none active:translate-y-1">
                    <Camera className="h-5 w-5 stroke-[3px] text-black" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h3 className="text-xl font-black uppercase text-black leading-none">{name}</h3>
                  <p className="text-xs font-bold text-zinc-500 uppercase leading-none">NIPD / ID: {nipd}</p>
                  <span className="inline-block border-2 border-black bg-yellow-300 px-2 py-0.5 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000]">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Preset Avatars Selection */}
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">ATAU PILIH PREMIUM PIXEL AVATAR:</p>
                <div className="flex flex-wrap gap-3">
                  {defaultAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(url)}
                      className={`h-14 w-14 rounded-full border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_#000000] transition-all hover:scale-105 ${
                        photoUrl === url ? 'bg-yellow-200 border-pink-400 scale-105 shadow-[1px_1px_0px_0px_#000000]' : 'bg-zinc-50'
                      }`}
                    >
                      <img src={url} alt="Preset Avatar" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full border-2 border-black bg-yellow-300 p-3 font-black text-xs uppercase text-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
              >
                {profileSaving ? 'MENYIMPAN PROFIL...' : 'UPDATE FOTO PROFIL! ⚡'}
              </button>
            </form>
          )}

          {/* TAB 2: SYSTEM AND SECURITY SETTINGS */}
          {activeTab === 'system' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <h2 className="text-2xl font-black uppercase border-b-2 border-black pb-2 flex items-center gap-2">
                <Lock className="h-6 w-6 stroke-[3px] text-pink-500" />
                Sistem & Keamanan
              </h2>

              {settingsSuccess && (
                <div className="border-2 border-black bg-green-100 p-3 text-xs font-bold text-green-700 flex items-center gap-2 shadow-[2px_2px_0px_0px_#000000]">
                  <CheckCircle2 className="h-5 w-5 stroke-[3px]" />
                  <span>Pengaturan berhasil disimpan!</span>
                </div>
              )}

              {/* Theme Settings Toggle */}
              <div>
                <label className="block text-xs font-black uppercase text-black mb-2">TEMA APLIKASI (LIGHT / DARK)</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleTheme}
                    className={`flex items-center gap-2 border-2 border-black px-4 py-2 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] active:shadow-none active:translate-y-0.5 ${
                      darkMode ? 'bg-zinc-800 text-white shadow-none translate-y-0.5' : 'bg-yellow-300 text-black'
                    }`}
                  >
                    {darkMode ? <Moon className="h-4.5 w-4.5 stroke-[3px]" /> : <Sun className="h-4.5 w-4.5 stroke-[3px]" />}
                    {darkMode ? 'MODE GELAP AKTIF' : 'MODE TERANG AKTIF'}
                  </button>
                </div>
              </div>

              {/* Change Password inputs */}
              <div className="space-y-4 border-t-2 border-zinc-100 pt-4">
                <h3 className="text-sm font-black uppercase text-black">Ganti Password Kredensial</h3>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-black mb-1">PASSWORD BARU</label>
                    <input
                      type="password"
                      placeholder="MIN 3 KARAKTER"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-black mb-1">KONFIRMASI PASSWORD</label>
                    <input
                      type="password"
                      placeholder="ULANGI PASSWORD BARU"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={settingsSaving}
                className="w-full border-2 border-black bg-pink-300 p-3 font-black text-xs uppercase text-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
              >
                {settingsSaving ? 'MENYIMPAN PENGATURAN...' : 'SIMPAN SANDI & TEMA ⚡'}
              </button>
            </form>
          )}

          {/* TAB 3: LOGOUT GATEWAY */}
          {activeTab === 'logout' && (
            <div className="space-y-6 py-6 text-center">
              <LogOut className="mx-auto h-16 w-16 text-red-500 stroke-[2.5px] animate-bounce" />
              <div>
                <h3 className="text-2xl font-black uppercase text-black">Keluar Dari Akun Anda</h3>
                <p className="text-xs font-bold text-zinc-500 uppercase mt-1 leading-relaxed max-w-md mx-auto">
                  Apakah Anda yakin ingin keluar dari sistem piket XI-J Yadika 11? Anda harus memasukkan kredensial NIPD kembali untuk menggunakan dasbor.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex-1 border-2 border-black bg-red-400 py-3 text-xs font-black uppercase text-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 cursor-pointer"
                >
                  YA, KELUAR! 🚪
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="flex-1 border-2 border-black bg-zinc-100 py-3 text-xs font-bold uppercase text-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 active:translate-x-0 cursor-pointer"
                >
                  BATAL
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
