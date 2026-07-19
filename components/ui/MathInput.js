'use client';

import { useState, useRef } from 'react';
import clsx from 'clsx';
import MathRenderer from '../shared/MathRenderer';
import { 
  HiOutlinePencil, 
  HiOutlineEye, 
  HiOutlineTemplate, 
  HiOutlineQuestionMarkCircle 
} from 'react-icons/hi';

const toolbarCategories = [
  {
    name: 'Basic',
    items: [
      { label: 'Fraction', latex: '\\frac{a}{b}', selectOffset: 6, selectLen: 1 },
      { label: 'Power', latex: '^{n}', selectOffset: 2, selectLen: 1 },
      { label: 'Subscript', latex: '_{n}', selectOffset: 2, selectLen: 1 },
      { label: 'Sqrt', latex: '\\sqrt{x}', selectOffset: 6, selectLen: 1 },
      { label: 'Nth Root', latex: '\\sqrt[n]{x}', selectOffset: 6, selectLen: 1 },
    ]
  },
  {
    name: 'Greek',
    items: [
      { label: 'α (alpha)', latex: '\\alpha', selectOffset: 7, selectLen: 0 },
      { label: 'β (beta)', latex: '\\beta', selectOffset: 6, selectLen: 0 },
      { label: 'γ (gamma)', latex: '\\gamma', selectOffset: 7, selectLen: 0 },
      { label: 'δ (delta)', latex: '\\delta', selectOffset: 7, selectLen: 0 },
      { label: 'θ (theta)', latex: '\\theta', selectOffset: 7, selectLen: 0 },
      { label: 'π (pi)', latex: '\\pi', selectOffset: 4, selectLen: 0 },
      { label: 'λ (lambda)', latex: '\\lambda', selectOffset: 8, selectLen: 0 },
      { label: 'ω (omega)', latex: '\\omega', selectOffset: 7, selectLen: 0 },
      { label: 'μ (mu)', latex: '\\mu', selectOffset: 4, selectLen: 0 },
      { label: 'σ (sigma)', latex: '\\sigma', selectOffset: 7, selectLen: 0 },
      { label: 'φ (phi)', latex: '\\phi', selectOffset: 5, selectLen: 0 },
    ]
  },
  {
    name: 'Operators',
    items: [
      { label: '× (mul)', latex: '\\times', selectOffset: 7, selectLen: 0 },
      { label: '÷ (div)', latex: '\\div', selectOffset: 5, selectLen: 0 },
      { label: '± (pm)', latex: '\\pm', selectOffset: 4, selectLen: 0 },
      { label: '≠ (neq)', latex: '\\neq', selectOffset: 5, selectLen: 0 },
      { label: '≤ (leq)', latex: '\\leq', selectOffset: 5, selectLen: 0 },
      { label: '≥ (geq)', latex: '\\geq', selectOffset: 5, selectLen: 0 },
      { label: '≈ (approx)', latex: '\\approx', selectOffset: 8, selectLen: 0 },
      { label: '∞ (inf)', latex: '\\infty', selectOffset: 7, selectLen: 0 },
    ]
  },
  {
    name: 'Advanced',
    items: [
      { label: 'Integral', latex: '\\int_{a}^{b}', selectOffset: 6, selectLen: 1 },
      { label: 'Summation', latex: '\\sum_{i=1}^{n}', selectOffset: 6, selectLen: 3 },
      { label: 'Limit', latex: '\\lim_{x \\to a}', selectOffset: 6, selectLen: 7 },
      { label: 'Derivative', latex: '\\frac{d}{dx}', selectOffset: 12, selectLen: 0 },
      { label: '2x2 Matrix', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', selectOffset: 17, selectLen: 1 },
      { label: 'Vector', latex: '\\vec{v}', selectOffset: 6, selectLen: 1 },
      { label: 'Unit Vec', latex: '\\hat{i}', selectOffset: 6, selectLen: 1 },
      { label: 'Water (H2O)', latex: '\\text{H}_{2}\\text{O}', selectOffset: 18, selectLen: 0 },
      { label: 'Equilibrium', latex: '\\rightleftharpoons', selectOffset: 17, selectLen: 0 },
    ]
  }
];

export default function MathInput({
  label,
  value = '',
  onChange,
  error,
  helper,
  rows = 3,
  placeholder = '',
  className = '',
  id,
  required = false,
}) {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'preview', 'split'
  const [activeCategory, setActiveCategory] = useState('Basic');
  const inputRef = useRef(null);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  // Multi-line mode vs Single-line mode
  const isSingleLine = rows === 1;

  const insertLaTeX = (item) => {
    const input = inputRef.current;
    if (!input) return;

    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    const currentValue = input.value;

    // Wrap in $ or $$ if math mode is not detected around selection
    let template = item.latex;
    let finalOffset = item.selectOffset;

    // Smart auto-wrapping math delimiters if not already within math mode
    const needsDelimiters = !currentValue.substring(Math.max(0, startPos - 5), startPos).includes('$') && 
                            !currentValue.substring(endPos, Math.min(currentValue.length, endPos + 5)).includes('$');

    if (needsDelimiters) {
      template = `$${template}$`;
      finalOffset += 1; // shift offset due to opening $
    }

    const newValue =
      currentValue.substring(0, startPos) +
      template +
      currentValue.substring(endPos, currentValue.length);

    onChange(newValue);

    // Focus input and select placeholder parameters
    setTimeout(() => {
      input.focus();
      const selStart = startPos + finalOffset;
      const selEnd = selStart + item.selectLen;
      input.setSelectionRange(selStart, selEnd);
    }, 50);
  };

  return (
    <div className={clsx('w-full flex flex-col', className)}>
      {/* Label / Header area */}
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-neutral-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        
        {/* View mode switcher */}
        {!isSingleLine && (
          <div className="flex rounded-lg border border-neutral-200 p-0.5 bg-neutral-50 scale-[0.9] origin-right">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-150',
                activeTab === 'edit'
                  ? 'bg-white text-indigo-750 text-indigo-700 shadow-sm border border-neutral-200/50'
                  : 'text-neutral-500 hover:text-neutral-800'
              )}
            >
              <HiOutlinePencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-150',
                activeTab === 'preview'
                  ? 'bg-white text-indigo-750 text-indigo-700 shadow-sm border border-neutral-200/50'
                  : 'text-neutral-500 hover:text-neutral-800'
              )}
            >
              <HiOutlineEye className="h-3.5 w-3.5" /> Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('split')}
              className={clsx(
                'flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all duration-150',
                activeTab === 'split'
                  ? 'bg-white text-indigo-750 text-indigo-700 shadow-sm border border-neutral-200/50'
                  : 'text-neutral-500 hover:text-neutral-800'
              )}
            >
              <HiOutlineTemplate className="h-3.5 w-3.5" /> Split
            </button>
          </div>
        )}
      </div>

      {/* Main container */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all duration-150">
        
        {/* Math LaTeX Toolbar */}
        {activeTab !== 'preview' && (
          <div className="border-b border-neutral-100 bg-neutral-50/50 p-2 flex flex-col gap-1.5 shrink-0">
            {/* Category tabs */}
            <div className="flex gap-1 border-b border-neutral-100 pb-1.5 overflow-x-auto scrollbar-none">
              {toolbarCategories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategory(cat.name)}
                  className={clsx(
                    'px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-md transition-colors',
                    activeCategory === cat.name
                      ? 'bg-indigo-50 text-indigo-750 font-black text-indigo-700'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* LaTeX buttons */}
            <div className="flex flex-wrap gap-1 items-center overflow-x-auto pb-1 max-h-[72px] overflow-y-auto scrollbar-thin">
              {toolbarCategories
                .find((cat) => cat.name === activeCategory)
                ?.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => insertLaTeX(item)}
                    className="group relative px-2 py-1 text-[11.5px] font-bold text-neutral-600 border border-neutral-200/80 bg-white rounded-lg hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-150 flex items-center gap-1 shadow-sm"
                  >
                    <span className="font-mono text-neutral-500 group-hover:text-indigo-600">{item.latex}</span>
                    <span className="text-[9px] text-neutral-400 font-semibold group-hover:text-indigo-500/80">({item.label})</span>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Input & Preview Workspace */}
        <div className={clsx(
          'flex divide-neutral-200/80',
          activeTab === 'split' ? 'flex-row divide-x' : 'flex-col'
        )}>
          {/* Editor block */}
          {activeTab !== 'preview' && (
            <div className="flex-1 min-w-0">
              {isSingleLine ? (
                <input
                  ref={inputRef}
                  id={inputId}
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-3.5 py-3 text-sm text-neutral-800 focus:outline-none placeholder:text-neutral-400 border-none outline-none font-medium"
                />
              ) : (
                <textarea
                  ref={inputRef}
                  id={inputId}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  rows={rows}
                  className="w-full px-3.5 py-3 text-sm text-neutral-800 focus:outline-none placeholder:text-neutral-400 border-none outline-none resize-none font-medium leading-relaxed"
                />
              )}
            </div>
          )}

          {/* Preview block */}
          {activeTab !== 'edit' && (
            <div className={clsx(
              'flex-1 p-4 overflow-y-auto bg-neutral-50/30 min-h-[92px]',
              activeTab === 'split' ? 'max-h-[220px]' : ''
            )}>
              {value ? (
                <div className="prose prose-sm max-w-none text-neutral-700">
                  <MathRenderer text={value} />
                </div>
              ) : (
                <p className="text-xs italic text-neutral-400">Live formulas preview renders here...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Helper & Hint messages */}
      <div className="mt-1.5 flex items-center justify-between gap-2 px-1">
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helper ? (
          <p className="text-xs text-neutral-400 font-medium">{helper}</p>
        ) : (
          <div className="flex items-center gap-1 text-[10.5px] font-semibold text-neutral-400/90 tracking-wide uppercase">
            <HiOutlineQuestionMarkCircle className="h-3.5 w-3.5" />
            <span>Use <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded text-neutral-500 font-bold">$math$</code> for inline & <code className="font-mono bg-neutral-100 px-1 py-0.5 rounded text-neutral-500 font-bold">$$math$$</code> for block formulas</span>
          </div>
        )}
      </div>
    </div>
  );
}
