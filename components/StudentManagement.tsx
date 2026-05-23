'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Edit2, Check, X, ShieldAlert, Sparkles } from 'lucide-react';
import { db, Student } from '../lib/db';

interface StudentManagementProps {
  students: Student[];
  onActionComplete: () => void;
}

export default function StudentManagement({ students, onActionComplete }: StudentManagementProps) {
  // Add Student Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit Student State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRollNumber, setEditRollNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNumber) {
      alert('Nama Lengkap dan Nomor Urut wajib diisi!');
      return;
    }
    setAdding(true);
    try {
      await db.createStudent(name, rollNumber);
      setName('');
      setRollNumber('');
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert('Gagal menambahkan siswa.');
    } finally {
      setAdding(false);
    }
  };

  const handleEditClick = (student: Student) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditRollNumber(student.roll_number);
  };

  const handleUpdateStudent = async (id: string) => {
    if (!editName || !editRollNumber) {
      alert('Nama dan Nomor Urut tidak boleh kosong!');
      return;
    }
    setUpdating(true);
    try {
      await db.updateStudent(id, editName, editRollNumber);
      setEditingId(null);
      onActionComplete();
    } catch (e) {
      console.error(e);
      alert('Gagal memperbarui data siswa.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStudent = async (id: string, studentName: string) => {
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
    <div className="mx-auto max-w-6xl p-4 font-sans md:p-6">
      
      {/* Page Header */}
      <div className="mb-8 border-4 border-black bg-purple-300 p-6 shadow-[6px_6px_0px_0px_#000000]">
        <h1 className="text-4xl font-black tracking-tight text-black flex items-center gap-3">
          <Users className="h-10 w-10 stroke-[3px]" />
          KELOLA SISWA KELAS
        </h1>
        <p className="mt-2 text-sm font-bold text-zinc-800 uppercase">
          Kelola nama, nomor urut siswa, dan atur anggota piket kelas secara langsung!
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
              <label className="block text-xs font-black uppercase text-black mb-1">NAMA LENGKAP SISWA</label>
              <input
                type="text"
                placeholder="CONTOH: AHMAD SUBARDJO"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-black mb-1">NOMOR URUT / ABSEN</label>
              <input
                type="text"
                placeholder="CONTOH: 01"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full border-4 border-black bg-zinc-50 p-2.5 font-bold text-xs placeholder-zinc-400 outline-none focus:bg-white shadow-[2px_2px_0px_0px_#000000]"
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full border-2 border-black bg-purple-300 p-3 font-black text-xs uppercase text-black transition-all shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000000] active:translate-x-0 active:translate-y-0 active:shadow-none"
            >
              {adding ? 'MENAMBAHKAN...' : 'TAMBAH SISWA! ➕'}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-6 border-2 border-black bg-zinc-50 p-3 shadow-[2px_2px_0px_0px_#000000]">
            <p className="text-[10px] font-black uppercase flex items-center gap-1 mb-1">
              <ShieldAlert className="h-4 w-4 stroke-[2.5px] text-orange-500" />
              Catatan Penting
            </p>
            <p className="text-[10px] font-bold text-zinc-600 uppercase leading-relaxed">
              Setelah menambahkan siswa, pastikan untuk masuk ke halaman **JADWAL PIKET** untuk memasukkan mereka ke regu harian!
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
              <p className="text-xs font-bold text-zinc-400 uppercase mt-0.5">Silakan gunakan form di samping untuk mendaftarkan siswa.</p>
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
                          <label className="block text-[9px] font-black uppercase text-zinc-400 mb-0.5">EDIT NAMA</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full border-2 border-black bg-zinc-50 p-1.5 font-bold text-xs uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase text-zinc-400 mb-0.5">EDIT NO URUT</label>
                          <input
                            type="text"
                            value={editRollNumber}
                            onChange={(e) => setEditRollNumber(e.target.value)}
                            className="w-full border-2 border-black bg-zinc-50 p-1.5 font-bold text-xs"
                          />
                        </div>
                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => handleUpdateStudent(student.id)}
                            disabled={updating}
                            className="flex-1 border-2 border-black bg-green-300 py-1 text-[10px] font-black uppercase text-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#000000]"
                          >
                            <Check className="h-3 w-3 stroke-[3px]" /> SIMPAN
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 border-2 border-black bg-red-300 py-1 text-[10px] font-black uppercase text-black flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_#000000]"
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
                            <span className="border-2 border-black bg-zinc-950 px-2 py-0.5 text-[9px] font-black text-white uppercase">
                              NO. {student.roll_number}
                            </span>
                            <span className="border border-black bg-emerald-100 px-1.5 py-0.2 text-[9px] font-black text-emerald-800 uppercase">
                              {student.points} Poin
                            </span>
                          </div>

                          <h3 className="text-lg font-black text-black leading-tight uppercase truncate">
                            {student.name}
                          </h3>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
                            Streak Piket: {student.streak} 🔥
                          </p>
                        </div>

                        {/* Card Operations */}
                        <div className="mt-4 flex gap-2 border-t-2 border-zinc-100 pt-3">
                          <button
                            onClick={() => handleEditClick(student)}
                            className="flex-1 border border-black bg-white hover:bg-zinc-100 py-1.5 text-[10px] font-black uppercase text-black transition-all flex items-center justify-center gap-1"
                          >
                            <Edit2 className="h-3 w-3 stroke-[3.5px] text-zinc-600" />
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="flex-1 border border-black bg-red-100 hover:bg-red-200 py-1.5 text-[10px] font-black uppercase text-red-700 transition-all flex items-center justify-center gap-1"
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
