'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Welcome from '../components/Welcome';
import Dashboard from '../components/Dashboard';
import ScheduleManager from '../components/ScheduleManager';
import AttendanceLogs from '../components/AttendanceLogs';
import Leaderboard from '../components/Leaderboard';
import Profile from '../components/Profile';
import { db, User, Schedule, Report } from '../lib/db';
import { getSupabaseClient } from '../lib/supabase';
import { Loader2, Flame, Award, Heart, ShieldAlert, Check } from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('welcome');
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core App Roster Data State
  const [students, setStudents] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [logs, setLogs] = useState<Report[]>([]);

  // Check login session in browser & theme preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cmon_session_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
          setCurrentTab('dashboard'); // Redirect to active dashboard if logged in
        } catch (e) {
          console.error(e);
        }
      }

      // Initialize theme mode
      if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const checkConnectionAndLoad = async () => {
    try {
      const client = getSupabaseClient();
      if (client) {
        // Run simple query to check connection
        const { error } = await client.from('users').select('id').limit(1);
        if (!error) {
          setSupabaseConnected(true);
        } else {
          setSupabaseConnected(false);
          console.warn('Supabase connectivity check failed, Offline Mode fallback:', error.message);
        }
      } else {
        setSupabaseConnected(false);
      }
    } catch (e) {
      setSupabaseConnected(false);
      console.warn('Supabase initialization failed, Offline Mode fallback.');
    }

    await refreshAllData();
  };

  const refreshAllData = async () => {
    try {
      const [allStudents, allSchedules, allLogs] = await Promise.all([
        db.getStudents(),
        db.getSchedules(),
        db.getLogs(),
      ]);

      setStudents(allStudents);
      setSchedules(allSchedules);
      setLogs(allLogs);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnectionAndLoad();
  }, [currentUser]); // Refresh when login state changes to pull correct database entries

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cmon_session_user', JSON.stringify(user));
    }
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cmon_session_user');
      }
      setCurrentTab('welcome');
    }
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cmon_session_user', JSON.stringify(updatedUser));
    }
  };

  const handleActionComplete = () => {
    refreshAllData();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbf8] text-black transition-colors duration-300 dark:bg-zinc-950 dark:text-white">
      {/* Dynamic Neubrutalism Header Nav */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        supabaseConnected={supabaseConnected} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Tab Controller */}
      <main className="flex-1 pb-16 pt-6">
        {loading ? (
          // Neubrutalism Fullscreen Loader
          <div className="flex h-[60vh] flex-col items-center justify-center gap-4 font-sans">
            <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_#000000] animate-spin dark:border-white">
              <Loader2 className="h-8 w-8 stroke-[3px] text-black animate-spin" />
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-black dark:text-white animate-pulse">
              Memasang Sambungan Kelas Cloud...
            </p>
          </div>
        ) : (
          // Main Body Tabs Transition
          <div className="animate-fade-in">
            {currentTab === 'welcome' && (
              <Welcome 
                onLoginSuccess={handleLoginSuccess}
                currentUser={currentUser}
                setCurrentTab={setCurrentTab}
              />
            )}
            {currentTab === 'dashboard' && (
              <Dashboard 
                currentUser={currentUser}
                students={students}
                schedules={schedules}
                logs={logs}
                onActionComplete={handleActionComplete}
                setCurrentTab={setCurrentTab}
                supabaseConnected={supabaseConnected}
                onConnectionChange={checkConnectionAndLoad}
              />
            )}
            {currentTab === 'schedule' && (
              <ScheduleManager 
                currentUser={currentUser}
                students={students}
                schedules={schedules}
                onActionComplete={handleActionComplete}
              />
            )}
            {currentTab === 'attendance' && (
              <AttendanceLogs 
                logs={logs}
              />
            )}
            {currentTab === 'leaderboard' && (
              <Leaderboard 
                students={students}
              />
            )}
            {currentTab === 'profile' && (
              <Profile 
                currentUser={currentUser}
                onProfileUpdate={handleProfileUpdate}
              />
            )}
          </div>
        )}
      </main>

      {/* Expanded Brutalist Footer - SMA YADIKA 11 KELAS XI-J */}
      <footer className="border-t-4 border-black bg-white py-12 text-left font-sans text-xs font-bold uppercase text-zinc-800 dark:bg-zinc-900 dark:border-white dark:text-zinc-300">
        <div className="mx-auto max-w-7xl px-6 grid gap-8 md:grid-cols-4">
          
          {/* Col 1: Class Brand Badge */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center border-4 border-black bg-yellow-300 text-3xl font-black shadow-[3px_3px_0px_0px_#000000] text-black dark:border-white">
                XI-J
              </span>
              <div>
                <h3 className="text-xl font-black text-black leading-none uppercase dark:text-white">SMA YADIKA 11</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">SISTEM MONITORING PIKET KELAS</p>
              </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 normal-case leading-relaxed max-w-sm">
              Sistem pencatatan roster piket harian digital yang dikembangkan untuk melatih tanggung jawab, kerja sama tim, dan kepatuhan dalam menjaga kebersihan lingkungan belajar Kelas XI-J SMA Yadika 11.
            </p>
          </div>

          {/* Col 2: Class Pillar Values */}
          <div>
            <h4 className="text-xs font-black text-black mb-3.5 tracking-wider uppercase border-b-2 border-black pb-1 dark:text-white dark:border-white">NILAI UTAMA PIKET</h4>
            <ul className="space-y-2 text-[10px] text-zinc-700 dark:text-zinc-300">
              <li className="flex items-center gap-1.5"><Check className="h-4.5 w-4.5 text-green-500 stroke-[3px]" /> KEDISIPLINAN WAKTU</li>
              <li className="flex items-center gap-1.5"><Check className="h-4.5 w-4.5 text-green-500 stroke-[3px]" /> KEBERSAMAAN REGU</li>
              <li className="flex items-center gap-1.5"><Check className="h-4.5 w-4.5 text-green-500 stroke-[3px]" /> TANGGUNG JAWAB PJ</li>
              <li className="flex items-center gap-1.5"><Check className="h-4.5 w-4.5 text-green-500 stroke-[3px]" /> KONSISTENSI HARIAN</li>
            </ul>
          </div>

          {/* Col 3: Yadika 11 info */}
          <div>
            <h4 className="text-xs font-black text-black mb-3.5 tracking-wider uppercase border-b-2 border-black pb-1 dark:text-white dark:border-white">SMA YADIKA 11</h4>
            <p className="text-[9px] font-bold text-zinc-600 dark:text-zinc-400 normal-case leading-relaxed">
              Jalan Raya Yadika No. 11, Kelas XI-J.<br />
              Wadah pembentukan generasi berprestasi, berkarakter kuat, dan cinta lingkungan.<br />
              SMA Yadika 11 - Disiplin, Jujur, Berprestasi!
            </p>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="mx-auto max-w-7xl px-6 border-t-2 border-black mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 dark:border-white">
          <span className="text-[10px] tracking-wider text-zinc-500">© 2026 KELAS XI-J SMA YADIKA 11 • SEMUA HAK DILINDUNGI.</span>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 dark:text-zinc-400 font-black">
            <span>DIBUAT DENGAN</span>
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span>UNTUK KENYAMANAN BELAJAR KELAS XI-J</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
