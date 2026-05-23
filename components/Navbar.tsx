'use client';

import React, { useState } from 'react';
import { Menu, X, Calendar, LayoutDashboard, Award, Users, BookOpen, Settings } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  supabaseConnected: boolean;
}

export default function Navbar({ currentTab, setCurrentTab, supabaseConnected }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'BERANDA', icon: LayoutDashboard, color: 'bg-yellow-300' },
    { id: 'schedule', name: 'JADWAL PIKET', icon: Calendar, color: 'bg-cyan-300' },
    { id: 'attendance', name: 'ABSENSI & LOG', icon: BookOpen, color: 'bg-pink-300' },
    { id: 'leaderboard', name: 'LEADERBOARD', icon: Award, color: 'bg-green-300' },
    { id: 'students', name: 'MANAJEMEN SISWA', icon: Users, color: 'bg-purple-300' },
    { id: 'supabase', name: 'CONFIG SUPABASE', icon: Settings, color: 'bg-orange-300' },
  ];

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
            onClick={() => setCurrentTab('dashboard')} 
            className="flex items-center gap-2 text-2xl font-black tracking-wider text-black transition-transform hover:scale-105 active:scale-95"
          >
            <span className="flex h-10 w-10 items-center justify-center border-4 border-black bg-yellow-300 text-xl font-bold shadow-[2px_2px_0px_0px_#000000]">
              ⚡
            </span>
            <span>C-MON PIKET!</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-3 lg:flex">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 border-2 border-black px-4 py-2 text-sm font-bold uppercase transition-all shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none ${
                    isActive ? `${item.color} text-black font-black translate-x-0.5 translate-y-0.5 shadow-none` : 'bg-white text-zinc-700 hover:text-black'
                  }`}
                >
                  <Icon className="h-4 w-4 stroke-[3px]" />
                  {item.name}
                </button>
              );
            })}
            
            {/* Supabase Indicator */}
            <div className={`ml-2 h-3 w-3 rounded-full border-2 border-black shadow-[1px_1px_0px_0px_#000000] ${supabaseConnected ? 'bg-green-400' : 'bg-red-400'}`} title={supabaseConnected ? 'Supabase Terhubung' : 'Offline Mode (LocalStorage)'} />
          </nav>

          {/* Hamburger button (Mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-12 w-12 items-center justify-center border-4 border-black bg-white text-black transition-all shadow-[3px_3px_0px_0px_#000000] hover:bg-zinc-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none lg:hidden"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-7 w-7 stroke-[3px]" /> : <Menu className="h-7 w-7 stroke-[3px]" />}
          </button>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-900 font-sans p-6 animate-fade-in lg:hidden">
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

          <div className="flex flex-1 flex-col justify-center gap-4 py-8">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{ animationDelay: `${idx * 75}ms` }}
                  className={`flex w-full items-center justify-between border-4 border-black p-5 text-xl font-black tracking-wide uppercase transition-all shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000000] animate-slide-in ${
                    isActive ? `${item.color} text-black translate-x-1 translate-y-1 shadow-[2px_2px_0px_0px_#000000]` : 'bg-white text-zinc-950'
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <Icon className="h-6 w-6 stroke-[3px]" />
                    {item.name}
                  </span>
                  <span className="text-2xl">➔</span>
                </button>
              );
            })}
          </div>

          <div className="border-t-4 border-white pt-6 text-center text-sm font-bold text-zinc-400 flex flex-col items-center gap-2">
            <span>SISTEM PIKET KELAS V2 • NEUBRUTALISME</span>
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full border-2 border-white ${supabaseConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-white">{supabaseConnected ? 'KONEKSI CLOUD (SUPABASE)' : 'KONEKSI LOKAL (OFFLINE)'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
