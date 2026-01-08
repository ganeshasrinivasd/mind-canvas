// components/LandingHero.tsx

'use client';

import React, { useEffect, useRef, useState } from 'react';

export function LandingHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [constellationFade, setConstellationFade] = useState(false);
  const [showBrandText, setShowBrandText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // After 2.5 seconds, fade the constellation
    const constellationFadeTimer = setTimeout(() => {
      setConstellationFade(true);
    }, 2500);

    // After 3.5 seconds (1s after constellation fades), show brand text
    const brandTextTimer = setTimeout(() => {
      setShowBrandText(true);
    }, 3500);

    // After 6 seconds, start full fade out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 6000);

    // After 7 seconds (1 second fade), remove intro completely
    const removeTimer = setTimeout(() => {
      setShowIntro(false);
    }, 7000);

    return () => {
      clearTimeout(constellationFadeTimer);
      clearTimeout(brandTextTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Neural network nodes
    const nodes: { x: number; y: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < 30; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }

    let animationFrame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw connections
        nodes.slice(i + 1).forEach((other) => {
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.15;
            ctx.strokeStyle = `rgba(196, 167, 125, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });

        // Draw node
        ctx.fillStyle = 'rgba(196, 167, 125, 0.4)';
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  const openDemo = () => {
    // Open a demo mind map about AI and Machine Learning
    window.open('/editor/demo', '_blank');
  };

  return (
    <>
      {/* Intro Animation */}
      {showIntro && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: '#000000',
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 1s ease-out',
          }}
        >
          {/* Large Neural Constellation - Center Stage */}
          <div
            className="relative"
            style={{
              opacity: constellationFade ? 0 : 1,
              transition: 'opacity 1s ease-out',
            }}
          >
            <svg width="1400" height="1000" viewBox="0 0 1200 900" fill="none">
              <defs>
                <filter id="intro-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Central core - animated grow */}
              <circle cx="600" cy="450" r="0" fill="rgba(196, 167, 125, 1)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;20;16" dur="1.5s" fill="freeze" />
                <animate attributeName="opacity" values="0;1;0.95" dur="1.5s" fill="freeze" />
              </circle>

              {/* Inner ring - staggered appearance */}
              <circle cx="600" cy="320" r="0" fill="rgba(196, 167, 125, 0.95)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;14;12" begin="0.3s" dur="0.8s" fill="freeze" />
              </circle>
              <circle cx="730" cy="365" r="0" fill="rgba(196, 167, 125, 0.95)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;14;12" begin="0.4s" dur="0.8s" fill="freeze" />
              </circle>
              <circle cx="780" cy="450" r="0" fill="rgba(196, 167, 125, 0.95)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;14;12" begin="0.5s" dur="0.8s" fill="freeze" />
              </circle>
              <circle cx="730" cy="535" r="0" fill="rgba(196, 167, 125, 0.95)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;14;12" begin="0.6s" dur="0.8s" fill="freeze" />
              </circle>
              <circle cx="600" cy="580" r="0" fill="rgba(196, 167, 125, 0.95)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;14;12" begin="0.7s" dur="0.8s" fill="freeze" />
              </circle>
              <circle cx="470" cy="535" r="0" fill="rgba(196, 167, 125, 0.95)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;14;12" begin="0.8s" dur="0.8s" fill="freeze" />
              </circle>
              <circle cx="420" cy="450" r="0" fill="rgba(196, 167, 125, 0.95)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;14;12" begin="0.9s" dur="0.8s" fill="freeze" />
              </circle>
              <circle cx="470" cy="365" r="0" fill="rgba(196, 167, 125, 0.95)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;14;12" begin="1s" dur="0.8s" fill="freeze" />
              </circle>

              {/* Connections appear after nodes */}
              <path d="M 600 450 L 600 320" stroke="rgba(196, 167, 125, 0)" strokeWidth="2.5" fill="none">
                <animate attributeName="stroke" values="rgba(196, 167, 125, 0);rgba(196, 167, 125, 0.8)" begin="1.2s" dur="0.5s" fill="freeze" />
              </path>
              <path d="M 600 450 L 730 365" stroke="rgba(196, 167, 125, 0)" strokeWidth="2.5" fill="none">
                <animate attributeName="stroke" values="rgba(196, 167, 125, 0);rgba(196, 167, 125, 0.8)" begin="1.3s" dur="0.5s" fill="freeze" />
              </path>
              <path d="M 600 450 L 780 450" stroke="rgba(196, 167, 125, 0)" strokeWidth="2.5" fill="none">
                <animate attributeName="stroke" values="rgba(196, 167, 125, 0);rgba(196, 167, 125, 0.8)" begin="1.4s" dur="0.5s" fill="freeze" />
              </path>
              <path d="M 600 450 L 730 535" stroke="rgba(196, 167, 125, 0)" strokeWidth="2.5" fill="none">
                <animate attributeName="stroke" values="rgba(196, 167, 125, 0);rgba(196, 167, 125, 0.8)" begin="1.5s" dur="0.5s" fill="freeze" />
              </path>
              <path d="M 600 450 L 600 580" stroke="rgba(196, 167, 125, 0)" strokeWidth="2.5" fill="none">
                <animate attributeName="stroke" values="rgba(196, 167, 125, 0);rgba(196, 167, 125, 0.8)" begin="1.6s" dur="0.5s" fill="freeze" />
              </path>
              <path d="M 600 450 L 470 535" stroke="rgba(196, 167, 125, 0)" strokeWidth="2.5" fill="none">
                <animate attributeName="stroke" values="rgba(196, 167, 125, 0);rgba(196, 167, 125, 0.8)" begin="1.7s" dur="0.5s" fill="freeze" />
              </path>
              <path d="M 600 450 L 420 450" stroke="rgba(196, 167, 125, 0)" strokeWidth="2.5" fill="none">
                <animate attributeName="stroke" values="rgba(196, 167, 125, 0);rgba(196, 167, 125, 0.8)" begin="1.8s" dur="0.5s" fill="freeze" />
              </path>
              <path d="M 600 450 L 470 365" stroke="rgba(196, 167, 125, 0)" strokeWidth="2.5" fill="none">
                <animate attributeName="stroke" values="rgba(196, 167, 125, 0);rgba(196, 167, 125, 0.8)" begin="1.9s" dur="0.5s" fill="freeze" />
              </path>

              {/* Outer particles appear last */}
              <circle cx="600" cy="220" r="0" fill="rgba(196, 167, 125, 0.8)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;8;6" begin="2s" dur="0.6s" fill="freeze" />
              </circle>
              <circle cx="800" cy="280" r="0" fill="rgba(196, 167, 125, 0.8)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;8;6" begin="2.1s" dur="0.6s" fill="freeze" />
              </circle>
              <circle cx="880" cy="450" r="0" fill="rgba(196, 167, 125, 0.8)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;8;6" begin="2.2s" dur="0.6s" fill="freeze" />
              </circle>
              <circle cx="800" cy="620" r="0" fill="rgba(196, 167, 125, 0.8)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;8;6" begin="2.3s" dur="0.6s" fill="freeze" />
              </circle>
              <circle cx="600" cy="680" r="0" fill="rgba(196, 167, 125, 0.8)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;8;6" begin="2.4s" dur="0.6s" fill="freeze" />
              </circle>
              <circle cx="400" cy="620" r="0" fill="rgba(196, 167, 125, 0.8)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;8;6" begin="2.5s" dur="0.6s" fill="freeze" />
              </circle>
              <circle cx="320" cy="450" r="0" fill="rgba(196, 167, 125, 0.8)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;8;6" begin="2.6s" dur="0.6s" fill="freeze" />
              </circle>
              <circle cx="400" cy="280" r="0" fill="rgba(196, 167, 125, 0.8)" filter="url(#intro-glow)">
                <animate attributeName="r" values="0;8;6" begin="2.7s" dur="0.6s" fill="freeze" />
              </circle>
            </svg>
          </div>

          {/* Brand text appears after constellation fades */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
            style={{
              opacity: showBrandText ? 1 : 0,
              transition: 'opacity 1s ease-out',
            }}
          >
            <h1 className="serif-heading" style={{
              fontSize: '48px',
              fontWeight: 400,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              marginBottom: '12px',
            }}>
              MindCanvas
            </h1>
            <p className="label-text" style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
            }}>
              NEURAL INTELLIGENCE PLATFORM
            </p>
          </div>
        </div>
      )}

      {/* Main Hero Content - Fades in after intro */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: '#000000',
          opacity: showIntro ? 0 : 1,
          transition: 'opacity 1s ease-in',
        }}
      >
        {/* Neural Network Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.6, zIndex: 1 }}
        />

      {/* Central Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none" style={{ zIndex: 2 }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, rgba(196, 167, 125, 0.08) 0%, rgba(139, 115, 85, 0.04) 30%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Navbar - Fixed */}
      <div className="fixed top-0 left-0 right-0 px-6 py-6 backdrop-blur-md" style={{
        zIndex: 20,
        borderBottom: '1px solid rgba(196, 167, 125, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo & Brand */}
          <div className="flex items-center gap-3">
            {/* Miniature Neural Logo */}
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <defs>
                <filter id="logo-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Central core */}
              <circle cx="50" cy="50" r="5" fill="rgba(196, 167, 125, 1)" filter="url(#logo-glow)" />

              {/* Inner ring nodes */}
              <circle cx="50" cy="30" r="3" fill="rgba(196, 167, 125, 0.9)" filter="url(#logo-glow)" />
              <circle cx="70" cy="50" r="3" fill="rgba(196, 167, 125, 0.9)" filter="url(#logo-glow)" />
              <circle cx="50" cy="70" r="3" fill="rgba(196, 167, 125, 0.9)" filter="url(#logo-glow)" />
              <circle cx="30" cy="50" r="3" fill="rgba(196, 167, 125, 0.9)" filter="url(#logo-glow)" />

              {/* Outer nodes */}
              <circle cx="65" cy="35" r="2" fill="rgba(196, 167, 125, 0.7)" />
              <circle cx="65" cy="65" r="2" fill="rgba(196, 167, 125, 0.7)" />
              <circle cx="35" cy="65" r="2" fill="rgba(196, 167, 125, 0.7)" />
              <circle cx="35" cy="35" r="2" fill="rgba(196, 167, 125, 0.7)" />

              {/* Connection lines */}
              <path d="M 50 50 L 50 30" stroke="rgba(196, 167, 125, 0.5)" strokeWidth="1" />
              <path d="M 50 50 L 70 50" stroke="rgba(196, 167, 125, 0.5)" strokeWidth="1" />
              <path d="M 50 50 L 50 70" stroke="rgba(196, 167, 125, 0.5)" strokeWidth="1" />
              <path d="M 50 50 L 30 50" stroke="rgba(196, 167, 125, 0.5)" strokeWidth="1" />
              <path d="M 50 30 L 65 35" stroke="rgba(196, 167, 125, 0.3)" strokeWidth="0.5" />
              <path d="M 70 50 L 65 65" stroke="rgba(196, 167, 125, 0.3)" strokeWidth="0.5" />
              <path d="M 50 70 L 35 65" stroke="rgba(196, 167, 125, 0.3)" strokeWidth="0.5" />
              <path d="M 30 50 L 35 35" stroke="rgba(196, 167, 125, 0.3)" strokeWidth="0.5" />
            </svg>

            {/* Brand Name */}
            <h1 className="serif-heading" style={{
              fontSize: '24px',
              color: 'var(--text-primary)',
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}>
              MindCanvas
            </h1>
          </div>

          {/* Right: Developer Info */}
          <div className="flex items-center gap-3 md:gap-6">
            <span className="hidden md:block label-text" style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.5)',
            }}>
              DEVELOPED BY <span style={{
                background: 'linear-gradient(135deg, var(--accent-bronze-start), var(--accent-bronze-end))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 600,
              }}>GANESHA</span>
            </span>
            <div className="flex items-center gap-3 md:gap-4">
              {/* Portfolio */}
              <a
                href="https://gdamaraju.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C4A77D'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                aria-label="Portfolio"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/ganeshasrinivasd"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C4A77D'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                aria-label="GitHub"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/ganesha2906/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#C4A77D'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Dots - Top */}
      <div className="absolute top-32 left-1/4 w-2 h-2 rounded-full" style={{ background: 'var(--accent-bronze-start)', opacity: 0.6, zIndex: 3 }} />
      <div className="absolute top-40 right-1/3 w-2 h-2 rounded-full" style={{ background: 'var(--accent-bronze-start)', opacity: 0.6, zIndex: 3 }} />

      {/* Main Content */}
      <div className="relative max-w-4xl mx-auto text-center px-6" style={{ zIndex: 10 }}>
        {/* Label */}
        <div className="label-text mb-8">
          NEURAL INTELLIGENCE PLATFORM
        </div>

        {/* Hero Heading - Serif */}
        <h2 className="serif-heading mb-6" style={{
          fontSize: 'clamp(48px, 8vw, 96px)',
          color: 'var(--text-primary)',
          marginBottom: '24px',
        }}>
          Turn chaos
          <br />
          into <span className="accent-gradient-text">clarity</span>
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '18px',
          lineHeight: '1.7',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 48px',
          fontWeight: 300,
        }}>
          Transform any content into systematic mind maps. AI-powered, evidence-backed, infinitely scalable.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={scrollToNext} className="btn-primary">
            Start Building
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3L13 8L8 13M13 8H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <a
            href="/documents"
            className="px-6 py-3 text-sm font-medium text-white rounded-lg transition-all flex items-center gap-2"
            style={{
              backgroundImage: 'linear-gradient(135deg, rgba(196, 167, 125, 0.8) 0%, rgba(160, 139, 111, 0.8) 50%, rgba(139, 115, 85, 0.8) 100%)',
              boxShadow: '0 4px 12px rgba(196, 167, 125, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(196, 167, 125, 0.5)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 167, 125, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h12M2 8h12M2 13h12" strokeLinecap="round"/>
            </svg>
            View Library
          </a>
        </div>

        {/* Value Highlights */}
        <div className="flex items-center justify-center gap-16 mt-20" style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '32px',
        }}>
          {/* Think Visually */}
          <div className="text-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 12px' }}>
              <circle cx="16" cy="16" r="12" stroke="url(#icon-gradient)" strokeWidth="1.5" opacity="0.6" />
              <circle cx="16" cy="16" r="6" stroke="url(#icon-gradient)" strokeWidth="1.5" opacity="0.8" />
              <circle cx="16" cy="16" r="2" fill="url(#icon-gradient)" opacity="1" />
              <defs>
                <linearGradient id="icon-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#C4A77D" />
                  <stop offset="100%" stopColor="#8B7355" />
                </linearGradient>
              </defs>
            </svg>
            <div className="label-text" style={{
              fontSize: '11px',
              color: 'var(--text-primary)',
              fontWeight: 500,
              letterSpacing: '0.08em',
            }}>
              Think Visually
            </div>
          </div>

          {/* Map Anything */}
          <div className="text-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 12px' }}>
              <circle cx="16" cy="8" r="3" fill="url(#icon-gradient)" opacity="0.8" />
              <circle cx="8" cy="24" r="3" fill="url(#icon-gradient)" opacity="0.8" />
              <circle cx="24" cy="24" r="3" fill="url(#icon-gradient)" opacity="0.8" />
              <path d="M 16 11 L 11 21" stroke="url(#icon-gradient)" strokeWidth="1.5" opacity="0.5" />
              <path d="M 16 11 L 21 21" stroke="url(#icon-gradient)" strokeWidth="1.5" opacity="0.5" />
              <path d="M 11 24 L 21 24" stroke="url(#icon-gradient)" strokeWidth="1.5" opacity="0.5" />
            </svg>
            <div className="label-text" style={{
              fontSize: '11px',
              color: 'var(--text-primary)',
              fontWeight: 500,
              letterSpacing: '0.08em',
            }}>
              Map Anything
            </div>
          </div>

          {/* Scale Freely */}
          <div className="text-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 12px' }}>
              <path d="M 8 24 C 8 24, 12 16, 16 16 C 20 16, 24 8, 24 8" stroke="url(#icon-gradient)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M 20 6 L 24 8 L 22 12" stroke="url(#icon-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
              <path d="M 12 26 L 8 24 L 10 20" stroke="url(#icon-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
              <circle cx="16" cy="16" r="2.5" fill="url(#icon-gradient)" opacity="0.9" />
            </svg>
            <div className="label-text" style={{
              fontSize: '11px',
              color: 'var(--text-primary)',
              fontWeight: 500,
              letterSpacing: '0.08em',
            }}>
              Scale Freely
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Connection Dots */}
      <div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full" style={{ background: 'var(--accent-bronze-start)', opacity: 0.6, zIndex: 3 }} />
      <div className="absolute bottom-40 right-1/4 w-2 h-2 rounded-full" style={{ background: 'var(--accent-bronze-start)', opacity: 0.6, zIndex: 3 }} />

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2" style={{ zIndex: 10 }}>
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={scrollToNext}>
          <span className="label-text" style={{ fontSize: '10px' }}>EXPLORE</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 5V15M10 15L15 10M10 15L5 10" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      </div>
    </>
  );
}
