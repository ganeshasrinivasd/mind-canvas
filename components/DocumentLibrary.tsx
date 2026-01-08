// components/DocumentLibrary.tsx
'use client';

import { useEffect } from 'react';
import { useMapStore } from '@/store/mapStore';
import { useRouter } from 'next/navigation';

export default function DocumentLibrary() {
  const { savedDocuments, fetchDocuments, loadDocument, deleteDocument, isLoading } = useMapStore();
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleLoadDocument = async (id: string) => {
    try {
      await loadDocument(id);
      router.push(`/editor/${id}`);
    } catch (error) {
      console.error('Failed to load document:', error);
      alert('Failed to load document');
    }
  };

  const handleDeleteDocument = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await deleteDocument(id);
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading documents...
      </div>
    );
  }

  if (savedDocuments.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ marginBottom: '16px' }}>No saved documents yet.</p>
        <p style={{ fontSize: '14px' }}>Generate a mindmap and save it to see it here.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 600,
        marginBottom: '24px',
        color: 'var(--text-primary)'
      }}>
        Saved Documents ({savedDocuments.length})
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
      }}>
        {savedDocuments.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(196, 167, 125, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(196, 167, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(196, 167, 125, 0.2)';
            }}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
            onClick={() => handleLoadDocument(doc.id)}
            >
              {doc.title}
            </h3>

            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
            }}>
              <div style={{ marginBottom: '4px' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  background: 'rgba(196, 167, 125, 0.2)',
                  borderRadius: '4px',
                  marginRight: '8px',
                }}>
                  {doc.style_preset}
                </span>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  background: 'rgba(196, 167, 125, 0.2)',
                  borderRadius: '4px',
                }}>
                  {doc.source_type}
                </span>
              </div>
              <div style={{ marginTop: '8px' }}>
                Updated: {new Date(doc.updated_at).toLocaleDateString()}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
            }}>
              <button
                onClick={() => handleLoadDocument(doc.id)}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  background: 'rgba(196, 167, 125, 0.2)',
                  border: '1px solid rgba(196, 167, 125, 0.4)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(196, 167, 125, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(196, 167, 125, 0.2)';
                }}
              >
                Open
              </button>

              <button
                onClick={() => handleDeleteDocument(doc.id, doc.title)}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '6px',
                  color: '#ff6b6b',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 0, 0, 0.1)';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
