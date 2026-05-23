'use client';

import React from 'react';
import { School, Heart, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';
import TextPressure from './TextPressure';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  currentUser: any;
}

export default function Footer({ setCurrentTab, currentUser }: FooterProps) {
  return (
    <footer className="border-t-4 border-black bg-white pt-12 pb-6 font-sans">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        
        {/* Main Grid */}
        <div className="grid gap-8 md:grid-cols-3 border-b-4 border-black pb-10">
          
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-2xl font-black tracking-wider text-black">
              <span className="flex h-10 w-10 items-center justify-center border-4 border-black bg-yellow-300 text-xl font-bold shadow-[2px_2px_0px_0px_#000000]">
                ⚡
              </span>
              <span>XI-J YADIKA 11</span>
            </div>
            
            <p className="text-xs font-bold text-zinc-600 uppercase leading-relaxed">
              Sistem manajemen kebersihan kelas dan absensi piket harian mandiri untuk mewujudkan lingkungan ruang kelas yang sehat, rapi, wangi, dan tertib.
            </p>

            <div className="flex items-center gap-2 border-2 border-black bg-yellow-100 p-2.5 shadow-[2px_2px_0px_0px_#000000] text-[10px] font-black uppercase text-zinc-900 w-fit">
              <ShieldCheck className="h-4.5 w-4.5 text-yellow-600 stroke-[2.5px]" />
              <span>DISIPLIN • KONSISTENSI • KERJASAMA</span>
            </div>
          </div>

          {/* Column 2: Visi & Misi Kebersihan */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-black border-b-2 border-black pb-1.5 w-fit">
              Visi & Misi Kebersihan
            </h3>
            <p className="text-xs font-bold text-zinc-600 uppercase leading-relaxed">
              Membentuk karakter disiplin dan tanggung jawab sosial siswa secara berkesinambungan melalui kebiasaan menjaga ruang kelas bersih demi kenyamanan belajar bersama yang kondusif.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-pink-600">
              <Heart className="h-4 w-4 fill-pink-500 stroke-[2px]" />
              <span>KELAS BERSIH, FIKIRAN JERNIH!</span>
            </div>
          </div>

          {/* Column 3: Contact & Yadika Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-black border-b-2 border-black pb-1.5 w-fit">
              Hubungi Kami
            </h3>
            <div className="space-y-2.5 text-[10px] font-black uppercase text-zinc-700">
              <div className="flex items-start gap-2">
                <MapPin className="h-4.5 w-4.5 stroke-[2.5px] text-zinc-900 shrink-0" />
                <span>SMA YADIKA 11, KAMPUS RAMAH LINGKUNGAN, TANGERANG</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4.5 w-4.5 stroke-[2.5px] text-zinc-900 shrink-0" />
                <span>+62 21-XXXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 stroke-[2.5px] text-zinc-900 shrink-0" />
                <span>INFO@SMAYADIKA11.SCH.ID</span>
              </div>
            </div>
          </div>

        </div>

        {/* Huge Interactive TextPressure "XI-J" Banner */}
        <div className="py-8 select-none">
          <div className="h-32 md:h-44 w-full flex items-center justify-center">
            <TextPressure 
              text="XI-J" 
              textColor="#000000" 
              fontFamily="Compressa VF" 
              width={true}
              weight={true}
              italic={true}
              minFontSize={80}
              className="font-extrabold"
            />
          </div>
        </div>

        {/* Copy footnote */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-zinc-200 text-[10px] font-black uppercase text-zinc-400">
          <span>© 2026 KELAS XI-J SMA YADIKA 11 • HAK CIPTA DILINDUNGI</span>
          <div className="flex gap-4">
            <button onClick={() => setCurrentTab('welcome')} className="hover:text-black transition-colors cursor-pointer">HALAMAN UTAMA</button>
            <button onClick={() => setCurrentTab(currentUser ? 'dashboard' : 'welcome')} className="hover:text-black transition-colors cursor-pointer">DASHBOARD PIKET</button>
            <button onClick={() => setCurrentTab('leaderboard')} className="hover:text-black transition-colors cursor-pointer">LEADERBOARD JUARA</button>
          </div>
        </div>

      </div>
    </footer>
  );
}
