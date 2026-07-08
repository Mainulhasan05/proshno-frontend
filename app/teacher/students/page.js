'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  fetchStudents,
  createStudent,
  updateStudent,
  toggleStudentActive,
  deleteStudent,
} from '@/store/slices/teacherSlice';
import { fetchClasses, fetchVersions } from '@/store/slices/hierarchySlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Skeleton from '@/components/ui/Skeleton';
import {
  HiOutlineUsers,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineSearch,
} from 'react-icons/hi';

export default function TeacherStudentsPage() {
  const dispatch = useDispatch();
  const { students, isLoading } = useSelector((state) => state.teacher);
  const { classes, versions } = useSelector((state) => state.hierarchy);

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', classId: '', versionId: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    if (form.classId) {
      dispatch(fetchVersions({ classId: form.classId }));
    }
  }, [form.classId, dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchStudents(search ? { search } : {}));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, dispatch]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setForm({ name: '', email: '', phone: '', password: '', classId: '', versionId: '' });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      password: '',
      classId: student.classId?._id || student.classId || '',
      versionId: student.versionId?._id || student.versionId || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('নাম এবং ইমেইল আবশ্যক');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingStudent) {
        await dispatch(updateStudent({
          id: editingStudent._id,
          body: {
            name: form.name,
            phone: form.phone,
            classId: form.classId || undefined,
            versionId: form.versionId || undefined,
          },
        })).unwrap();
      } else {
        await dispatch(createStudent({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password || 'Student@123',
          classId: form.classId || undefined,
          versionId: form.versionId || undefined,
        })).unwrap();
      }
      setShowModal(false);
      dispatch(fetchStudents());
    } catch (err) {
      setFormError(err || 'সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    await dispatch(toggleStudentActive(id));
  };

  const handleDelete = async (id) => {
    if (!confirm('এই শিক্ষার্থী মুছে ফেলতে চান?')) return;
    await dispatch(deleteStudent(id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">শিক্ষার্থী</h1>
          <p className="text-sm text-neutral-500 mt-1">আপনার শিক্ষার্থী ব্যবস্থাপনা</p>
        </div>
        <Button variant="primary" icon={HiOutlinePlus} onClick={openCreateModal}>
          শিক্ষার্থী যোগ
        </Button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <Input
          placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
          leftIcon={HiOutlineSearch}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="space-y-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <HiOutlineUsers className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">কোনো শিক্ষার্থী নেই</p>
          <p className="text-sm mt-1">শিক্ষার্থী যোগ করতে উপরের বাটনে ক্লিক করুন</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase">
            <div className="col-span-3">নাম</div>
            <div className="col-span-3">ইমেইল</div>
            <div className="col-span-2">ক্লাস</div>
            <div className="col-span-2">অবস্থা</div>
            <div className="col-span-2 text-right">অ্যাকশন</div>
          </div>
          <div className="divide-y divide-neutral-100">
            {students.map((student, idx) => (
              <motion.div
                key={student._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors items-center"
              >
                <div className="col-span-3">
                  <p className="text-sm font-medium text-neutral-800">{student.name}</p>
                  {student.phone && <p className="text-xs text-neutral-400">{student.phone}</p>}
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-neutral-600 truncate">{student.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-neutral-600">
                    {student.classId?.name || '—'}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {student.versionId?.name || ''}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${student.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${student.isActive ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                    {student.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditModal(student)}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                    title="সম্পাদনা"
                  >
                    <HiOutlinePencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleToggle(student._id)}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                    title={student.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                  >
                    {student.isActive ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(student._id)}
                    className="p-2 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-600 transition-colors"
                    title="মুছুন"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingStudent ? 'শিক্ষার্থী সম্পাদনা' : 'নতুন শিক্ষার্থী'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">{formError}</div>
          )}
          <Input label="নাম *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="শিক্ষার্থীর নাম" />
          <Input label="ইমেইল *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" disabled={!!editingStudent} />
          <Input label="ফোন" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
          {!editingStudent && (
            <Input label="পাসওয়ার্ড" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="ডিফল্ট: Student@123" helper="কমপক্ষে ৮ অক্ষর" />
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">ক্লাস</label>
              <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value, versionId: '' })}
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500">
                <option value="">নির্বাচন</option>
                {classes.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">ভার্সন</label>
              <select value={form.versionId} onChange={(e) => setForm({ ...form, versionId: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" disabled={!form.classId}>
                <option value="">নির্বাচন</option>
                {versions.map((v) => <option key={v._id} value={v._id}>{v.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>বাতিল</Button>
            <Button variant="primary" type="submit" loading={saving}>
              {editingStudent ? 'আপডেট করুন' : 'তৈরি করুন'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
