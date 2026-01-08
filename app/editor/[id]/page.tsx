'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MindMapCanvasWrapper } from '@/components/MindMapCanvas';
import { InspectorPanel } from '@/components/InspectorPanel';
import { useMapStore } from '@/store/mapStore';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { document, isDirty, saveDocument, isSaving } = useMapStore();

  useEffect(() => {
    // If no document in store, redirect to home
    if (!document) {
      router.push('/');
    }
  }, [document, router]);

  const handleSave = async () => {
    try {
      await saveDocument();
      alert('Document saved successfully!');
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save document');
    }
  };

  if (!document) {
    return (
      <div className="w-screen h-screen flex items-center justify-center" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(196, 167, 125, 0.12), transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(212, 184, 141, 0.08), transparent 50%), linear-gradient(180deg, #0a0f1a 0%, #0f172a 100%)',
      }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col" style={{
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
            <h1 className="text-lg font-semibold" style={{ color: '#ffffff' }}>{document.meta.title}</h1>
            <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              {document.meta.stylePreset} style • {Object.keys(document.semantic.nodes).length} nodes
              {isDirty && ' • Unsaved changes'}
            </p>
          </div>
          <button
            onClick={() => router.push('/documents')}
            className="ml-4 px-3 py-1.5 text-xs font-medium transition-colors rounded-lg"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(196, 167, 125, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C4A77D';
              e.currentTarget.style.borderColor = 'rgba(196, 167, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(196, 167, 125, 0.2)';
            }}
          >
            My Library
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Query and Insights features removed for simplicity */}
          <button
            className="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C4A77D';
              e.currentTarget.style.borderColor = 'rgba(196, 167, 125, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Export
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all"
            style={{
              backgroundImage: 'linear-gradient(135deg, #C4A77D 0%, #A08B6F 50%, #8B7355 100%)',
              boxShadow: '0 4px 12px rgba(196, 167, 125, 0.4)',
              opacity: isSaving ? 0.6 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(196, 167, 125, 0.6)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(196, 167, 125, 0.4)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1">
          <MindMapCanvasWrapper />
        </div>

        {/* Inspector Panel */}
        <InspectorPanel />
      </div>
    </div>
  );
}
