'use client';

import React, { useState } from 'react';
import { Menu, X, Calendar, LayoutDashboard, Award, Settings, Home, LogOut, ShieldAlert, User as UserIcon, Sun, Moon, KeyRound } from 'lucide-react';
import { User } from '../lib/db';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  supabaseConnected: boolean;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, supabaseConnected, currentUser, onLogout }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark') || localStorage.getItem('cmon_theme') === 'dark');
      const handleThemeChange = () => {
        setIsDark(document.documentElement.classList.contains('dark'));
      };
      window.addEventListener('cmon-theme-change', handleThemeChange);
      return () => window.removeEventListener('cmon-theme-change', handleThemeChange);
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isDark;
    setIsDark(nextMode);
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

  // Core navigation configurations (Simplified to exactly 3 clean items per role state)
  const menuItems = [
    { id: 'welcome', name: 'Home', icon: Home, color: 'bg-yellow-300', roles: ['guest'] },
    { id: 'dashboard', name: 'BERANDA', icon: LayoutDashboard, color: 'bg-cyan-300', roles: ['siswa', 'guru'] },
    { id: 'schedule', name: 'JADWAL PIKET', icon: Calendar, color: 'bg-pink-300', roles: ['guest', 'siswa', 'guru'] },
    { id: 'leaderboard', name: 'LEADERBOARD', icon: Award, color: 'bg-purple-300', roles: ['guest', 'siswa', 'guru'] },
  ];

  const activeRole = currentUser ? currentUser.role : 'guest';
  const visibleItems = menuItems.filter(item => item.roles.includes(activeRole));

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Primary Header */}
      <header className="sticky top-0 z-40 w-full border-b-4 border-black bg-white px-4 py-3 font-sans md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          
          {/* Logo */}
          <button 
            onClick={() => setCurrentTab(currentUser ? 'dashboard' : 'welcome')} 
            className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-wider text-black transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center border-4 border-black dark:border-white bg-white overflow-hidden shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#ffffff] shrink-0 rounded-sm">
              <img src="/logo piketv2.png" alt="Logo" className="h-full w-full object-cover" />
            </div>
            <span>C-MON PIKET!</span>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-2.5">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-40 h-10 flex items-center justify-center gap-2 border-2 border-black text-xs font-black uppercase transition-all shadow-[2.5px_2.5px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer ${
                      isActive ? `${item.color} text-black translate-x-0.5 translate-y-0.5 shadow-none` : 'bg-white text-zinc-700 hover:text-black'
                    }`}
                  >
                    <Icon className="h-4 w-4 stroke-[3px] shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Theme Toggle Button (Desktop) */}
            <button
              onClick={toggleTheme}
              className="ml-4 h-11 w-11 flex items-center justify-center border-4 border-black bg-yellow-300 text-black shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all duration-300 hover:rotate-12 cursor-pointer shrink-0"
              title="Ganti Tema (Terang / Gelap)"
            >
              {isDark ? <Sun className="h-5 w-5 stroke-[2.5px]" /> : <Moon className="h-5 w-5 stroke-[2.5px]" />}
            </button>

            {/* Profile Avatar Trigger (Far Right - Premium Neubrutalism style, no text name) */}
            {currentUser ? (
              <button
                onClick={() => setCurrentTab('settings')}
                className={`relative ml-4 h-11 w-11 rounded-full border-4 border-black overflow-hidden shadow-[3px_3px_0px_0px_#000000] hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0 bg-yellow-100 flex items-center justify-center ${
                  currentTab === 'settings' ? 'scale-110 border-pink-400 shadow-none translate-x-0.5 translate-y-0.5' : ''
                }`}
                title="Pengaturan & Profil Diri"
              >
                {currentUser.photo_url ? (
                  <img src={currentUser.photo_url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5 stroke-[2.5px] text-zinc-900" />
                )}
                {/* Supabase Status Dot inside avatar badge */}
                <div 
                  className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black ${
                    supabaseConnected ? 'bg-green-400' : 'bg-red-400'
                  }`} 
                  title={supabaseConnected ? 'Supabase Cloud Terhubung' : 'Offline Mode (LocalStorage)'}
                />
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className={`relative ml-4 px-4.5 h-11 flex items-center justify-center gap-2 border-4 border-black bg-pink-400 text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all cursor-pointer shrink-0 ${
                  currentTab === 'login' ? 'bg-pink-300 translate-x-0.5 translate-y-0.5 shadow-none' : ''
                }`}
                title={supabaseConnected ? 'Supabase Terhubung' : 'Offline Mode (Local)'}
              >
                <span>MASUK</span>
                <span className={`h-2.5 w-2.5 rounded-full border border-black ${supabaseConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              </button>
            )}
          </nav>

          {/* Hamburger button (Mobile) */}
          <div className="flex items-center gap-3 lg:hidden">
            {/* Mobile Connection Status Dot */}
            <div className={`h-3 w-3 rounded-full border-2 border-black ${supabaseConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-11 w-11 items-center justify-center border-4 border-black bg-white text-black transition-all shadow-[2.5px_2.5px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6 stroke-[3px]" /> : <Menu className="h-6 w-6 stroke-[3px]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-900 font-sans p-6 animate-fade-in lg:hidden">
          {/* Header Overlay */}
          <div className="flex items-center justify-between border-b-4 border-white pb-6">
            <div className="flex items-center gap-2 text-2xl font-black tracking-wider text-white">
              <div className="flex h-10 w-10 items-center justify-center border-4 border-white bg-white overflow-hidden shadow-[3px_3px_0px_0px_#ffffff] shrink-0 rounded-sm">
                <img src="/logo piketv2.png" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <span>C-MON MENU</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-12 w-12 items-center justify-center border-4 border-white bg-red-400 text-black shadow-[3px_3px_0px_0px_#ffffff] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
            >
              <X className="h-7 w-7 stroke-[3px]" />
            </button>
          </div>

          {/* Staggered Navigation Buttons */}
          <div className="flex flex-1 flex-col justify-center gap-3 py-6 overflow-y-auto">
            {visibleItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className={`flex w-full items-center justify-between border-4 border-black p-4 text-base font-black tracking-wide uppercase transition-all shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000000] animate-slide-in cursor-pointer ${
                    isActive ? `${item.color} text-black translate-x-1 translate-y-1 shadow-[2px_2px_0px_0px_#000000]` : 'bg-white text-zinc-950'
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <Icon className="h-5 w-5 stroke-[3px]" />
                    {item.name}
                  </span>
                  <span className="text-xl">➔</span>
                </button>
              );
            })}

            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="flex w-full items-center justify-between border-4 border-black p-4 text-base font-black tracking-wide uppercase bg-yellow-300 text-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
            >
              <span className="flex items-center gap-4">
                {isDark ? <Sun className="h-5 w-5 stroke-[3px]" /> : <Moon className="h-5 w-5 stroke-[3px]" />}
                <span>TEMA: {isDark ? 'TERANG' : 'GELAP'}</span>
              </span>
              <span className="text-xl">➔</span>
            </button>

            {/* Login Mobile Trigger for Guests */}
            {!currentUser && (
              <button
                onClick={() => handleNavClick('login')}
                className={`flex w-full items-center justify-between border-4 border-black p-4 text-base font-black tracking-wide uppercase transition-all shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000000] cursor-pointer bg-pink-400 text-black ${
                  currentTab === 'login' ? 'translate-x-1 translate-y-1 shadow-[2px_2px_0px_0px_#000000]' : ''
                }`}
              >
                <span className="flex items-center gap-4">
                  <KeyRound className="h-5 w-5 stroke-[3px]" />
                  MASUK SISTEM 🚀
                </span>
                <span className="text-xl">➔</span>
              </button>
            )}

            {/* Profile/Settings mobile trigger link */}
            {currentUser && (
              <button
                onClick={() => handleNavClick('settings')}
                className={`flex w-full items-center justify-between border-4 border-black p-4 text-base font-black tracking-wide uppercase transition-all shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000000] cursor-pointer ${
                  currentTab === 'settings' ? 'bg-pink-300 text-black translate-x-1 translate-y-1 shadow-[2px_2px_0px_0px_#000000]' : 'bg-white text-zinc-950'
                }`}
              >
                <span className="flex items-center gap-4">
                  {currentUser.photo_url ? (
                    <img src={currentUser.photo_url} alt="Profile" className="h-6 w-6 rounded-full border border-black object-cover" />
                  ) : (
                    <Settings className="h-5 w-5 stroke-[3px]" />
                  )}
                  PENGATURAN & PROFIL
                </span>
                <span className="text-xl">➔</span>
              </button>
            )}

            {/* Logout Mobile */}
            {currentUser && (
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between border-4 border-black p-4 text-base font-black tracking-wide uppercase bg-red-400 text-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000000] cursor-pointer"
              >
                <span className="flex items-center gap-4">
                  <LogOut className="h-5 w-5 stroke-[3px]" />
                  KELUAR SISTEM
                </span>
                <span className="text-xl">➔</span>
              </button>
            )}
          </div>

          {/* Mobile Footer Status */}
          <div className="border-t-4 border-white pt-4 text-center text-xs font-bold text-zinc-400 flex flex-col items-center gap-2 shrink-0">
            {currentUser && (
              <div className="flex items-center gap-2 border-2 border-white bg-white/10 px-3 py-1.5 text-white font-bold uppercase">
                <ShieldAlert className="h-4 w-4 text-yellow-300" />
                <span>USER: {currentUser.name} ({currentUser.role})</span>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <div className={`h-3 w-3 rounded-full border-2 border-white ${supabaseConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-white">{supabaseConnected ? 'CLOUDSYNC ACTIVE' : 'LOCALSTORAGE OFFLINE'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

