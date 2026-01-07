// components/InputForm.tsx

'use client';

import React, { useState } from 'react';
import type { StylePreset } from '@/types/mindmap';

interface InputFormProps {
  onGenerate: (params: {
    sourceType: 'topic' | 'text' | 'pdf';
    title: string;
    stylePreset: StylePreset;
    maxDepth: number;
    maxNodes: number;
    text?: string;
    pdfFile?: File;
  }) => void;
  isGenerating?: boolean;
}

type InputMode = 'topic' | 'text' | 'pdf';

const STYLE_PRESETS = [
  {
    value: 'study' as StylePreset,
    label: 'Study',
    description: 'Comprehensive & explanatory',
    color: '#D4B88D',
  },
  {
    value: 'executive' as StylePreset,
    label: 'Executive',
    description: 'Decision-focused & concise',
    color: '#C4A77D',
  },
  {
    value: 'legal' as StylePreset,
    label: 'Legal',
    description: 'Precise & evidence-heavy',
    color: '#A08B6F',
  },
  {
    value: 'technical' as StylePreset,
    label: 'Technical',
    description: 'Detailed & systematic',
    color: '#8B7355',
  },
];

export function InputForm({ onGenerate, isGenerating = false }: InputFormProps) {
  const [step, setStep] = useState(1); // 1: mode, 2: style, 3: input & options
  const [inputMode, setInputMode] = useState<InputMode | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [stylePreset, setStylePreset] = useState<StylePreset | null>(null);
  const [maxDepth, setMaxDepth] = useState(3);
  const [maxNodes, setMaxNodes] = useState(60);
  const [isDragging, setIsDragging] = useState(false);

  const handleModeSelect = (mode: InputMode) => {
    setInputMode(mode);
    // Smooth transition to next step
    setTimeout(() => setStep(2), 300);
  };

  const handleStyleSelect = (style: StylePreset) => {
    setStylePreset(style);
    // Smooth transition to final step
    setTimeout(() => setStep(3), 300);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setInputMode(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMode || !stylePreset) return;
    if (inputMode === 'topic' && !title.trim()) return;
    if (inputMode === 'text' && !text.trim()) return;
    if (inputMode === 'pdf' && !pdfFile) return;

    onGenerate({
      sourceType: inputMode,
      title: inputMode === 'topic' ? title : pdfFile?.name || 'Untitled',
      stylePreset,
      maxDepth,
      maxNodes,
      text: inputMode === 'text' ? text : undefined,
      pdfFile: inputMode === 'pdf' && pdfFile ? pdfFile : undefined,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const canSubmit =
    (inputMode === 'topic' && title.trim()) ||
    (inputMode === 'text' && text.trim()) ||
    (inputMode === 'pdf' && pdfFile);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-3 mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className="relative"
              style={{
                width: step >= s ? '60px' : '30px',
                height: '4px',
                background: step >= s
                  ? 'linear-gradient(90deg, var(--accent-bronze-start), var(--accent-bronze-end))'
                  : 'var(--border-subtle)',
                borderRadius: '2px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            {s < 3 && (
              <div style={{
                width: '16px',
                height: '1px',
                background: 'var(--border-subtle)',
              }} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* STEP 1: Choose Mode */}
        <div
          style={{
            display: step === 1 ? 'block' : 'none',
            opacity: step === 1 ? 1 : 0,
            transform: step === 1 ? 'translateX(0)' : 'translateX(-50px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="label-text text-center mb-6">
            STEP 1 OF 3
          </div>
          <h3 className="serif-heading text-center mb-8" style={{ fontSize: '32px', color: 'var(--text-primary)' }}>
            How will you feed the network?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                mode: 'topic' as InputMode,
                icon: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="24" cy="24" r="4" fill="currentColor"/>
                    <path d="M24 4V12M24 36V44M4 24H12M36 24H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
                title: 'Topic',
                desc: 'A single concept or idea'
              },
              {
                mode: 'text' as InputMode,
                icon: (
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M14 18H34M14 24H34M14 30H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
                title: 'Text',
                desc: 'Paste your content'
              },
            ].map((option) => (
              <button
                key={option.mode}
                type="button"
                onClick={() => handleModeSelect(option.mode)}
                className="dark-card dark-card-hover p-10 text-center transition-all duration-300 group relative overflow-hidden"
              >
                {/* Hover accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(90deg, var(--accent-bronze-start), var(--accent-bronze-end))',
                  }}
                />

                <div className="relative z-10">
                  <div className="mb-6 flex justify-center" style={{ color: 'var(--accent-bronze-start)' }}>
                    {option.icon}
                  </div>
                  <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {option.title}
                  </h4>
                  <p className="label-text" style={{ textTransform: 'none', fontSize: '13px' }}>
                    {option.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* STEP 2: Choose Style */}
        <div
          style={{
            display: step === 2 ? 'block' : 'none',
            opacity: step === 2 ? 1 : 0,
            transform: step === 2 ? 'translateX(0)' : 'translateX(50px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 text-sm flex items-center gap-2 hover:gap-3 transition-all duration-300"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="label-text text-center mb-6">
            STEP 2 OF 3
          </div>
          <h3 className="serif-heading text-center mb-8" style={{ fontSize: '32px', color: 'var(--text-primary)' }}>
            Choose your thinking style
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleStyleSelect(preset.value)}
                className="dark-card dark-card-hover p-8 text-left transition-all duration-300 group relative overflow-hidden"
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: preset.color,
                  }}
                />

                <div className="relative z-10">
                  <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {preset.label}
                  </h4>
                  <p className="label-text" style={{ textTransform: 'none', fontSize: '13px' }}>
                    {preset.description}
                  </p>
                </div>

                {/* Indicator dot */}
                <div
                  className="absolute top-8 right-8 w-2 h-2 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ background: preset.color }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* STEP 3: Input & Advanced Options */}
        <div
          style={{
            display: step === 3 ? 'block' : 'none',
            opacity: step === 3 ? 1 : 0,
            transform: step === 3 ? 'translateX(0)' : 'translateX(50px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 text-sm flex items-center gap-2 hover:gap-3 transition-all duration-300"
            style={{ color: 'rgba(255, 255, 255, 0.6)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="space-y-8">
            {/* Input Area */}
            <div className="dark-card overflow-hidden">
              {/* Topic Input */}
              {inputMode === 'topic' && (
                <div className="p-10">
                  <label className="label-text mb-4 block" style={{ textTransform: 'none' }}>
                    What's your topic?
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Machine Learning, Quantum Physics..."
                      className="w-full px-6 py-4 text-base rounded-lg outline-none transition-all duration-200"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent-bronze-start)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-subtle)';
                      }}
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              )}

              {/* Text Input */}
              {inputMode === 'text' && (
                <div className="p-10">
                  <label className="label-text mb-4 block" style={{ textTransform: 'none' }}>
                    Paste your content
                  </label>
                  <div className="relative">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Paste your text, article, or notes here..."
                      className="w-full h-56 px-6 py-4 text-base rounded-lg outline-none transition-all duration-200 resize-none"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent-bronze-start)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-subtle)';
                      }}
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="mt-3 label-text" style={{ fontSize: '11px' }}>
                    {text.length} characters
                  </div>
                </div>
              )}

              {/* PDF Upload - DISABLED FOR NOW */}
              {false && inputMode === 'pdf' && (
                <div className="p-10">
                  <label className="block text-sm font-semibold mb-4 bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
                    Upload your PDF
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className="relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-500"
                    style={{
                      borderColor: isDragging ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.15)',
                      background: isDragging
                        ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(20, 184, 166, 0.1))'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
                      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    {pdfFile ? (
                      <div className="space-y-6">
                        <div className="text-6xl">📄</div>
                        <div>
                          <div className="font-bold text-lg text-white mb-2">
                            {pdfFile?.name}
                          </div>
                          <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {pdfFile?.size ? (pdfFile?.size / 1024 / 1024).toFixed(2) : '0.00'} MB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPdfFile(null)}
                          className="px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <svg className="w-20 h-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <div>
                          <div className="font-bold text-lg text-white mb-2">
                            Drop your PDF here
                          </div>
                          <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            or click to browse
                          </div>
                        </div>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileSelect}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isGenerating}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-center" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    Maximum 50 pages - 10MB limit
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Options */}
            <div className="dark-card p-8 space-y-8">
              <div className="label-text">
                CONFIGURATION
              </div>

              <div className="space-y-8">
                {/* Max Depth */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="label-text" style={{ textTransform: 'none' }}>Tree Depth</label>
                    <div className="px-3 py-1 rounded" style={{
                      background: 'var(--surface)',
                      color: 'var(--accent-bronze-start)',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}>
                      {maxDepth}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="2"
                      max="5"
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                      className="w-full h-1 rounded appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right,
                          var(--accent-bronze-start) 0%,
                          var(--accent-bronze-start) ${((maxDepth - 2) / 3) * 100}%,
                          var(--border-subtle) ${((maxDepth - 2) / 3) * 100}%)`,
                      }}
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="flex justify-between mt-3 label-text" style={{ fontSize: '10px' }}>
                    <span>SHALLOW</span>
                    <span>DEEP</span>
                  </div>
                </div>

                {/* Max Nodes */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="label-text" style={{ textTransform: 'none' }}>Maximum Nodes</label>
                    <div className="px-3 py-1 rounded" style={{
                      background: 'var(--surface)',
                      color: 'var(--accent-bronze-start)',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}>
                      {maxNodes}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="10"
                      value={maxNodes}
                      onChange={(e) => setMaxNodes(parseInt(e.target.value))}
                      className="w-full h-1 rounded appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right,
                          var(--accent-bronze-start) 0%,
                          var(--accent-bronze-start) ${((maxNodes - 20) / 80) * 100}%,
                          var(--border-subtle) ${((maxNodes - 20) / 80) * 100}%)`,
                      }}
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="flex justify-between mt-3 label-text" style={{ fontSize: '10px' }}>
                    <span>CONCISE</span>
                    <span>DETAILED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit || isGenerating}
              className="btn-primary w-full py-5 justify-center text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canSubmit && !isGenerating ? 'var(--text-primary)' : 'var(--border-medium)',
                color: canSubmit && !isGenerating ? '#000000' : 'var(--text-tertiary)',
                cursor: canSubmit && !isGenerating ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (canSubmit && !isGenerating) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.backgroundPosition = '100% 0';
                }
              }}
              onMouseLeave={(e) => {
                if (canSubmit && !isGenerating) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundPosition = '0% 0';
                }
              }}
            >
              {canSubmit && !isGenerating && (
                <div className="absolute inset-0 shimmer" style={{ pointerEvents: 'none' }} />
              )}

              <span className="relative z-10 flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating your mind map...
                  </>
                ) : (
                  'Generate Mind Map'
                )}
              </span>
            </button>
          </div>
        </div>
      </form>

      <style jsx>{`
        @keyframes shimmer-progress {
          0% {
            background-position: -100px 0;
          }
          100% {
            background-position: 100px 0;
          }
        }
      `}</style>
    </div>
  );
}
