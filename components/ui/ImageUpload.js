'use client';

import { useState, useRef, useCallback } from 'react';
import apiClient from '@/store/api/apiClient';
import { HiOutlinePhotograph, HiOutlineUpload, HiOutlineX, HiOutlineLink, HiOutlineCheckCircle } from 'react-icons/hi';

/**
 * ImageUpload — Drag-and-drop image upload with URL fallback.
 *
 * Props:
 * - value: current image URL (string)
 * - onChange: called with the new URL (string) or '' when removed
 * - sourceType: 'question' | 'page' | 'avatar' | 'omr' (default: 'question')
 * - sourceField: field name like 'questionImage', 'stimulusImage', 'options.0.image'
 * - label: field label text
 * - compact: if true, renders in a smaller footprint for option images
 */
export default function ImageUpload({
  value = '',
  onChange,
  sourceType = 'question',
  sourceField = '',
  label = '',
  compact = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlText, setUrlText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadStats, setUploadStats] = useState(null); // { originalSize, newSize, savings }
  const fileInputRef = useRef(null);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    // Client-side validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('শুধুমাত্র JPEG, PNG, WebP, এবং GIF ফাইল গ্রহণযোগ্য');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('ফাইল সাইজ ১০ MB এর বেশি হতে পারবে না');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);
    setUploadStats(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', JSON.stringify({
        type: sourceType,
        field: sourceField,
      }));

      const res = await apiClient.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });

      const mediaFile = res.data?.data || res.data;
      const url = mediaFile.url;

      // Calculate compression stats
      if (mediaFile.originalSizeBytes && mediaFile.sizeBytes) {
        const savings = Math.round(
          ((mediaFile.originalSizeBytes - mediaFile.sizeBytes) / mediaFile.originalSizeBytes) * 100
        );
        setUploadStats({
          originalSize: formatBytes(mediaFile.originalSizeBytes),
          newSize: formatBytes(mediaFile.sizeBytes),
          savings,
          width: mediaFile.width,
          height: mediaFile.height,
        });
      }

      onChange(url);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || 'আপলোড ব্যর্থ হয়েছে';
      setError(msg);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onChange, sourceType, sourceField]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    // Reset so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleUpload]);

  const handleUrlSubmit = useCallback(() => {
    if (urlText.trim()) {
      onChange(urlText.trim());
      setUrlText('');
      setShowUrlInput(false);
      setUploadStats(null);
    }
  }, [urlText, onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
    setUploadStats(null);
    setError('');
  }, [onChange]);

  // ── Compact mode (for option images) ────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt="Option"
              className="h-10 w-10 rounded-lg object-cover border border-neutral-200 bg-white"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <HiOutlineX className="h-2.5 w-2.5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-10 w-10 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-400 flex items-center justify-center text-neutral-400 hover:text-primary-500 transition-colors"
              title="ছবি আপলোড"
            >
              {uploading ? (
                <span className="text-[9px] font-bold text-primary-500">{uploadProgress}%</span>
              ) : (
                <HiOutlinePhotograph className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
        {error && <span className="text-[10px] text-red-500">{error}</span>}
      </div>
    );
  }

  // ── Full mode ───────────────────────────────────────────
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      )}

      {value ? (
        /* ── Preview state ── */
        <div className="relative rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex items-start gap-3">
            <img
              src={value}
              alt="Preview"
              className="h-24 w-auto max-w-[200px] rounded-lg object-contain border border-neutral-200 bg-white shadow-sm"
              onError={(e) => {
                e.target.src = '';
                e.target.alt = 'লোড ব্যর্থ';
                e.target.className = 'h-24 w-24 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-400 text-xs';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-500 truncate mb-1" title={value}>
                {value.length > 60 ? `...${value.slice(-57)}` : value}
              </p>
              {uploadStats && (
                <div className="flex flex-wrap gap-2 text-[10px] mt-1">
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                    {uploadStats.savings}% সংকোচিত
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                    {uploadStats.newSize}
                  </span>
                  {uploadStats.width && (
                    <span className="bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                      {uploadStats.width}×{uploadStats.height}
                    </span>
                  )}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  পরিবর্তন
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  সরান
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Upload state ── */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
            dragOver
              ? 'border-primary-400 bg-primary-50/50 scale-[1.01]'
              : 'border-neutral-300 bg-neutral-50/50 hover:border-neutral-400'
          } ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          <div className="flex flex-col items-center justify-center py-6 px-4">
            {uploading ? (
              /* ── Uploading ── */
              <>
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                  <HiOutlineUpload className="h-5 w-5 text-primary-600 animate-bounce" />
                </div>
                <p className="text-sm font-medium text-primary-700">আপলোড হচ্ছে... {uploadProgress}%</p>
                <div className="w-48 h-1.5 bg-neutral-200 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              /* ── Ready ── */
              <>
                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mb-2">
                  <HiOutlinePhotograph className="h-5 w-5 text-neutral-400" />
                </div>
                <p className="text-sm text-neutral-600 font-medium mb-1">
                  ছবি টেনে আনুন বা ক্লিক করুন
                </p>
                <p className="text-[11px] text-neutral-400">
                  JPEG, PNG, WebP, GIF • সর্বোচ্চ ১০ MB • WebP-তে রূপান্তরিত হবে
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                  >
                    <HiOutlineUpload className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                    ফাইল বাছুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-lg hover:bg-neutral-300 transition-colors font-medium"
                  >
                    <HiOutlineLink className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                    URL দিন
                  </button>
                </div>
              </>
            )}
          </div>

          {/* URL input row */}
          {showUrlInput && !uploading && (
            <div className="border-t border-neutral-200 px-4 py-3 bg-white/50 rounded-b-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlText}
                  onChange={(e) => setUrlText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUrlSubmit(); } }}
                  className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="https://example.com/image.png"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  disabled={!urlText.trim()}
                  className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineCheckCircle className="h-3.5 w-3.5 inline mr-0.5 -mt-0.5" />
                  সেট
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <HiOutlineX className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
