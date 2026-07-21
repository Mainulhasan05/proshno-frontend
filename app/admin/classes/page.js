'use client';

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  fetchClasses, createClass, updateClass, toggleClassActive, deleteClass,
  fetchVersions, createVersion, updateVersion, toggleVersionActive, deleteVersion,
  fetchSubjects, createSubject, updateSubject, toggleSubjectActive, deleteSubject,
  fetchChapters, createChapter, updateChapter, toggleChapterActive, deleteChapter,
  fetchTopics, createTopic, updateTopic, toggleTopicActive, deleteTopic,
  fetchTree,
} from '@/store/slices/hierarchySlice';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineEyeOff, HiOutlineChevronRight,
  HiOutlineAcademicCap, HiOutlineCollection, HiOutlineBookOpen, HiOutlineClipboardList,
  HiOutlineDocumentText,
} from 'react-icons/hi';

// ── Reusable panel item component ──
function PanelItem({ item, isSelected, onSelect, onEdit, onToggle, onDelete, icon: Icon, colorActive, colorInactive }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-primary-50 border border-primary-200 shadow-sm'
          : 'hover:bg-neutral-50 border border-transparent'
      } ${!item.isActive ? 'opacity-50' : ''}`}
      onClick={() => onSelect(item._id)}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
          isSelected ? 'bg-primary-100 text-primary-600' : item.isActive ? colorActive : colorInactive
        }`}>
          {item.order != null ? item.order : <Icon className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${isSelected ? 'text-primary-700' : 'text-neutral-800'}`}>{item.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {item.code && <p className="text-[10px] text-neutral-400 font-mono">{item.code}</p>}
            <span
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(item._id);
                toast.success('ID কপি করা হয়েছে!');
              }}
              className="text-[9px] text-neutral-400 hover:text-primary-600 bg-neutral-100 hover:bg-primary-50 px-1 py-0.5 rounded font-mono transition-all cursor-pointer inline-flex items-center gap-0.5 select-all border border-neutral-200/60"
              title="ID কপি করতে ক্লিক করুন"
            >
              ID: {item._id}
            </span>
            {!item.isActive && <span className="text-[10px] text-red-400">নিষ্ক্রিয়</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <div className="hidden group-hover:flex items-center gap-0.5">
          <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600" title="সম্পাদনা">
            <HiOutlinePencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onToggle(item._id); }} className="p-1 rounded hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600" title="স্ট্যাটাস">
            {item.isActive ? <HiOutlineEyeOff className="h-3.5 w-3.5" /> : <HiOutlineEye className="h-3.5 w-3.5" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(item._id, item.name); }} className="p-1 rounded hover:bg-red-100 text-neutral-400 hover:text-red-500" title="মুছুন">
            <HiOutlineTrash className="h-3.5 w-3.5" />
          </button>
        </div>
        {isSelected && <HiOutlineChevronRight className="h-4 w-4 text-primary-400 ml-1" />}
      </div>
    </motion.div>
  );
}

// ── Panel header ──
function PanelHeader({ title, count, onAdd, icon: Icon }) {
  return (
    <div className="flex items-center justify-between px-1 mb-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
        {count > 0 && <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full">{count}</span>}
      </div>
      <button onClick={onAdd} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 hover:text-primary-600 transition-colors" title="নতুন যোগ">
        <HiOutlinePlus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ClassesPage() {
  const dispatch = useDispatch();
  const { classes = [], versions = [], subjects = [], chapters = [], topics = [], tree = [], isLoading = false } = useSelector((state) => state.hierarchy || {});

  // ── View mode ──
  const [viewMode, setViewMode] = useState('columns'); // 'columns' | 'summary'

  // ── Selection state ──
  const [selectedClassId, _setSelectedClassId] = useState(null);
  const [selectedVersionId, _setSelectedVersionId] = useState(null);
  const [selectedSubjectId, _setSelectedSubjectId] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState(null);

  // Wrapped setters that cascade-reset children
  const setSelectedClassId = (id) => {
    _setSelectedClassId(id);
    _setSelectedVersionId(null);
    _setSelectedSubjectId(null);
    setSelectedChapterId(null);
  };
  const setSelectedVersionId = (id) => {
    _setSelectedVersionId(id);
    _setSelectedSubjectId(null);
    setSelectedChapterId(null);
  };
  const setSelectedSubjectId = (id) => {
    _setSelectedSubjectId(id);
    setSelectedChapterId(null);
  };

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'class' | 'version' | 'subject' | 'chapter' | 'topic'
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  // ── Load classes on mount ──
  useEffect(() => { dispatch(fetchClasses()); }, [dispatch]);

  // ── Load tree when summary view is active ──
  useEffect(() => {
    if (viewMode === 'summary') {
      dispatch(fetchTree());
    }
  }, [dispatch, viewMode]);

  // ── Load versions when class selected ──
  useEffect(() => {
    if (selectedClassId) {
      dispatch(fetchVersions({ classId: selectedClassId }));
    }
  }, [dispatch, selectedClassId]);

  // ── Load subjects when version selected ──
  useEffect(() => {
    if (selectedVersionId) {
      dispatch(fetchSubjects({ versionId: selectedVersionId }));
    }
  }, [dispatch, selectedVersionId]);

  // ── Load chapters when subject selected ──
  useEffect(() => {
    if (selectedSubjectId) {
      dispatch(fetchChapters({ subjectId: selectedSubjectId }));
    }
  }, [dispatch, selectedSubjectId]);

  // ── Load topics when chapter selected ──
  useEffect(() => {
    if (selectedChapterId) {
      dispatch(fetchTopics({ chapterId: selectedChapterId }));
    }
  }, [dispatch, selectedChapterId]);

  // ── Filtered data ──
  const classVersions = useMemo(() =>
    versions.filter((v) => (v.classId?._id || v.classId) === selectedClassId),
    [versions, selectedClassId]
  );
  const versionSubjects = useMemo(() =>
    subjects.filter((s) => (s.versionId?._id || s.versionId) === selectedVersionId),
    [subjects, selectedVersionId]
  );
  const subjectChapters = useMemo(() =>
    chapters.filter((ch) => (ch.subjectId?._id || ch.subjectId) === selectedSubjectId),
    [chapters, selectedSubjectId]
  );
  const chapterTopics = useMemo(() =>
    topics.filter((t) => (t.chapterId?._id || t.chapterId) === selectedChapterId),
    [topics, selectedChapterId]
  );

  // ── Breadcrumb ──
  const selectedClass = classes.find((c) => c._id === selectedClassId);
  const selectedVersion = classVersions.find((v) => v._id === selectedVersionId);
  const selectedSubject = versionSubjects.find((s) => s._id === selectedSubjectId);
  const selectedChapter = subjectChapters.find((ch) => ch._id === selectedChapterId);

  // ══════════════════════════════════════
  //  MODAL HANDLERS
  // ══════════════════════════════════════

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    if (item) {
      setFormData({ name: item.name, order: item.order ?? 0, code: item.code || '' });
    } else {
      setFormData({ name: '', order: 0, code: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditItem(null); setFormData({}); };

  const getModalTitle = () => {
    const labels = { class: 'ক্লাস', version: 'ভার্সন', subject: 'বিষয়', chapter: 'অধ্যায়', topic: 'টপিক / পাঠ' };
    return editItem ? `${labels[modalType]} সম্পাদনা` : `নতুন ${labels[modalType]}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const name = formData.name;
      const order = Number(formData.order) || 0;

      if (modalType === 'class') {
        const body = { name, order };
        if (editItem) {
          await dispatch(updateClass({ id: editItem._id, body })).unwrap();
          toast.success('ক্লাস আপডেট হয়েছে');
        } else {
          await dispatch(createClass(body)).unwrap();
          toast.success('ক্লাস তৈরি হয়েছে');
        }
        dispatch(fetchClasses());
      } else if (modalType === 'version') {
        const body = { name, order, classId: selectedClassId };
        if (editItem) {
          await dispatch(updateVersion({ id: editItem._id, body })).unwrap();
          toast.success('ভার্সন আপডেট হয়েছে');
        } else {
          await dispatch(createVersion(body)).unwrap();
          toast.success('ভার্সন তৈরি হয়েছে');
        }
        dispatch(fetchVersions({ classId: selectedClassId }));
      } else if (modalType === 'subject') {
        const body = { name, code: formData.code, order, versionId: selectedVersionId };
        if (editItem) {
          await dispatch(updateSubject({ id: editItem._id, body })).unwrap();
          toast.success('বিষয় আপডেট হয়েছে');
        } else {
          await dispatch(createSubject(body)).unwrap();
          toast.success('বিষয় তৈরি হয়েছে');
        }
        dispatch(fetchSubjects({ versionId: selectedVersionId }));
      } else if (modalType === 'chapter') {
        const body = { name, order, subjectId: selectedSubjectId };
        if (editItem) {
          await dispatch(updateChapter({ id: editItem._id, body })).unwrap();
          toast.success('অধ্যায় আপডেট হয়েছে');
        } else {
          await dispatch(createChapter(body)).unwrap();
          toast.success('অধ্যায় তৈরি হয়েছে');
        }
        dispatch(fetchChapters({ subjectId: selectedSubjectId }));
      } else if (modalType === 'topic') {
        const body = { name, order, chapterId: selectedChapterId };
        if (editItem) {
          await dispatch(updateTopic({ id: editItem._id, body })).unwrap();
          toast.success('টপিক/পাঠ আপডেট হয়েছে');
        } else {
          await dispatch(createTopic(body)).unwrap();
          toast.success('টপিক/পাঠ তৈরি হয়েছে');
        }
        dispatch(fetchTopics({ chapterId: selectedChapterId }));
      }
      closeModal();
    } catch (err) {
      toast.error(err || 'ত্রুটি হয়েছে');
    }
  };

  // ── Toggle & Delete helpers ──
  const handleToggle = async (type, id) => {
    try {
      if (type === 'class') { await dispatch(toggleClassActive(id)).unwrap(); dispatch(fetchClasses()); }
      else if (type === 'version') { await dispatch(toggleVersionActive(id)).unwrap(); dispatch(fetchVersions({ classId: selectedClassId })); }
      else if (type === 'subject') { await dispatch(toggleSubjectActive(id)).unwrap(); dispatch(fetchSubjects({ versionId: selectedVersionId })); }
      else if (type === 'chapter') { await dispatch(toggleChapterActive(id)).unwrap(); dispatch(fetchChapters({ subjectId: selectedSubjectId })); }
      else if (type === 'topic') { await dispatch(toggleTopicActive(id)).unwrap(); dispatch(fetchTopics({ chapterId: selectedChapterId })); }
      toast.success('স্ট্যাটাস আপডেট হয়েছে');
    } catch (err) { toast.error(err || 'ত্রুটি হয়েছে'); }
  };

  const handleDelete = async (type, id, name) => {
    if (!confirm(`"${name}" মুছে ফেলতে চান?`)) return;
    try {
      if (type === 'class') {
        await dispatch(deleteClass(id)).unwrap(); dispatch(fetchClasses());
        if (selectedClassId === id) { setSelectedClassId(null); setSelectedVersionId(null); setSelectedSubjectId(null); setSelectedChapterId(null); }
      } else if (type === 'version') {
        await dispatch(deleteVersion(id)).unwrap(); dispatch(fetchVersions({ classId: selectedClassId }));
        if (selectedVersionId === id) { setSelectedVersionId(null); setSelectedSubjectId(null); setSelectedChapterId(null); }
      } else if (type === 'subject') {
        await dispatch(deleteSubject(id)).unwrap(); dispatch(fetchSubjects({ versionId: selectedVersionId }));
        if (selectedSubjectId === id) { setSelectedSubjectId(null); setSelectedChapterId(null); }
      } else if (type === 'chapter') {
        await dispatch(deleteChapter(id)).unwrap(); dispatch(fetchChapters({ subjectId: selectedSubjectId }));
        if (selectedChapterId === id) setSelectedChapterId(null);
      } else if (type === 'topic') {
        await dispatch(deleteTopic(id)).unwrap(); dispatch(fetchTopics({ chapterId: selectedChapterId }));
      }
      toast.success('মুছে ফেলা হয়েছে');
    } catch (err) { toast.error(err || 'মুছে ফেলা যায়নি'); }
  };

  // ══════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════

  const panelBase = 'bg-white rounded-xl border border-neutral-200 p-4 min-h-[300px]';
  const emptyMsg = 'text-center text-neutral-400 text-xs py-8';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5 border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">কন্টেন্ট হায়ারার্কি</h1>
          <p className="text-sm text-neutral-500 mt-1">ক্লাস → ভার্সন → বিষয় → অধ্যায় → টপিক/পাঠ — সব এক জায়গায় পরিচালনা করুন</p>
        </div>
        
        {/* View Mode Switcher */}
        <div className="flex bg-neutral-100 p-1 rounded-xl w-fit border border-neutral-200 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('columns')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'columns'
                ? 'bg-white text-neutral-800 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            কলাম ভিউ
          </button>
          <button
            type="button"
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'summary'
                ? 'bg-white text-neutral-800 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            একনজরে পরিসংখ্যান
          </button>
        </div>
      </div>

      {viewMode === 'summary' ? (
        <div className="space-y-6">
          {isLoading && tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-neutral-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="text-neutral-500 text-xs mt-3">পরিসংখ্যান লোড হচ্ছে...</p>
            </div>
          ) : tree.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-neutral-200">
              <p className="text-neutral-400 text-sm">কোনো পরিসংখ্যান পাওয়া যায়নি।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tree.map((cls) => {
                // Calculate subject/chapter/topic counts
                let totalSubs = 0;
                let totalChaps = 0;
                let totalTopics = 0;
                cls.versions?.forEach((v) => {
                  totalSubs += v.subjects?.length || 0;
                  v.subjects?.forEach((s) => {
                    totalChaps += s.chapters?.length || 0;
                    s.chapters?.forEach((ch) => {
                      totalTopics += ch.topics?.length || 0;
                    });
                  });
                });

                return (
                  <motion.div
                    key={cls._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-start border-b pb-3 border-neutral-100">
                      <div>
                        <h2 className="text-base font-bold text-neutral-800 flex items-center gap-2">
                          <HiOutlineAcademicCap className="h-5 w-5 text-primary-500" />
                          {cls.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {cls.nameEn && <span className="text-xs text-neutral-400 font-mono">{cls.nameEn}</span>}
                          <span
                            onClick={() => {
                              navigator.clipboard.writeText(cls._id);
                              toast.success('ক্লাস ID কপি করা হয়েছে!');
                            }}
                            className="text-[9px] text-neutral-400 hover:text-primary-600 bg-neutral-100 hover:bg-primary-50 px-1 py-0.5 rounded font-mono transition-all cursor-pointer select-all border border-neutral-200/60"
                            title="ID কপি করতে ক্লিক করুন"
                          >
                            ID: {cls._id}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-wrap justify-end">
                        <span className="text-[10px] bg-primary-50 text-primary-700 font-bold px-2 py-0.5 rounded border border-primary-100">
                          {totalSubs} বিষয়
                        </span>
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-100">
                          {totalChaps} অধ্যায়
                        </span>
                        <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-100">
                          {totalTopics} পাঠ/টপিক
                        </span>
                      </div>
                    </div>

                    {cls.versions?.length === 0 ? (
                      <p className="text-xs text-neutral-400 py-2">কোনো ভার্সন যুক্ত নেই</p>
                    ) : (
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {cls.versions.map((ver) => (
                          <div key={ver._id} className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                {ver.name}
                              </h3>
                              <span
                                onClick={() => {
                                  navigator.clipboard.writeText(ver._id);
                                  toast.success('ভার্সন ID কপি করা হয়েছে!');
                                }}
                                className="text-[9px] text-neutral-400 hover:text-primary-600 bg-neutral-100 hover:bg-primary-50 px-1 py-0.5 rounded font-mono transition-all cursor-pointer select-all border border-neutral-200/60"
                                title="ID কপি করতে ক্লিক করুন"
                              >
                                ID: {ver._id}
                              </span>
                            </div>
                            
                            {ver.subjects?.length === 0 ? (
                              <p className="text-[11px] text-neutral-400 pl-4 py-1">কোনো বিষয় নেই</p>
                            ) : (
                              <div className="bg-neutral-50 rounded-lg overflow-hidden border border-neutral-100 pl-3 pr-3 divide-y divide-neutral-100">
                                {ver.subjects.map((sub) => (
                                  <div key={sub._id} className="py-2 text-xs space-y-1.5">
                                    <div className="flex justify-between items-center gap-3">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-semibold text-neutral-700 truncate">{sub.name}</span>
                                        <span
                                          onClick={() => {
                                            navigator.clipboard.writeText(sub._id);
                                            toast.success('বিষয় ID কপি করা হয়েছে!');
                                          }}
                                          className="text-[9px] text-neutral-400 hover:text-primary-600 bg-neutral-150/50 hover:bg-primary-50 px-1 py-0.5 rounded font-mono transition-all cursor-pointer select-all border border-neutral-200/40 shrink-0"
                                          title="ID কপি করতে ক্লিক করুন"
                                        >
                                          ID: {sub._id}
                                        </span>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        <span className="text-[10px] bg-neutral-200/70 text-neutral-600 px-2 py-0.5 rounded-full font-bold">
                                          {sub.chapters?.length || 0} অধ্যায়
                                        </span>
                                      </div>
                                    </div>

                                    {/* Chapters & Topics Breakdown */}
                                    {sub.chapters?.length > 0 && (
                                      <div className="pl-3 border-l-2 border-amber-200/60 space-y-1 my-1">
                                        {sub.chapters.map((ch) => (
                                          <div key={ch._id} className="text-[11px] text-neutral-600">
                                            <div className="flex items-center justify-between gap-2">
                                              <span className="font-medium text-neutral-700 truncate">📖 {ch.name}</span>
                                              {ch.topics?.length > 0 && (
                                                <span className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.2 rounded font-medium shrink-0">
                                                  {ch.topics.length} টপিক
                                                </span>
                                              )}
                                            </div>
                                            {ch.topics?.length > 0 && (
                                              <div className="pl-3 space-y-0.5 mt-0.5 border-l border-purple-100">
                                                {ch.topics.map((t) => (
                                                  <div key={t._id} className="flex items-center justify-between text-[10px] text-neutral-500">
                                                    <span className="truncate">▫ {t.name}</span>
                                                    <span
                                                      onClick={() => {
                                                        navigator.clipboard.writeText(t._id);
                                                        toast.success('টপিক ID কপি করা হয়েছে!');
                                                      }}
                                                      className="text-[8px] text-neutral-400 hover:text-purple-600 font-mono cursor-pointer"
                                                    >
                                                      ID: {t._id}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-4 flex-wrap">
            <span className={selectedClassId ? 'text-primary-600 font-medium' : ''}>{selectedClass?.name || 'ক্লাস নির্বাচন করুন'}</span>
            {selectedClassId && (
              <>
                <HiOutlineChevronRight className="h-3 w-3" />
                <span className={selectedVersionId ? 'text-primary-600 font-medium' : ''}>{selectedVersion?.name || 'ভার্সন নির্বাচন করুন'}</span>
              </>
            )}
            {selectedVersionId && (
              <>
                <HiOutlineChevronRight className="h-3 w-3" />
                <span className={selectedSubjectId ? 'text-primary-600 font-medium' : ''}>{selectedSubject?.name || 'বিষয় নির্বাচন করুন'}</span>
              </>
            )}
            {selectedSubjectId && (
              <>
                <HiOutlineChevronRight className="h-3 w-3" />
                <span className={selectedChapterId ? 'text-primary-600 font-medium' : ''}>{selectedChapter?.name || 'অধ্যায় নির্বাচন করুন'}</span>
              </>
            )}
            {selectedChapterId && (
              <>
                <HiOutlineChevronRight className="h-3 w-3" />
                <span>টপিক / পাঠ</span>
              </>
            )}
          </div>

          {/* 5-Panel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">

            {/* ── Panel 1: Classes ── */}
            <div className={panelBase}>
              <PanelHeader title="ক্লাস" count={classes.length} onAdd={() => openModal('class')} icon={HiOutlineAcademicCap} />
              {classes.length === 0 && !isLoading && <p className={emptyMsg}>কোনো ক্লাস নেই</p>}
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {classes.map((cls) => (
                  <PanelItem
                    key={cls._id}
                    item={cls}
                    isSelected={selectedClassId === cls._id}
                    onSelect={setSelectedClassId}
                    onEdit={(item) => openModal('class', item)}
                    onToggle={(id) => handleToggle('class', id)}
                    onDelete={(id, name) => handleDelete('class', id, name)}
                    icon={HiOutlineAcademicCap}
                    colorActive="bg-primary-50 text-primary-600"
                    colorInactive="bg-neutral-100 text-neutral-400"
                  />
                ))}
              </div>
            </div>

            {/* ── Panel 2: Versions ── */}
            <AnimatePresence mode="wait">
              {selectedClassId ? (
                <motion.div key="versions" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className={panelBase}>
                  <PanelHeader title="ভার্সন" count={classVersions.length} onAdd={() => openModal('version')} icon={HiOutlineCollection} />
                  {classVersions.length === 0 && <p className={emptyMsg}>এই ক্লাসে কোনো ভার্সন নেই</p>}
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {classVersions.map((ver) => (
                      <PanelItem
                        key={ver._id}
                        item={ver}
                        isSelected={selectedVersionId === ver._id}
                        onSelect={setSelectedVersionId}
                        onEdit={(item) => openModal('version', item)}
                        onToggle={(id) => handleToggle('version', id)}
                        onDelete={(id, name) => handleDelete('version', id, name)}
                        icon={HiOutlineCollection}
                        colorActive="bg-blue-50 text-blue-600"
                        colorInactive="bg-neutral-100 text-neutral-400"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className={`${panelBase} flex items-center justify-center`}>
                  <p className="text-neutral-300 text-sm text-center">← ক্লাস নির্বাচন করুন</p>
                </div>
              )}
            </AnimatePresence>

            {/* ── Panel 3: Subjects ── */}
            <AnimatePresence mode="wait">
              {selectedVersionId ? (
                <motion.div key="subjects" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className={panelBase}>
                  <PanelHeader title="বিষয়" count={versionSubjects.length} onAdd={() => openModal('subject')} icon={HiOutlineBookOpen} />
                  {versionSubjects.length === 0 && <p className={emptyMsg}>এই ভার্সনে কোনো বিষয় নেই</p>}
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {versionSubjects.map((sub) => (
                      <PanelItem
                        key={sub._id}
                        item={sub}
                        isSelected={selectedSubjectId === sub._id}
                        onSelect={setSelectedSubjectId}
                        onEdit={(item) => openModal('subject', item)}
                        onToggle={(id) => handleToggle('subject', id)}
                        onDelete={(id, name) => handleDelete('subject', id, name)}
                        icon={HiOutlineBookOpen}
                        colorActive="bg-emerald-50 text-emerald-600"
                        colorInactive="bg-neutral-100 text-neutral-400"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className={`${panelBase} flex items-center justify-center`}>
                  <p className="text-neutral-300 text-sm text-center">{selectedClassId ? '← ভার্সন নির্বাচন করুন' : ''}</p>
                </div>
              )}
            </AnimatePresence>

            {/* ── Panel 4: Chapters ── */}
            <AnimatePresence mode="wait">
              {selectedSubjectId ? (
                <motion.div key="chapters" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className={panelBase}>
                  <PanelHeader title="অধ্যায়" count={subjectChapters.length} onAdd={() => openModal('chapter')} icon={HiOutlineClipboardList} />
                  {subjectChapters.length === 0 && <p className={emptyMsg}>এই বিষয়ে কোনো অধ্যায় নেই</p>}
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {subjectChapters.map((ch) => (
                      <PanelItem
                        key={ch._id}
                        item={ch}
                        isSelected={selectedChapterId === ch._id}
                        onSelect={setSelectedChapterId}
                        onEdit={(item) => openModal('chapter', item)}
                        onToggle={(id) => handleToggle('chapter', id)}
                        onDelete={(id, name) => handleDelete('chapter', id, name)}
                        icon={HiOutlineClipboardList}
                        colorActive="bg-amber-50 text-amber-600"
                        colorInactive="bg-neutral-100 text-neutral-400"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className={`${panelBase} flex items-center justify-center`}>
                  <p className="text-neutral-300 text-sm text-center">{selectedVersionId ? '← বিষয় নির্বাচন করুন' : ''}</p>
                </div>
              )}
            </AnimatePresence>

            {/* ── Panel 5: Topics / Lessons ── */}
            <AnimatePresence mode="wait">
              {selectedChapterId ? (
                <motion.div key="topics" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className={panelBase}>
                  <PanelHeader title="টপিক / পাঠ" count={chapterTopics.length} onAdd={() => openModal('topic')} icon={HiOutlineDocumentText} />
                  {chapterTopics.length === 0 && <p className={emptyMsg}>এই অধ্যায়ে কোনো টপিক/পাঠ নেই</p>}
                  <div className="space-y-1 max-h-[400px] overflow-y-auto">
                    {chapterTopics.map((t) => (
                      <PanelItem
                        key={t._id}
                        item={t}
                        isSelected={false}
                        onSelect={() => {}}
                        onEdit={(item) => openModal('topic', item)}
                        onToggle={(id) => handleToggle('topic', id)}
                        onDelete={(id, name) => handleDelete('topic', id, name)}
                        icon={HiOutlineDocumentText}
                        colorActive="bg-purple-50 text-purple-600"
                        colorInactive="bg-neutral-100 text-neutral-400"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className={`${panelBase} flex items-center justify-center`}>
                  <p className="text-neutral-300 text-sm text-center">{selectedSubjectId ? '← অধ্যায় নির্বাচন করুন' : ''}</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════ */}
      {/*  UNIFIED MODAL                        */}
      {/* ══════════════════════════════════════ */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={getModalTitle()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Context indicator */}
          {modalType !== 'class' && (
            <div className="bg-neutral-50 rounded-lg p-3 text-xs text-neutral-500">
              {modalType === 'version' && <span>ক্লাস: <strong className="text-neutral-700">{selectedClass?.name}</strong></span>}
              {modalType === 'subject' && <span>ক্লাস: <strong className="text-neutral-700">{selectedClass?.name}</strong> → ভার্সন: <strong className="text-neutral-700">{selectedVersion?.name}</strong></span>}
              {modalType === 'chapter' && <span>ক্লাস: <strong className="text-neutral-700">{selectedClass?.name}</strong> → ভার্সন: <strong className="text-neutral-700">{selectedVersion?.name}</strong> → বিষয়: <strong className="text-neutral-700">{selectedSubject?.name}</strong></span>}
              {modalType === 'topic' && <span>ক্লাস: <strong className="text-neutral-700">{selectedClass?.name}</strong> → ভার্সন: <strong className="text-neutral-700">{selectedVersion?.name}</strong> → বিষয়: <strong className="text-neutral-700">{selectedSubject?.name}</strong> → অধ্যায়: <strong className="text-neutral-700">{selectedChapter?.name}</strong></span>}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">নাম *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder={
                modalType === 'class' ? 'যেমন: তৃতীয় শ্রেণি' :
                modalType === 'version' ? 'যেমন: বাংলা মাধ্যম' :
                modalType === 'subject' ? 'যেমন: গণিত' :
                modalType === 'chapter' ? 'যেমন: সংখ্যা ও গণনা' :
                'যেমন: ১ম পাঠ / যোগ-বিয়োগ ধারণা'
              }
              required
              autoFocus
            />
          </div>

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">ক্রম</label>
            <input
              type="number"
              value={formData.order ?? 0}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              min="0"
            />
          </div>

          {/* Code (for subject) */}
          {modalType === 'subject' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">কোড (ঐচ্ছিক)</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="যেমন: MATH"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal} className="flex-1">বাতিল</Button>
            <Button type="submit" className="flex-1">{editItem ? 'আপডেট করুন' : 'তৈরি করুন'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
