'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { db, User } from '../lib/db';

interface StudentManagementProps {
  currentUser: User | null;
  students: User[];
  onActionComplete: () => void;
}

export default function StudentManagement({ currentUser, students, onActionComplete }: StudentManagementProps) {
  // Add Student Form State
  const [name, setName] = useState('');
  const [nipd, setNipd] = useState('');
  const [password, setPassword] = useState('123');
  const [adding, setAdding] = useState(false);

  // Edit Student State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editNipd, setEditNipd] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'guru') {
      alert('Akses Ditolak! Hanya guru yang diizinkan mengelola daftar siswa.');
      return;
    }

    if (!name || !nipd) {
      alert('Nama Lengkap dan NIPD wajib diisi!');
      return;
    }
    setAdding(true);
    try {
      await db.createStudent(name, nipd, password);
      setName('');
      setNipd('');
      setPassword('123');
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert('Gagal menambahkan siswa.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditClick = (student: User) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditNipd(student.nipd);
    setEditPassword(student.password || '123');
  };

  const handleUpdateStudent = async (id: number) => {
    if (!editName || !editNipd) {
      alert('Nama dan NIPD tidak boleh kosong!');
      return;
    }
    setUpdating(true);
    try {
      await db.updateStudent(id, editName, editNipd, editPassword);
      setEditingId(null);
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert('Gagal memperbarui data siswa.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStudent = async (id: number, studentName: string) => {
    if (!currentUser || currentUser.role !== 'guru') {
      alert('Akses Ditolak! Hanya guru yang diizinkan menghapus siswa.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus "${studentName}" dari daftar siswa? Menghapus siswa juga akan menghapus jadwal piket miliknya!`)) {
      try {
        await db.deleteStudent(id);
        onActionComplete();
      } catch (e) {
        console.error(e);
        alert('Gagal menghapus siswa.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 font-sans md:p-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="mb-8 border-4 border-black bg-purple-300 p-6 shadow-[6px_6px_0px_0px_#000000]">
        <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
          <Users className="h-10 w-10 stroke-[3px]" />
          KELOLA SISWA KELAS
        </h1>
        <p className="mt-2 text-sm font-bold text-zinc-800 uppercase">
          Manajemen nama siswa, NIPD login, dan roster piket kelas. Perubahan disinkronkan langsung ke Supabase!
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        
        {/* Add Student Form */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] h-fit">
          <h2 className="text-2xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
            <UserPlus className="h-6 w-6 stroke-[3px] text-purple-600" />
            Tambah Siswa
          </h2>

          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-black mb-1">NAMA LENGKAP SISWA</label>
              <input
                type="text"
                placeholder="CONTOH: AHMAD SUBARDJO"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-black mb-1">NIPD / LOGIN ID</label>
              <input
                type="text"
                placeholder="CONTOH: 0006"
                value={nipd}
                onChange={(e) => setNipd(e.target.value)}
                className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-black mb-1">PASSWORD DAFTAR</label>
              <input
                type="text"
                placeholder="DEFAULT: 123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full border-2 border-black bg-purple-300 p-3 font-black text-xs uppercase text-black transition-all shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none cursor-pointer"
            >
              {adding ? 'MENAMBAHKAN...' : 'TAMBAH SISWA! ➕'}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-6 border-2 border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_0px_#000000]">
            <p className="text-[10px] font-black uppercase flex items-center gap-1 mb-1">
              <ShieldAlert className="h-4 w-4 stroke-[2.5px] text-orange-500" />
              Ingat Petugas
            </p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase leading-relaxed">
              Setelah mendaftarkan siswa baru, ingatlah untuk menetapkan jadwal piket mingguan mereka pada menu **JADWAL PIKET** agar terdaftar di regu harian!
            </p>
          </div>
        </div>

        {/* Students List */}
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000000] md:col-span-2">
          <h2 className="text-2xl font-black uppercase mb-4">
            Daftar Anggota Kelas ({students.length} Siswa)
          </h2>

          {students.length === 0 ? (
            <div className="border-4 border-dashed border-zinc-200 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-zinc-300 stroke-[2px] mb-2" />
              <p className="text-lg font-black text-zinc-400 uppercase">Belum ada siswa terdaftar!</p>
              <p className="text-xs font-bold text-zinc-400 uppercase mt-0.5">Daftarkan siswa baru menggunakan formulir di samping.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {students.map((student) => {
                const isEditing = editingId === student.id;

                return (
                  <div
                    key={student.id}
                    className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_#000000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000000] transition-all flex flex-col justify-between"
                  >
                    {isEditing ? (
                      // Editing Form View
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[8px] font-black uppercase text-zinc-400 mb-0.5">EDIT NAMA</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full border-2 border-black bg-zinc-50 p-1.5 font-bold text-xs uppercase"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[8px] font-black uppercase text-zinc-400 mb-0.5">EDIT NIPD</label>
                            <input
                              type="text"
                              value={editNipd}
                              onChange={(e) => setEditNipd(e.target.value)}
                              className="w-full border-2 border-black bg-zinc-50 p-1.5 font-bold text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] font-black uppercase text-zinc-400 mb-0.5">EDIT PASS</label>
                            <input
                              type="text"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className="w-full border-2 border-black bg-zinc-50 p-1.5 font-bold text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => handleUpdateStudent(student.id)}
                            disabled={updating}
                            className="flex-1 border-2 border-black bg-green-300 py-1 text-[10px] font-black uppercase text-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                          >
                            <Check className="h-3 w-3 stroke-[3px]" /> SIMPAN
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 border-2 border-black bg-red-300 py-1 text-[10px] font-black uppercase text-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
                          >
                            <X className="h-3 w-3 stroke-[3px]" /> BATAL
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Standard Card View
                      <>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="border border-black bg-zinc-950 px-2 py-0.5 text-[8px] font-black text-white uppercase">
                              NIPD: {student.nipd}
                            </span>
                            <span className="border border-black bg-purple-100 px-1.5 py-0.2 text-[8px] font-black text-purple-800 uppercase">
                              PASS: {student.password || '123'}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-black leading-tight uppercase truncate">
                            {student.name}
                          </h3>
                        </div>

                        {/* Card Operations */}
                        <div className="mt-4 flex gap-2 border-t-2 border-zinc-100 pt-3">
                          <button
                            onClick={() => handleEditClick(student)}
                            className="flex-1 border border-black bg-white hover:bg-zinc-100 py-1.5 text-[9px] font-black uppercase text-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3 stroke-[3.5px] text-zinc-600" />
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="flex-1 border border-black bg-red-100 hover:bg-red-200 py-1.5 text-[9px] font-black uppercase text-red-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3 stroke-[3.5px]" />
                            HAPUS
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
