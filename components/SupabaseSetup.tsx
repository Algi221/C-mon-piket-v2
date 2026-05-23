'use client';

import React, { useState, useEffect } from 'react';
import { Database, Link2, Copy, Check, Info, Sparkles, RefreshCw, Trash2 } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabase';
import { db, SUPABASE_SQL_SCHEMA } from '../lib/db';

interface SupabaseSetupProps {
  onConnectionChange: () => void;
  supabaseConnected: boolean;
}

export default function SupabaseSetup({ onConnectionChange, supabaseConnected }: SupabaseSetupProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ success?: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [configSource, setConfigSource] = useState<'env' | 'localStorage' | 'default' | 'none'>('none');

  useEffect(() => {
    const config = getSupabaseConfig();
    setUrl(config.url || '');
    setAnonKey(config.anonKey || '');
    setConfigSource(config.source);
  }, [supabaseConnected]);

  const handleSave = () => {
    if (!url || !anonKey) {
      alert('Tolong masukkan Supabase URL dan Anon Key terlebih dahulu!');
      return;
    }
    saveSupabaseConfig(url, anonKey);
    onConnectionChange();
    setSyncStatus({ message: 'Konfigurasi disimpan! Menghubungkan ke Supabase...' });
  };

  const handleClear = () => {
    if (confirm('Apakah Anda yakin ingin menghapus konfigurasi Supabase? Aplikasi akan kembali menggunakan penyimpanan lokal (offline).')) {
      clearSupabaseConfig();
      setUrl('');
      setAnonKey('');
      onConnectionChange();
      setSyncStatus(null);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus({ message: 'Sedang mensinkronisasikan data lokal ke Supabase...' });
    try {
      const res = await db.syncToSupabase();
      setSyncStatus(res);
    } catch (e: any) {
      setSyncStatus({ success: false, message: 'Gagal melakukan sinkronisasi: ' + e.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl p-4 font-sans md:p-6">
      {/* Page Header */}
      <div className="mb-8 border-4 border-black bg-orange-300 p-6 shadow-[6px_6px_0px_0px_#000000]">
        <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
          <Database className="h-10 w-10 stroke-[3px]" />
          SUPABASE BACKEND CONFIG
        </h1>
        <p className="mt-2 text-lg font-bold text-zinc-800 uppercase">
          Hubungkan aplikasi piket Anda ke database cloud Supabase untuk sinkronisasi waktu nyata!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Connection Form */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
              <Link2 className="h-6 w-6 stroke-[3px] text-orange-500" />
              Koneksi Database
            </h2>

            {configSource === 'env' && (
              <div className="mb-4 border-2 border-black bg-green-100 p-3 text-sm font-bold flex items-start gap-2 shadow-[2px_2px_0px_0px_#000000]">
                <Info className="h-4 w-4 stroke-[3px] text-green-700 shrink-0 mt-0.5" />
                <span>
                  Menggunakan kredensial dari environment variable (<code>.env.local</code>). Form di bawah dinonaktifkan.
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-black uppercase text-black mb-1">SUPABASE URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={configSource === 'env'}
                  placeholder="https://xxxxxx.supabase.co"
                  className="w-full border-4 border-black bg-zinc-50 p-3 font-bold text-black placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000] focus:shadow-[4px_4px_0px_0px_#000000] disabled:bg-zinc-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase text-black mb-1">SUPABASE ANON KEY</label>
                <textarea
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  disabled={configSource === 'env'}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  rows={3}
                  className="w-full border-4 border-black bg-zinc-50 p-3 font-bold text-black placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000] focus:shadow-[4px_4px_0px_0px_#000000] disabled:bg-zinc-100 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {configSource !== 'env' && (
              <button
                onClick={handleSave}
                className="border-2 border-black bg-yellow-300 px-5 py-3 font-black uppercase transition-all shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none"
              >
                HUBUNGKAN SEKARANG!
              </button>
            )}

            {configSource === 'localStorage' && (
              <button
                onClick={handleClear}
                className="border-2 border-black bg-red-400 px-4 py-3 font-black uppercase text-black transition-all shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4 stroke-[3px]" />
                PUTUSKAN
              </button>
            )}
          </div>
        </div>

        {/* Connection Status Panel */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black uppercase mb-4">Status Koneksi</h2>
            
            <div className={`border-4 border-black p-4 text-center font-black shadow-[4px_4px_0px_0px_#000000] mb-4 ${
              supabaseConnected ? 'bg-green-300 text-black' : 'bg-red-300 text-black'
            }`}>
              <p className="text-3xl mb-1">{supabaseConnected ? 'ONLINE' : 'OFFLINE'}</p>
              <p className="text-xs uppercase">{supabaseConnected ? 'Sinkronisasi Cloud Aktif' : 'Penyimpanan Lokal Aktif'}</p>
            </div>

            <p className="text-sm font-bold text-zinc-700 leading-relaxed uppercase">
              {supabaseConnected 
                ? 'Semua perubahan data (siswa, jadwal, absensi) akan tersimpan langsung di database cloud Supabase Anda.' 
                : 'Aplikasi saat ini berjalan offline. Semua data disimpan secara lokal di browser Anda. Kapanpun Anda menyambungkan Supabase, data ini bisa disinkronisasikan!'}
            </p>
          </div>

          {supabaseConnected && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="mt-6 border-2 border-black bg-cyan-300 p-3 font-black uppercase text-black transition-all shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 stroke-[3px] ${syncing ? 'animate-spin' : ''}`} />
              SINKRONISASI DATA
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Notifications */}
      {syncStatus && (
        <div className={`mt-6 border-4 border-black p-4 font-bold shadow-[4px_4px_0px_0px_#000000] flex items-center gap-3 ${
          syncStatus.success === true ? 'bg-green-300' : syncStatus.success === false ? 'bg-red-300' : 'bg-yellow-100'
        }`}>
          <Sparkles className="h-6 w-6 stroke-[3px] text-black shrink-0" />
          <span className="uppercase text-black text-sm">{syncStatus.message}</span>
        </div>
      )}

      {/* Database Schema Guide */}
      <div className="mt-8 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-4">
          <h2 className="text-2xl font-black uppercase flex items-center gap-2">
            <Info className="h-6 w-6 stroke-[3px] text-cyan-500" />
            Langkah Persiapan Supabase Database
          </h2>
          <button
            onClick={handleCopySql}
            className="border-2 border-black bg-purple-300 px-4 py-2 text-xs font-black uppercase transition-all shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none flex items-center gap-1.5"
          >
            {copiedSql ? <Check className="h-3.5 w-3.5 stroke-[3px]" /> : <Copy className="h-3.5 w-3.5 stroke-[3px]" />}
            {copiedSql ? 'TERSALIN!' : 'SALIN SQL SCRIPT'}
          </button>
        </div>

        <ol className="list-decimal list-inside space-y-3 font-bold text-zinc-800 text-sm mb-6 uppercase">
          <li>Buat proyek baru di <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline text-orange-600 hover:text-orange-500">Supabase Dashboard</a>.</li>
          <li>Buka menu <span className="underline">SQL Editor</span> di panel kiri proyek Anda.</li>
          <li>Klik <span className="underline">New query</span>, lalu tempelkan (paste) script SQL di bawah ini.</li>
          <li>Klik tombol <span className="bg-emerald-600 text-white px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000000]">Run</span> di kanan bawah untuk membuat tabel secara otomatis beserta aturan RLS (Row Level Security).</li>
          <li>Salin **Project URL** dan **API Anon Key** Anda dari menu *Project Settings &gt; API*, lalu masukkan di form di atas!</li>
        </ol>

        {/* Code Block Container */}
        <div className="relative border-4 border-black bg-zinc-900 text-zinc-100 p-4 font-mono text-xs overflow-x-auto shadow-[4px_4px_0px_0px_#000000] max-h-60">
          <pre>{SUPABASE_SQL_SCHEMA}</pre>
        </div>
      </div>
    </div>
  );
}
