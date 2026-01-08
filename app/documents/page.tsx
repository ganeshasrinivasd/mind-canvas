'use client';

import { useRouter } from 'next/navigation';
import DocumentLibrary from '@/components/DocumentLibrary';

export default function DocumentsPage() {
  const router = useRouter();

  return (
    <div className="w-screen min-h-screen" style={{
      background: 'radial-gradient(ellipse at 50% 0%, rgba(196, 167, 125, 0.12), transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(212, 184, 141, 0.08), transparent 50%), linear-gradient(180deg, #0a0f1a 0%, #0f172a 100%)',
    }}>
      {/* Top Bar */}
      <div className="h-16 backdrop-blur-sm border-b flex items-center justify-between px-6" style={{
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        borderColor: 'rgba(196, 167, 125, 0.2)',
      }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#C4A77D'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: '#ffffff' }}>My Documents</h1>
            <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              All your saved mindmaps
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
          style={{
            backgroundImage: 'linear-gradient(135deg, #C4A77D 0%, #A08B6F 50%, #8B7355 100%)',
            boxShadow: '0 4px 12px rgba(196, 167, 125, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(196, 167, 125, 0.6)';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 167, 125, 0.4)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Create New
        </button>
      </div>

      {/* Document Library */}
      <DocumentLibrary />
    </div>
  );
}
