'use client';

import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Trash2, Edit2, Check, X, ShieldAlert, Search } from 'lucide-react';
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

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Student State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editNipd, setEditNipd] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nipd.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

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
    <div className="mx-auto max-w-7xl p-2 font-sans animate-fade-in space-y-5">
      
      {/* Page Header */}
      <div className="border-4 border-black bg-purple-300 p-5 shadow-[5px_5px_0px_0px_#000000]">
        <h1 className="text-3xl font-black tracking-tight text-black flex items-center gap-3">
          <Users className="h-9 w-9 stroke-[3px]" />
          KELOLA SISWA KELAS XI-J
        </h1>
        <p className="mt-1.5 text-xs font-bold text-zinc-800 uppercase">
          Manajemen nama siswa, NIPD login, dan koordinasi sandi kelas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 items-stretch">
        
        {/* Left column: Add Student Form */}
        <div className="lg:col-span-2 border-4 border-black bg-white p-5 shadow-[5px_5px_0px_0px_#000000] flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-1.5">
              <UserPlus className="h-5.5 w-5.5 stroke-[3px] text-purple-600" />
              Registrasi Siswa Baru
            </h2>

            <form onSubmit={handleAddStudent} className="space-y-3.5">
              <div>
                <label className="block text-[9px] font-black uppercase text-black mb-1">NAMA LENGKAP SISWA</label>
                <input
                  type="text"
                  required
                  placeholder="CONTOH: CLARISSA PUTRI"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-4 border-black bg-zinc-50 p-2 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[1.5px_1.5px_0px_0px_#000000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black uppercase text-black mb-1">NIPD / LOGIN ID</label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: 0007"
                    value={nipd}
                    onChange={(e) => setNipd(e.target.value)}
                    className="w-full border-4 border-black bg-zinc-50 p-2 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[1.5px_1.5px_0px_0px_#000000]"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-black mb-1">PASSWORD LOGIN</label>
                  <input
                    type="text"
                    required
                    placeholder="DEFAULT: 123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-4 border-black bg-zinc-50 p-2 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[1.5px_1.5px_0px_0px_#000000]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full border-2 border-black bg-purple-300 p-2.5 font-black text-xs uppercase text-black transition-all shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 cursor-pointer"
              >
                {adding ? 'MENAMBAHKAN...' : 'TAMBAH SISWA BARU ➕'}
              </button>
            </form>
          </div>

          {/* Guidelines info */}
          <div className="mt-6 border-2 border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_0px_#000000]">
            <p className="text-[9px] font-black uppercase flex items-center gap-1 mb-0.5 text-zinc-900">
              <ShieldAlert className="h-4.5 w-4.5 stroke-[2.5px] text-orange-500 shrink-0" />
              INFORMASI ALUR PIKET
            </p>
            <p className="text-[8px] font-bold text-zinc-500 uppercase leading-relaxed">
              Setelah mendaftarkan siswa baru, harap langsung tambahkan nama mereka ke roster mingguan di tab **JADWAL PIKET** agar terdaftar di regu harian.
            </p>
          </div>
        </div>

        {/* Right column: Scrollable student lists in a neat, fixed-height panel */}
        <div className="lg:col-span-3 border-4 border-black bg-white p-5 shadow-[5px_5px_0px_0px_#000000] flex flex-col h-[480px]">
          
          {/* List Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-4 border-black pb-3 mb-4 shrink-0 gap-2">
            <h2 className="text-xl font-black uppercase text-black leading-none">
              Daftar Anggota ({students.length} Siswa)
            </h2>
            
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 stroke-[3px] text-black" />
              <input
                type="text"
                placeholder="Cari NIPD / nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-black bg-zinc-50 pl-8 pr-2.5 py-1.5 font-bold text-[10px] placeholder-zinc-400 uppercase outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Compact Students List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200">
                <Users className="mx-auto h-10 w-10 stroke-[2px] mb-1 opacity-50" />
                <p className="text-xs uppercase">Siswa tidak ditemukan</p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isEditing = editingId === student.id;

                return (
                  <div
                    key={student.id}
                    className={`border-2 border-black p-3 bg-white shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:shadow-none transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isEditing ? 'bg-yellow-50 border-pink-400' : ''
                    }`}
                  >
                    {isEditing ? (
                      /* Compact Inline Edit Form */
                      <div className="flex-1 grid gap-3 sm:grid-cols-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nama Siswa"
                          className="border-2 border-black bg-white px-2 py-1 font-bold text-xs uppercase"
                        />
                        <input
                          type="text"
                          value={editNipd}
                          onChange={(e) => setEditNipd(e.target.value)}
                          placeholder="NIPD"
                          className="border-2 border-black bg-white px-2 py-1 font-bold text-xs"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Sandi"
                            className="flex-1 border-2 border-black bg-white px-2 py-1 font-bold text-xs"
                          />
                          <button
                            onClick={() => handleUpdateStudent(student.id)}
                            disabled={updating}
                            className="bg-green-300 border-2 border-black h-8 w-8 flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            title="Simpan"
                          >
                            <Check className="h-4 w-4 stroke-[3px] text-black" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-red-300 border-2 border-black h-8 w-8 flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_0px_#000000]"
                            title="Batal"
                          >
                            <X className="h-4 w-4 stroke-[3px] text-black" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Compact Row View */
                      <>
                        <div className="min-w-0 flex-1 flex items-center gap-3">
                          <span className="border-2 border-black bg-zinc-900 px-2 py-0.5 text-[9px] font-black text-white shrink-0 shadow-[1px_1px_0px_0px_#000000]">
                            {student.nipd}
                          </span>
                          <div className="truncate">
                            <h3 className="text-xs font-black text-black uppercase truncate">{student.name}</h3>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase">SANDI: {student.password || '123'}</span>
                          </div>
                        </div>

                        {/* Operations */}
                        <div className="flex gap-1.5 shrink-0 justify-end">
                          <button
                            onClick={() => handleEditClick(student)}
                            className="border border-black bg-white hover:bg-zinc-100 p-1.5 text-[9px] font-black uppercase text-black flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3 stroke-[3px] text-zinc-700" />
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="border border-black bg-red-100 hover:bg-red-200 p-1.5 text-[9px] font-black uppercase text-red-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3 stroke-[3px]" />
                            HAPUS
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
