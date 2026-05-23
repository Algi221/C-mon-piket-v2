'use client';

import React, { useState } from 'react';
import { Award, Search, Flame, Trophy, Star, ShieldAlert } from 'lucide-react';
import { Student } from '../lib/db';

interface LeaderboardProps {
  students: Student[];
}

export default function Leaderboard({ students }: LeaderboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Sort students by points (descending)
  const sortedStudents = [...students].sort((a, b) => b.points - a.points);

  const filteredStudents = sortedStudents.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = sortedStudents.slice(0, 3);
  const remaining = filteredStudents.slice(filteredStudents.length > 0 ? (sortedStudents.findIndex(s => s.id === filteredStudents[0].id) < 3 ? 3 : 0) : 0);

  return (
    <div className="mx-auto max-w-4xl p-4 font-sans md:p-6">
      
      {/* Page Header */}
      <div className="mb-8 border-4 border-black bg-green-300 p-6 shadow-[6px_6px_0px_0px_#000000]">
        <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
          <Trophy className="h-10 w-10 stroke-[3px]" />
          LEADERBOARD HERO PIKET!
        </h1>
        <p className="mt-2 text-sm font-bold text-zinc-800 uppercase">
          Siapakah penjaga kebersihan terbaik di kelas kita? Kumpulkan poin dari piket harian dan pertahankan streak Anda!
        </p>
      </div>

      {/* Podium of Top 3 (Only show if we have enough students) */}
      {students.length > 0 && searchTerm === '' && (
        <div className="mb-12 border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000]">
          <h2 className="text-2xl font-black uppercase text-center mb-8 flex items-center justify-center gap-2">
            <Star className="h-6 w-6 stroke-[3px] text-yellow-500 fill-yellow-300 animate-spin" />
            TIGA JUARA KELAS
          </h2>
          
          <div className="flex flex-col md:flex-row items-end justify-center gap-6 pt-8">
            
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="w-full md:w-48 flex flex-col items-center order-2 md:order-1 mt-6">
                <div className="border-4 border-black bg-cyan-100 p-4 shadow-[4px_4px_0px_0px_#000000] text-center w-full relative">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl">🥈</span>
                  <h3 className="font-black text-black truncate uppercase text-sm mt-1">{topThree[1].name}</h3>
                  <p className="text-xs font-bold text-zinc-500 uppercase mt-0.5">{topThree[1].points} Poin</p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs font-black text-orange-600">
                    <Flame className="h-4 w-4 fill-orange-500 stroke-[2px]" />
                    <span>STREAK: {topThree[1].streak}</span>
                  </div>
                </div>
                {/* Second Podium Stand */}
                <div className="border-x-4 border-b-4 border-black bg-cyan-300 h-20 w-full flex items-center justify-center font-black text-3xl shadow-[4px_4px_0px_0px_#000000]">
                  2
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="w-full md:w-56 flex flex-col items-center order-1 md:order-2">
                <div className="border-4 border-black bg-yellow-100 p-5 shadow-[4px_4px_0px_0px_#000000] text-center w-full relative border-b-4">
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-4xl animate-bounce">👑</span>
                  <h3 className="font-black text-black truncate uppercase text-base mt-1">{topThree[0].name}</h3>
                  <p className="text-sm font-black text-zinc-600 uppercase mt-0.5">{topThree[0].points} Poin</p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs font-black text-red-600">
                    <Flame className="h-4.5 w-4.5 fill-red-500 stroke-[2px]" />
                    <span>STREAK: {topThree[0].streak}</span>
                  </div>
                </div>
                {/* First Podium Stand */}
                <div className="border-x-4 border-b-4 border-black bg-yellow-300 h-32 w-full flex items-center justify-center font-black text-4xl shadow-[4px_4px_0px_0px_#000000]">
                  1
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="w-full md:w-44 flex flex-col items-center order-3 mt-12">
                <div className="border-4 border-black bg-pink-100 p-4 shadow-[4px_4px_0px_0px_#000000] text-center w-full relative">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl">🥉</span>
                  <h3 className="font-black text-black truncate uppercase text-sm mt-1">{topThree[2].name}</h3>
                  <p className="text-xs font-bold text-zinc-500 uppercase mt-0.5">{topThree[2].points} Poin</p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs font-black text-orange-600">
                    <Flame className="h-4 w-4 fill-orange-500 stroke-[2px]" />
                    <span>STREAK: {topThree[2].streak}</span>
                  </div>
                </div>
                {/* Third Podium Stand */}
                <div className="border-x-4 border-b-4 border-black bg-pink-300 h-14 w-full flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_0px_#000000]">
                  3
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Roster list search and filters */}
      <div className="mb-6 border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000000]">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[3px] text-zinc-400" />
          <input
            type="text"
            placeholder="CARI NAMA SISWA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-4 border-black bg-zinc-50 py-3 pl-11 pr-4 font-black uppercase text-black placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
          />
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="border-4 border-black bg-white shadow-[6px_6px_0px_0px_#000000]">
        
        {/* Table Header */}
        <div className="border-b-4 border-black bg-zinc-900 p-4 text-white font-black text-xs uppercase grid grid-cols-6 sm:grid-cols-8 items-center text-center">
          <div className="col-span-1">Peringkat</div>
          <div className="col-span-3 text-left">Nama Siswa</div>
          <div className="col-span-2">Points</div>
          <div className="col-span-2 hidden sm:block">Streak Harian</div>
        </div>

        {/* Table Body */}
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 font-bold border-t border-zinc-200 bg-zinc-50 uppercase text-sm">
            Tidak ada siswa ditemukan
          </div>
        ) : (
          filteredStudents.map((s, idx) => {
            const actualRank = sortedStudents.findIndex((st) => st.id === s.id) + 1;
            
            let rankBg = 'bg-zinc-100';
            if (actualRank === 1) rankBg = 'bg-yellow-300';
            else if (actualRank === 2) rankBg = 'bg-cyan-300';
            else if (actualRank === 3) rankBg = 'bg-pink-300';

            return (
              <div
                key={s.id}
                className="border-b-2 border-black p-4 grid grid-cols-6 sm:grid-cols-8 items-center text-center hover:bg-zinc-50 transition-all font-bold text-xs uppercase"
              >
                {/* Rank Number */}
                <div className="col-span-1 flex justify-center">
                  <span className={`h-8 w-8 flex items-center justify-center border-2 border-black font-black text-sm shadow-[1.5px_1.5px_0px_0px_#000000] ${rankBg}`}>
                    {actualRank}
                  </span>
                </div>

                {/* Name & roll */}
                <div className="col-span-3 text-left pl-2">
                  <p className="font-black text-sm text-black leading-none truncate">{s.name}</p>
                  <p className="text-[9px] text-zinc-500 font-bold mt-1">No. Urut: {s.roll_number}</p>
                </div>

                {/* Points */}
                <div className="col-span-2 text-center">
                  <span className="border-2 border-black bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 text-xs shadow-[1.5px_1.5px_0px_0px_#000000]">
                    {s.points} Pts
                  </span>
                </div>

                {/* Streaks */}
                <div className="col-span-2 hidden sm:flex items-center justify-center gap-1 font-black text-red-600">
                  {s.streak > 0 ? (
                    <>
                      <Flame className="h-4.5 w-4.5 fill-red-500 stroke-[2px]" />
                      <span>{s.streak} Piket</span>
                    </>
                  ) : (
                    <span className="text-zinc-400 font-bold text-[10px]">BELUM ADA</span>
                  )}
                </div>
              </div>
            );
          })
        )}

      </div>

    </div>
  );
}
