'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  fetchTeacherClasses,
  fetchTeacherVersions,
  fetchTeacherSubjects,
  fetchTeacherChapters,
  fetchTeacherQuestions,
  clearContent,
} from '@/store/slices/teacherSlice';
import Skeleton from '@/components/ui/Skeleton';
import {
  HiOutlineBookOpen,
  HiOutlineChevronRight,
  HiOutlineAcademicCap,
  HiOutlineQuestionMarkCircle,
  HiOutlineCube,
} from 'react-icons/hi';

const typeLabels = { MCQ: 'MCQ', CQ: 'সৃজনশীল', SHORT: 'সংক্ষিপ্ত' };
const typeColors = {
  MCQ: 'bg-indigo-100 text-indigo-700',
  CQ: 'bg-amber-100 text-amber-700',
  SHORT: 'bg-emerald-100 text-emerald-700',
};
const diffLabels = { easy: 'সহজ', medium: 'মাঝারি', hard: 'কঠিন' };
const diffColors = {
  easy: 'bg-emerald-50 text-emerald-600',
  medium: 'bg-amber-50 text-amber-600',
  hard: 'bg-rose-50 text-rose-600',
};

export default function TeacherMyContentPage() {
  const dispatch = useDispatch();
  const { content, isLoading } = useSelector((state) => state.teacher);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [filters, setFilters] = useState({ type: '', difficulty: '' });

  useEffect(() => {
    dispatch(fetchTeacherClasses());
    return () => { dispatch(clearContent()); };
  }, [dispatch]);

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setSelectedVersion(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
    dispatch(clearContent());
    dispatch(fetchTeacherVersions(cls._id));
  };

  const handleVersionSelect = (ver) => {
    setSelectedVersion(ver);
    setSelectedSubject(null);
    setSelectedChapter(null);
    dispatch(fetchTeacherSubjects({ classId: selectedClass._id, versionId: ver._id }));
  };

  const handleSubjectSelect = (sub) => {
    setSelectedSubject(sub);
    setSelectedChapter(null);
    dispatch(fetchTeacherChapters(sub._id));
  };

  const handleChapterSelect = (ch) => {
    setSelectedChapter(ch);
    dispatch(fetchTeacherQuestions({
      chapterId: ch._id,
      ...(filters.type && { type: filters.type }),
      ...(filters.difficulty && { difficulty: filters.difficulty }),
    }));
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (selectedChapter) {
      dispatch(fetchTeacherQuestions({
        chapterId: selectedChapter._id,
        ...(newFilters.type && { type: newFilters.type }),
        ...(newFilters.difficulty && { difficulty: newFilters.difficulty }),
      }));
    }
  };

  // Breadcrumb
  const breadcrumbs = [
    selectedClass && { label: selectedClass.name, onClick: () => { setSelectedClass(null); setSelectedVersion(null); setSelectedSubject(null); setSelectedChapter(null); dispatch(clearContent()); dispatch(fetchTeacherClasses()); } },
    selectedVersion && { label: selectedVersion.name, onClick: () => { setSelectedVersion(null); setSelectedSubject(null); setSelectedChapter(null); handleClassSelect(selectedClass); } },
    selectedSubject && { label: selectedSubject.name || selectedSubject.nameEn, onClick: () => { setSelectedSubject(null); setSelectedChapter(null); handleVersionSelect(selectedVersion); } },
    selectedChapter && { label: selectedChapter.name || selectedChapter.nameEn },
  ].filter(Boolean);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">আমার কন্টেন্ট</h1>
        <p className="text-sm text-neutral-500 mt-1">আপনার প্যাকেজ অনুযায়ী কন্টেন্ট ব্রাউজ করুন</p>
      </div>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1.5 mb-5 flex-wrap text-sm">
          <button onClick={() => { setSelectedClass(null); setSelectedVersion(null); setSelectedSubject(null); setSelectedChapter(null); dispatch(clearContent()); dispatch(fetchTeacherClasses()); }} className="text-primary-600 hover:text-primary-700 font-medium">
            সকল ক্লাস
          </button>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <HiOutlineChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              {b.onClick ? (
                <button onClick={b.onClick} className="text-primary-600 hover:text-primary-700 font-medium">{b.label}</button>
              ) : (
                <span className="text-neutral-700 font-medium">{b.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Step 1: Classes */}
      {!selectedClass && (
        <ContentGrid
          items={content.classes}
          isLoading={isLoading}
          onSelect={handleClassSelect}
          icon={HiOutlineAcademicCap}
          emptyIcon={HiOutlineCube}
          emptyText="কোনো কন্টেন্ট নেই"
          emptySubtext="প্যাকেজ কিনলে কন্টেন্ট দেখাবে"
          renderLabel={(item) => item.name}
          renderSub={(item) => item.nameEn}
        />
      )}

      {/* Step 2: Versions */}
      {selectedClass && !selectedVersion && (
        <ContentGrid
          items={content.versions}
          isLoading={isLoading}
          onSelect={handleVersionSelect}
          icon={HiOutlineBookOpen}
          emptyText="কোনো ভার্সন নেই"
          renderLabel={(item) => item.name}
        />
      )}

      {/* Step 3: Subjects */}
      {selectedVersion && !selectedSubject && (
        <ContentGrid
          items={content.subjects}
          isLoading={isLoading}
          onSelect={handleSubjectSelect}
          icon={HiOutlineBookOpen}
          emptyText="কোনো বিষয় নেই"
          renderLabel={(item) => item.name}
          renderSub={(item) => item.nameEn}
        />
      )}

      {/* Step 4: Chapters */}
      {selectedSubject && !selectedChapter && (
        <ContentGrid
          items={content.chapters}
          isLoading={isLoading}
          onSelect={handleChapterSelect}
          icon={HiOutlineBookOpen}
          emptyText="কোনো অধ্যায় নেই"
          renderLabel={(item) => item.name}
          renderSub={(item) => item.nameEn}
          showOrder
        />
      )}

      {/* Step 5: Questions */}
      {selectedChapter && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="text-sm border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">সকল ধরন</option>
              <option value="MCQ">MCQ</option>
              <option value="CQ">সৃজনশীল</option>
              <option value="SHORT">সংক্ষিপ্ত</option>
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="text-sm border border-neutral-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">সকল মান</option>
              <option value="easy">সহজ</option>
              <option value="medium">মাঝারি</option>
              <option value="hard">কঠিন</option>
            </select>
            {content.questionsPagination && (
              <span className="text-sm text-neutral-500 flex items-center">
                মোট {content.questionsPagination.total} প্রশ্ন
              </span>
            )}
          </div>

          {/* Question List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
          ) : content.questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <HiOutlineQuestionMarkCircle className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">এই অধ্যায়ে কোনো প্রশ্ন নেই</p>
            </div>
          ) : (
            <div className="space-y-4">
              {content.questions.map((q, idx) => (
                <motion.div
                  key={q._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[q.type] || 'bg-neutral-100 text-neutral-600'}`}>
                      {typeLabels[q.type] || q.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${diffColors[q.difficulty] || ''}`}>
                      {diffLabels[q.difficulty] || q.difficulty}
                    </span>
                    <span className="text-xs text-neutral-400 ml-auto">{q.marks} নম্বর</span>
                  </div>

                  <p className="text-sm text-neutral-800 leading-relaxed">{q.questionText}</p>

                  {/* MCQ Options */}
                  {q.type === 'MCQ' && q.options?.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <div
                          key={oi}
                          className={`text-sm px-3 py-2 rounded-lg border ${opt.isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}
                        >
                          <span className="font-medium mr-1.5">{String.fromCharCode(2453 + oi)}.</span>
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CQ Sub-parts */}
                  {q.type === 'CQ' && q.subParts?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {q.subParts.map((sp, si) => (
                        <div key={si} className="text-sm text-neutral-600 pl-3 border-l-2 border-primary-200">
                          <span className="font-medium text-primary-600">{sp.partLabel}.</span> {sp.text}
                          <span className="text-xs text-neutral-400 ml-2">({sp.marks} নম্বর)</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="mt-3 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                      <span className="font-medium text-neutral-600">ব্যাখ্যা:</span> {q.explanation}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable content grid component for classes/versions/subjects/chapters
function ContentGrid({ items, isLoading, onSelect, icon: Icon, emptyIcon: EmptyIcon, emptyText, emptySubtext, renderLabel, renderSub, showOrder }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (!items || items.length === 0) {
    const FallbackIcon = EmptyIcon || Icon;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
        <FallbackIcon className="h-12 w-12 mb-3 opacity-50" />
        <p className="text-lg font-medium">{emptyText}</p>
        {emptySubtext && <p className="text-sm mt-1">{emptySubtext}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <motion.button
          key={item._id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          onClick={() => onSelect(item)}
          className="text-left bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
            {showOrder ? (
              <span className="text-white font-bold text-sm">{item.order}</span>
            ) : (
              <Icon className="h-5 w-5 text-white" />
            )}
          </div>
          <p className="text-sm font-semibold text-neutral-800">{renderLabel(item)}</p>
          {renderSub && <p className="text-xs text-neutral-400 mt-0.5">{renderSub(item)}</p>}
        </motion.button>
      ))}
    </div>
  );
}
