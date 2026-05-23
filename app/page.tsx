'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Welcome from '../components/Welcome';
import Dashboard from '../components/Dashboard';
import ScheduleManager from '../components/ScheduleManager';
import AttendanceLogs from '../components/AttendanceLogs';
import Leaderboard from '../components/Leaderboard';
import TeacherDashboard from '../components/TeacherDashboard';
import Settings from '../components/Settings';
import Footer from '../components/Footer';
import { db, User, Schedule, Report } from '../lib/db';
import { getSupabaseClient } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

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

  // Check login session in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cmon_session_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setCurrentUser(parsed);
          setCurrentTab('dashboard'); // Redirect to dashboard if logged in
        } catch (e) {
          console.error(e);
        }
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

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cmon_session_user', JSON.stringify(updatedUser));
    }
    refreshAllData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cmon_session_user');
    }
    setCurrentTab('welcome');
  };

  const handleActionComplete = () => {
    refreshAllData();
  };

  // Determine active dashboard view dynamically based on role
  const renderDashboardTab = () => {
    if (currentUser && currentUser.role === 'guru') {
      return (
        <TeacherDashboard 
          currentUser={currentUser}
          students={students}
          schedules={schedules}
          logs={logs}
          onActionComplete={handleActionComplete}
        />
      );
    }
    
    return (
      <Dashboard 
        currentUser={currentUser}
        students={students}
        schedules={schedules}
        logs={logs}
        onActionComplete={handleActionComplete}
        setCurrentTab={setCurrentTab}
      />
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbf8] text-black">
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
            <div className="flex h-16 w-16 items-center justify-center border-4 border-black bg-yellow-300 shadow-[4px_4px_0px_0px_#000000] animate-spin">
              <Loader2 className="h-8 w-8 stroke-[3px] text-black animate-spin" />
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-black animate-pulse">
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
            {currentTab === 'dashboard' && renderDashboardTab()}
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
            {currentTab === 'settings' && (
              <Settings 
                currentUser={currentUser}
                onProfileUpdate={handleProfileUpdate}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}
      </main>

      {/* Dense Visi Misi Slogan School Footer */}
      <Footer 
        setCurrentTab={setCurrentTab} 
        currentUser={currentUser} 
      />
    </div>
  );
}
