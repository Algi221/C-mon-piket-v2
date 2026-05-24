"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Smile,
  ShieldCheck,
  School,
  Clock,
  Calendar,
  Quote,
  Activity,
} from "lucide-react";
import { User } from "../lib/db";
import ScrollVelocity from "./ScrollVelocity";

interface WelcomeProps {
  currentUser: User | null;
  setCurrentTab: (tab: string) => void;
}

export default function Welcome({ currentUser, setCurrentTab }: WelcomeProps) {
  // Slogans
  const slogans = [
    {
      title: "Tanggung Jawab Bersama",
      desc: "Kebersihan kelas bukan tugas satu orang saja, melainkan cermin kerja sama kita semua!",
      color: "bg-yellow-300",
    },
    {
      title: "Belajar Lebih Nyaman",
      desc: "Kelas yang bersih melahirkan suasana belajar yang kondusif untuk prestasi maksimal!",
      color: "bg-cyan-300",
    },
    {
      title: "Disiplin & Konsistensi",
      desc: "Kebiasaan kecil membuang sampah pada tempatnya membentuk karakter disiplin masa depan!",
      color: "bg-pink-300",
    },
  ];

  // Interactive Quotes
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);
  const quotes = [
    '"Kebersihan adalah sebagian dari iman. Mari kita jaga kelas kita dengan hati gembira." - Budaya Sekolah',
    '"Kerja sama membuat beban yang berat terasa jauh lebih ringan. Semangat piket hari ini!" - Kelas Unggul',
    '"Disiplin dimulai dari hal-hal kecil seperti merapikan kursi setelah belajar." - Inspirasi Harian',
    '"Hari ini bersih, esok hari berprestasi. Masa depan yang cerah dimulai dari kelas yang rapi!" - Slogan Juara',
    '"Sebuah ruangan mencerminkan pikiran penghuninya. Mari jaga kebersihan pikiran dan kelas kita!" - Motivasi XI-J',
    '"Semangat piket adalah bentuk cinta terkecil kita pada kenyamanan bersama di sekolah!" - Sahabat Kelas',
  ];

  const handleNextQuote = () => {
    setCurrentQuoteIdx((prev) => (prev + 1) % quotes.length);
  };

  // Automated Quotes Rotation (Every 4 Seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIdx((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  // Live Time
  const [liveTime, setLiveTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setLiveTime(`${hh}:${mm}:${ss}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Static Mock Schedules for Preview (Vibrant HSL Pastels - featuring sky blue bagdes)
  const weeklyPreview = [
    {
      day: "Senin",
      pj: "AIRA DINARA JASMINE",
      member: "ALVIRA DINARA PUTRI",
      color: "bg-yellow-300",
      icon: "🔥",
    },
    {
      day: "Selasa",
      pj: "ALYA NAFISA PUTRI",
      member: "AMANDA KANYA PUTRI",
      color: "bg-cyan-300",
      icon: "⚡",
    },
    {
      day: "Rabu",
      pj: "Bagus Prastyo",
      member: "Anggota Regu Rabu",
      color: "bg-pink-300",
      icon: "🌟",
    },
    {
      day: "Kamis",
      pj: "Citra Kirana",
      member: "Anggota Regu Kamis",
      color: "bg-purple-300",
      icon: "✨",
    },
    {
      day: "Jumat",
      pj: "Dedi Corbuzier",
      member: "Anggota Regu Jumat",
      color: "bg-emerald-300",
      icon: "💪",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-4 font-sans md:p-6 animate-fade-in text-black dark:text-white">
      {/* Grand Top Announcement / Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 border-2 border-black dark:border-white bg-amber-300 dark:bg-amber-300 px-4 py-1.5 shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#ffffff] text-black">
          <School className="h-4 w-4 stroke-[3px]" />
          <span className="text-[10px] font-black uppercase tracking-wider">
            SMA YADIKA 11 KELAS XI-J • OFFICIAL PLATFORM
          </span>
        </div>
        <div className="flex items-center gap-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 px-4 py-1.5 shadow-[2px_2px_0px_0px_#000000] dark:shadow-[2px_2px_0px_0px_#ffffff] text-black dark:text-white">
          <Clock className="h-4 w-4 stroke-[2.5px] text-pink-500" />
          <span className="text-[10px] font-black tracking-widest">
            {liveTime || "00:00:00"} WIB
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid gap-8 lg:grid-cols-5 items-stretch mb-12">
        {/* Left Column - Mega Hero Greeting Card */}
        <div className="lg:col-span-3 border-4 border-black dark:border-white bg-gradient-to-br from-yellow-300 to-yellow-100 dark:from-yellow-400 dark:to-yellow-200 p-8 shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ffffff] flex flex-col justify-between text-black rounded-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform pointer-events-none" />
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase shadow-[2.5px_2.5px_0px_0px_#000000]">
                🚀 NEW UPDATE V2.4
              </span>
              <span className="inline-block border-2 border-black bg-purple-400 px-3 py-1 text-xs font-black uppercase shadow-[2.5px_2.5px_0px_0px_#000000] text-black">
                XI-J YADIKA 11
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none uppercase select-none text-black">
              WELCOME TO
              <br />
              <span className="text-purple-600 dark:text-purple-700 bg-white px-2 py-0.5 border-2 border-black inline-block mt-2 shadow-[3px_3px_0px_0px_#000000]">
                PIKET SYSTEM
              </span>
              <br />
              KELAS XI-J!
            </h1>
            <p className="mt-6 text-xs sm:text-sm font-bold leading-relaxed uppercase text-zinc-900">
              Wadah Kedisiplinan, Kerja Sama, dan Kebersihan Lingkungan Belajar
              Kita. Selamat datang di platform pencatatan dan verifikasi roster
              piket kelas XI-J Yadika 11. Jadilah bagian dari gerakan kelas
              sehat bebas kotoran!
            </p>
          </div>

          {/* Inspirational quotes card with 4s automated transitions */}
          <div className="mt-8 border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#000000] flex items-center justify-between gap-3 text-black">
            <div className="flex items-start gap-3 min-w-0">
              <Quote className="h-6 w-6 stroke-[3px] text-pink-500 shrink-0 mt-0.5" />
              <p className="text-xs font-black text-zinc-800 uppercase italic leading-tight truncate-two-lines">
                {quotes[currentQuoteIdx]}
              </p>
            </div>
            <button
              onClick={handleNextQuote}
              className="border-2 border-black bg-cyan-300 hover:bg-cyan-200 px-3 py-2 text-[10px] font-black uppercase shrink-0 shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer hover:scale-105 transition-transform"
              title="Ganti Kata Motivasi"
            >
              ACAK ⚡
            </button>
          </div>
        </div>

        {/* Right Column - Premium Roster Stats Panel */}
        <div className="lg:col-span-2 border-4 border-black dark:border-white bg-white dark:bg-red-700 p-6 shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ffffff] flex flex-col justify-between rounded-sm">
          <div>
            <div className="flex justify-between items-center border-b-4 border-black dark:border-white pb-3 mb-5">
              <span className="border-2 border-black bg-pink-300 dark:bg-pink-300 px-3 py-1 text-[10px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_#000000] text-black">
                INFORMASI SISTEM
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-500 dark:text-zinc-400">
                <Activity className="h-3.5 w-3.5 text-green-500 animate-pulse" />
                <span>STATUS ONLINE</span>
              </div>
            </div>

            <h2 className="text-2xl font-black uppercase text-black dark:text-white leading-tight">
              DASBOR RINGKAS XI-J
            </h2>
            <p className="text-[10px] font-bold text-zinc-900 dark:text-black uppercase mt-1 leading-relaxed">
              Pantau regu piket harian Anda, laporkan kebersihan kelas dengan 3
              foto wajib + 1 video, dan pertahankan poin kebersihan kelas
              terbaik!
            </p>

            {/* Quick Metrics Portal (4 Grid Blocks) */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="border-2 border-black dark:border-white bg-zinc-50 dark:bg-blue-800 p-3 shadow-[2.5px_2.5px_0px_0px_#000000] dark:shadow-[2.5px_2.5px_0px_0px_#ffffff] flex flex-col justify-between">
                <span className="text-[8px] font-black text-zinc-400 uppercase">
                  Tingkat Kebersihan
                </span>
                <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  98.5% ⭐
                </span>
              </div>
              <div className="border-2 border-black dark:border-white bg-zinc-50 dark:bg-blue-800 p-3 shadow-[2.5px_2.5px_0px_0px_#000000] dark:shadow-[2.5px_2.5px_0px_0px_#ffffff] flex flex-col justify-between">
                <span className="text-[8px] font-black text-zinc-400 uppercase">
                  Poin Kehadiran
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  1,240 XP 🏆
                </span>
              </div>
              <div className="border-2 border-black dark:border-white bg-zinc-50 dark:bg-blue-800 p-3 shadow-[2.5px_2.5px_0px_0px_#000000] dark:shadow-[2.5px_2.5px_0px_0px_#ffffff] flex flex-col justify-between">
                <span className="text-[8px] font-black text-zinc-400 uppercase">
                  Laporan Aktif
                </span>
                <span className="text-xl font-black text-pink-600 dark:text-pink-400 mt-1">
                  36 Terkirim 📂
                </span>
              </div>
              <div className="border-2 border-black dark:border-white bg-zinc-50 dark:bg-blue-800 p-3 shadow-[2.5px_2.5px_0px_0px_#000000] dark:shadow-[2.5px_2.5px_0px_0px_#ffffff] flex flex-col justify-between">
                <span className="text-[8px] font-black text-zinc-400 uppercase">
                  Status Minggu Ini
                </span>
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-2 truncate">
                  REKOR SEMPURNA 🔥
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t-2 border-zinc-100 dark:border-zinc-800">
            {currentUser ? (
              <button
                onClick={() => setCurrentTab("dashboard")}
                className="w-full border-4 border-black dark:border-white bg-cyan-300 p-4 font-black text-xs uppercase text-black transition-all shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer flex items-center justify-center gap-2 hover:bg-cyan-200"
              >
                MASUK KE DASHBOARD ANDA ➔
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab("login")}
                className="w-full border-4 border-black dark:border-white bg-pink-400 p-4 font-black text-xs uppercase text-black transition-all shadow-[4px_4px_0px_0px_#000000] dark:shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#000000] dark:hover:shadow-[6px_6px_0px_0px_#ffffff] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer flex items-center justify-center gap-2 hover:bg-pink-300"
              >
                <span>MASUK! 🚀</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Parallax Scroll Banner - COMPACTED NO BLACK BG & HIGH CONTRAST */}
      <div className="my-12 border-y-4 border-black dark:border-white bg-transparent py-6 relative overflow-hidden">
        <ScrollVelocity
          texts={[
            "⚡ KELAS XI-J SMA YADIKA 11 PIKET ⚡",
            "⚡ DISIPLIN KERJASAMA KONSISTENSI KELAS BERSIH ⚡",
          ]}
          velocity={12}
          className="text-black dark:text-blue-800 font-black uppercase select-none font-sans text-2xl md:text-4xl tracking-wider"
        />
      </div>

      

      {/* School Illustration Decoration Block */}
      <div className="mb-12 grid gap-8 md:grid-cols-5 items-stretch">
        {/* Left Columns - Vision and Mission Info */}
        <div className="md:col-span-3 border-4 border-black dark:border-white bg-purple-200 dark:bg-purple-300 p-8 shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ffffff] flex flex-col justify-between text-black rounded-sm">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-3">
              <School className="h-6 w-6 stroke-[2.5px] text-zinc-900" />
              <h2 className="text-3xl font-black uppercase text-black leading-none">
                VISI & MISI PIKET XI-J
              </h2>
            </div>

            <p className="text-xs font-bold text-zinc-950 leading-relaxed uppercase mb-4">
              Mewujudkan kelas XI-J SMA Yadika 11 sebagai ruang belajar yang
              paling bersih, sehat, rapi, dan membanggakan melalui sistem piket
              terkomputerisasi yang modern, terbuka, dan bertanggung jawab
              penuh.
            </p>

            <div className="space-y-3 mt-4 text-black">
              <div className="flex items-start gap-3 border border-black bg-white p-3 text-[10px] font-black uppercase text-zinc-800 shadow-[2px_2px_0px_0px_#000000]">
                <span className="h-5 w-5 rounded-full bg-yellow-300 border-2 border-black flex items-center justify-center text-[9px] font-black shrink-0 shadow-[1px_1px_0px_0px_#000000]">
                  1
                </span>
                <p className="leading-tight">
                  Menanamkan budaya peduli kebersihan lingkungan belajar sejak
                  dini bagi seluruh penghuni kelas XI-J.
                </p>
              </div>
              <div className="flex items-start gap-3 border border-black bg-white p-3 text-[10px] font-black uppercase text-zinc-800 shadow-[2px_2px_0px_0px_#000000]">
                <span className="h-5 w-5 rounded-full bg-cyan-300 border-2 border-black flex items-center justify-center text-[9px] font-black shrink-0 shadow-[1px_1px_0px_0px_#000000]">
                  2
                </span>
                <p className="leading-tight">
                  Mengoptimalkan kerja sama tim regu piket guna meringankan
                  tugas kebersihan kelas harian.
                </p>
              </div>
              <div className="flex items-start gap-3 border border-black bg-white p-3 text-[10px] font-black uppercase text-zinc-800 shadow-[2px_2px_0px_0px_#000000]">
                <span className="h-5 w-5 rounded-full bg-pink-300 border-2 border-black flex items-center justify-center text-[9px] font-black shrink-0 shadow-[1px_1px_0px_0px_#000000]">
                  3
                </span>
                <p className="leading-tight">
                  Menjamin pelaporan bukti kebersihan yang terverifikasi akurat
                  oleh Guru dan PJ Piket kelas.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t-2 border-black pt-4 flex items-center justify-between text-[10px] font-black uppercase text-zinc-900">
            <span>#AdiwiyataYadika11</span>
            <span>PRESTASI DIMULAI DARI KELAS BERSIH! 🏆</span>
          </div>
        </div>

        {/* Right Columns - High Impact Neubrutalist Illustration Frame */}
        <div className="md:col-span-2 border-4 border-black dark:border-white bg-white dark:bg-zinc-500 p-4 shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ffffff] flex flex-col justify-between rounded-sm">
          <div className="border-4 border-black relative overflow-hidden bg-blue-800 flex items-center justify-center h-full max-h-[380px] aspect-[4/3] sm:aspect-auto">
            <img
              src="/welcome_piket.png"
              alt="Siswa Piket Yadika 11"
              className="object-cover w-full h-full max-h-[370px]"
            />
          </div>
          <div className="mt-4 text-center">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
              DOKUMENTASI GERAKAN PIKET XI-J
            </span>
          </div>
        </div>
      </div>

      {/* Slogan Details (Pilar Kebersihan Kelas) */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black uppercase text-black dark:text-white leading-none">
          TIGA PILAR KEBERSIHAN KELAS
        </h2>
        <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mt-2">
          Prinsip dasar yang harus dijunjung tinggi oleh setiap siswa Kelas XI-J
          Yadika 11.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        {slogans.map((slo, idx) => (
          <div
            key={idx}
            className="border-4 border-black dark:border-white bg-white dark:bg-green-800 p-6 shadow-[5px_5px_0px_0px_#000000] dark:shadow-[5px_5px_0px_0px_#ffffff] hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_#000000] dark:hover:shadow-[7px_7px_0px_0px_#ffffff] transition-all flex flex-col justify-between rounded-sm"
          >
            <div>
              <div
                className={`h-12 w-12 border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center mb-4 ${slo.color} text-black`}
              >
                {idx === 0 ? (
                  <Smile className="h-6 w-6 stroke-[3px]" />
                ) : idx === 1 ? (
                  <BookOpen className="h-6 w-6 stroke-[3px]" />
                ) : (
                  <ShieldCheck className="h-6 w-6 stroke-[3px]" />
                )}
              </div>
              <h3 className="text-xl font-black uppercase text-black dark:text-white leading-none my-1">
                {slo.title}
              </h3>
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase leading-relaxed mt-2">
                {slo.desc}
              </p>
            </div>

            <div className="mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-3 flex justify-between items-center text-[9px] font-black text-zinc-400 uppercase">
              <span>PILAR UTAMA #{idx + 1}</span>
              <span className="text-pink-500">KONSISTEN ⚡</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
