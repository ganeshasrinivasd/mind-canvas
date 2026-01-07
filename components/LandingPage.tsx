// components/LandingPage.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { LandingHero } from './LandingHero';
import { InputForm } from './InputForm';
import type { StylePreset } from '@/types/mindmap';

interface LandingPageProps {
  onGenerate: (params: {
    sourceType: 'topic' | 'text' | 'pdf';
    title: string;
    stylePreset: StylePreset;
    maxDepth: number;
    maxNodes: number;
    text?: string;
    pdfFile?: File;
  }) => void;
}

export function LandingPage({ onGenerate }: LandingPageProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Ensure page always loads at the top (hero section)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGenerate = async (params: Parameters<typeof onGenerate>[0]) => {
    setIsGenerating(true);
    try {
      await onGenerate(params);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <LandingHero />

      {/* Organic neural transition */}
      <div className="relative h-40 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="neural-flow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.2)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Branching pathways */}
          <g filter="url(#glow)">
            <path
              d="M 50% 0 C 48% 20, 45% 40, 40% 100"
              stroke="url(#neural-flow)"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            >
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" />
            </path>
            <path
              d="M 50% 0 C 52% 20, 55% 40, 60% 100"
              stroke="url(#neural-flow)"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            >
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite" begin="1s" />
            </path>
            <path
              d="M 50% 0 L 50% 100"
              stroke="url(#neural-flow)"
              strokeWidth="3"
              fill="none"
              opacity="0.8"
            >
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            </path>
          </g>

          {/* Pulsing synaptic nodes */}
          <circle cx="50%" cy="30%" r="4" fill="#06b6d4" opacity="0.8">
            <animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="45%" cy="65%" r="3" fill="#14b8a6" opacity="0.7">
            <animate attributeName="r" values="2;5;2" dur="2.3s" repeatCount="indefinite" />
          </circle>
          <circle cx="55%" cy="65%" r="3" fill="#0ea5e9" opacity="0.7">
            <animate attributeName="r" values="2;5;2" dur="2.3s" repeatCount="indefinite" begin="0.5s" />
          </circle>
        </svg>
      </div>

      {/* Form Section - Premium Dark */}
      <div className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto relative">
          {/* Connection Dots */}
          <div className="absolute top-0 left-1/4 w-2 h-2 rounded-full" style={{ background: 'var(--accent-bronze-start)', opacity: 0.4 }} />
          <div className="absolute bottom-0 right-1/4 w-2 h-2 rounded-full" style={{ background: 'var(--accent-bronze-start)', opacity: 0.4 }} />

          {/* Section Header */}
          <div className="text-center mb-16 relative">
            <div className="label-text mb-6">
              CREATE YOUR NETWORK
            </div>

            <h2 className="serif-heading mb-4" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Ignite your first <span className="accent-gradient-text">node</span>
            </h2>

            <p style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              Every network begins with a single spark. What's yours?
            </p>
          </div>

          {/* The form with enhanced visual treatment */}
          <div className="relative">
            <InputForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>
        </div>
      </div>

      {/* Use Cases - Streamlined thought clusters */}
      <div className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-5xl md:text-6xl font-bold mb-6"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #cffafe 40%, #ccfbf1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Built for complexity
            </h2>
            <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              From research to contracts, one neural interface
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'Research Papers',
                description: 'Map argument structures, extract findings, prepare reviews with precision',
                gradient: 'linear-gradient(135deg, #C4A77D, #A08B6F)',
                icon: '📄',
              },
              {
                title: 'Legal Contracts',
                description: 'Identify risks, track clauses, build strategies with transparency',
                gradient: 'linear-gradient(135deg, #D4B88D, #B09678)',
                icon: '⚖️',
              },
              {
                title: 'Product Specs',
                description: 'Visualize requirements, spot gaps, align teams around truth',
                gradient: 'linear-gradient(135deg, #C4A77D, #8B7355)',
                icon: '📋',
              },
              {
                title: 'Market Analysis',
                description: 'Break down strategies, compare systematically, find opportunities',
                gradient: 'linear-gradient(135deg, #B09678, #8B7355)',
                icon: '📈',
              },
            ].map((useCase, index) => (
              <div
                key={index}
                className="relative group"
                style={{
                  animation: `float-smooth ${5 + index * 0.5}s ease-in-out infinite`,
                }}
              >
                <div
                  className="glass-card glass-card-hover rounded-3xl p-8 h-full relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {/* Hover glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: useCase.gradient,
                      filter: 'blur(40px)',
                    }}
                  />

                  <div className="relative z-10 flex items-start gap-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                      style={{
                        background: useCase.gradient,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {useCase.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3 text-white">
                        {useCase.title}
                      </h3>
                      <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {useCase.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center relative">
            <h2
              className="text-5xl md:text-6xl font-bold mb-6 relative"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #E4D4BC 50%, #C4A77D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ready to map your mind?
            </h2>

            <div className="relative group inline-block">
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(circle, rgba(196, 167, 125, 0.5), rgba(139, 115, 85, 0.3), transparent)',
                  filter: 'blur(30px)',
                  animation: 'pulse-glow 2s ease-in-out infinite',
                }}
              />

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="relative px-12 py-6 rounded-full font-bold text-xl text-white transition-all duration-500 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #C4A77D 0%, #A08B6F 50%, #8B7355 100%)',
                  backgroundSize: '200% 200%',
                  boxShadow: '0 10px 40px rgba(196, 167, 125, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundPosition = '100% 0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = '0% 0';
                }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Activate Your Network
                  <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative py-12 px-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
        <div className="max-w-6xl mx-auto text-center" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          <p className="text-sm">
            Designed for minds that see connections
          </p>
          <p className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
            MindCanvas - Where thoughts become networks
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        @keyframes pulse-expand {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(350px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(350px) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
}
