'use client';

import React, { useState } from 'react';
import { Menu, X, Calendar, LayoutDashboard, Award, Users, BookOpen, Settings, Home, LogOut, ShieldAlert, User as UserIcon } from 'lucide-react';
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

  // Consolidated Navigation Structure
  const menuItems = [
    { id: 'welcome', name: 'HALAMAN UTAMA', icon: Home, color: 'bg-yellow-300', roles: ['guest', 'siswa', 'guru'] },
    { id: 'dashboard', name: currentUser?.role === 'guru' ? 'DASBOR GURU' : 'BERANDA PIKET', icon: LayoutDashboard, color: 'bg-cyan-300', roles: ['siswa', 'guru'] },
    { id: 'schedule', name: 'JADWAL PIKET', icon: Calendar, color: 'bg-pink-300', roles: ['guest', 'siswa'] }, // Hidden for Guru (integrated in dashboard)
    { id: 'attendance', name: 'ABSENSI & LOG', icon: BookOpen, color: 'bg-green-300', roles: ['siswa'] },     // Hidden for Guru (integrated in dashboard)
    { id: 'leaderboard', name: 'LEADERBOARD', icon: Award, color: 'bg-purple-300', roles: ['guest', 'siswa', 'guru'] },
    { id: 'profile', name: 'PROFIL SAYA', icon: UserIcon, color: 'bg-orange-300', roles: ['siswa', 'guru'] },
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
      <header className="sticky top-0 z-40 w-full border-b-4 border-black bg-white px-4 py-3 font-sans md:px-8 dark:bg-zinc-950 dark:border-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          
          {/* Logo */}
          <button 
            onClick={() => setCurrentTab(currentUser ? 'dashboard' : 'welcome')} 
            className="flex items-center gap-2 text-2xl font-black tracking-wider text-black transition-transform hover:scale-105 active:scale-95 dark:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center border-4 border-black bg-yellow-300 text-xl font-bold shadow-[2px_2px_0px_0px_#000000] dark:border-white dark:shadow-[2px_2px_0px_0px_#ffffff]">
              ⚡
            </span>
            <span>C-MON PIKET!</span>
          </button>

          {/* Desktop Nav Items - Grid/Uniform Layout */}
          <nav className="hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-2">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    className={`w-44 h-11 flex items-center justify-center gap-2 border-2 border-black text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer dark:border-white dark:shadow-[2px_2px_0px_0px_#ffffff] dark:hover:shadow-[4px_4px_0px_0px_#ffffff] ${
                      isActive 
                        ? `${item.color} text-black font-black translate-x-0.5 translate-y-0.5 shadow-none dark:text-black dark:border-white` 
                        : 'bg-white text-zinc-700 hover:text-black dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 stroke-[3px] shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>

            {/* User Session Info & Logout */}
            {currentUser && (
              <div className="ml-4 flex items-center gap-2 border-l-2 border-black pl-4 dark:border-white">
                <div className="text-right flex flex-col items-end">
                  <p className="text-[10px] font-black text-black leading-none uppercase truncate max-w-28 dark:text-white">{currentUser.name}</p>
                  <span className="text-[8px] font-black bg-yellow-300 border border-black px-1.5 py-0.2 uppercase mt-1 inline-block text-black dark:border-white">
                    {currentUser.role}
                  </span>
                </div>
                
                {/* Profile Pic Thumbnail if exists */}
                {currentUser.photo_url && (
                  <div className="h-9 w-9 border-2 border-black overflow-hidden shrink-0 dark:border-white shadow-[1px_1px_0px_0px_#000000] dark:shadow-[1px_1px_0px_0px_#ffffff]">
                    <img src={currentUser.photo_url} alt="Profile" className="h-full w-full object-cover" />
                  </div>
                )}

                <button
                  onClick={onLogout}
                  title="Keluar"
                  className="flex h-10 w-10 items-center justify-center border-2 border-black bg-red-400 text-black shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer dark:border-white dark:shadow-[2px_2px_0px_0px_#ffffff] dark:hover:shadow-[3px_3px_0px_0px_#ffffff]"
                >
                  <LogOut className="h-4.5 w-4.5 stroke-[3px]" />
                </button>
              </div>
            )}
            
            {/* Supabase Indicator */}
            <div className={`ml-2 h-3.5 w-3.5 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000000] dark:border-white ${supabaseConnected ? 'bg-green-400' : 'bg-red-400'}`} title={supabaseConnected ? 'Supabase Terhubung' : 'Offline Mode (LocalStorage)'} />
          </nav>

          {/* Hamburger button (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-12 w-12 items-center justify-center border-4 border-black bg-white text-black transition-all shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none lg:hidden dark:bg-zinc-900 dark:text-white dark:border-white"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-7 w-7 stroke-[3px]" /> : <Menu className="h-7 w-7 stroke-[3px]" />}
          </button>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-900 font-sans p-6 animate-fade-in lg:hidden">
          {/* Header Overlay */}
          <div className="flex items-center justify-between border-b-4 border-white pb-6">
            <div className="flex items-center gap-2 text-2xl font-black tracking-wider text-white">
              <span className="flex h-10 w-10 items-center justify-center border-4 border-white bg-yellow-300 text-black text-xl font-bold shadow-[3px_3px_0px_0px_#ffffff]">
                ⚡
              </span>
              <span>C-MON MENU</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-12 w-12 items-center justify-center border-4 border-white bg-red-400 text-black shadow-[3px_3px_0px_0px_#ffffff] active:translate-x-1 active:translate-y-1 active:shadow-none"
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
                  className={`flex w-full items-center justify-between border-4 border-black p-4 text-base font-black tracking-wide uppercase transition-all shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000000] animate-slide-in ${
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

            {/* Logout Mobile */}
            {currentUser && (
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between border-4 border-black p-4 text-base font-black tracking-wide uppercase bg-red-400 text-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000000]"
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
