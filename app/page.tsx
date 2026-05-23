'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import ScheduleManager from '../components/ScheduleManager';
import AttendanceLogs from '../components/AttendanceLogs';
import Leaderboard from '../components/Leaderboard';
import StudentManagement from '../components/StudentManagement';
import SupabaseSetup from '../components/SupabaseSetup';
import { db, Student, DutySchedule, PiketTask, PiketLog } from '../lib/db';
import { getSupabaseClient } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Core app state
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<DutySchedule[]>([]);
  const [tasks, setTasks] = useState<PiketTask[]>([]);
  const [logs, setLogs] = useState<PiketLog[]>([]);

  const checkConnectionAndLoad = async () => {
    try {
      const client = getSupabaseClient();
      if (client) {
        // Try simple request to verify connectivity
        const { error } = await client.from('students').select('id').limit(1);
        if (!error) {
          setSupabaseConnected(true);
        } else {
          setSupabaseConnected(false);
          console.warn('Supabase request failed, running in Offline Mode:', error.message);
        }
      } else {
        setSupabaseConnected(false);
      }
    } catch (e) {
      setSupabaseConnected(false);
      console.warn('Supabase init failed, running in Offline Mode.');
    }

    await refreshAllData();
  };

  const refreshAllData = async () => {
    try {
      const [allStudents, allSchedules, allTasks, allLogs] = await Promise.all([
        db.getStudents(),
        db.getSchedules(),
        db.getTasks(),
        db.getLogs(),
      ]);

      setStudents(allStudents);
      setSchedules(allSchedules);
      setTasks(allTasks);
      setLogs(allLogs);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnectionAndLoad();
  }, []);

  const handleActionComplete = () => {
    refreshAllData();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbf8] text-black">
      {/* Dynamic Navigation Bar */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        supabaseConnected={supabaseConnected} 
      />

      {/* Main Container */}
      <main className="flex-1 pb-16 pt-6">
        {loading ? (
          // Neubrutalism Fullscreen Loader
          <div className="flex h-[60vh] flex-col items-center justify-center gap-4 font-sans">
            <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_#000000] animate-spin">
              <Loader2 className="h-8 w-8 stroke-[3px] text-black animate-spin" />
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-black">
              Mempersiapkan Rapor Piket...
            </p>
          </div>
        ) : (
          // Staggered tab entry animations
          <div className="animate-fade-in">
            {currentTab === 'dashboard' && (
              <Dashboard 
                students={students}
                schedules={schedules}
                tasks={tasks}
                onActionComplete={handleActionComplete}
              />
            )}
            {currentTab === 'schedule' && (
              <ScheduleManager 
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
            {currentTab === 'students' && (
              <StudentManagement 
                students={students}
                onActionComplete={handleActionComplete}
              />
            )}
            {currentTab === 'supabase' && (
              <SupabaseSetup 
                supabaseConnected={supabaseConnected}
                onConnectionChange={checkConnectionAndLoad}
              />
            )}
          </div>
        )}
      </main>

      {/* Modern Brutalist Footer */}
      <footer className="border-t-4 border-black bg-white py-6 text-center font-sans text-xs font-bold uppercase text-zinc-600">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>⚡ C-MON PIKET V2 • NEUBRUTALISME DESIGN SYSTEM</span>
          <div className="flex items-center gap-4">
            <span className="border-2 border-black bg-yellow-300 px-2 py-0.5 shadow-[1.5px_1.5px_0px_0px_#000000] text-black">
              NEXT.JS 16
            </span>
            <span className="border-2 border-black bg-cyan-300 px-2 py-0.5 shadow-[1.5px_1.5px_0px_0px_#000000] text-black">
              TAILWIND V4
            </span>
            <span className="border-2 border-black bg-pink-300 px-2 py-0.5 shadow-[1.5px_1.5px_0px_0px_#000000] text-black">
              SUPABASE CLOUD
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
