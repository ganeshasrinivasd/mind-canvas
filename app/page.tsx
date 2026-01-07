'use client';

import { useRouter } from 'next/navigation';
import { LandingPage } from '@/components/LandingPage';
import { useMapStore } from '@/store/mapStore';
import type { StylePreset, MindMapDocument } from '@/types/mindmap';

export default function Home() {
  const router = useRouter();
  const { setDocument } = useMapStore();

  const handleGenerate = async (params: {
    sourceType: 'topic' | 'text' | 'pdf';
    title: string;
    stylePreset: StylePreset;
    maxDepth: number;
    maxNodes: number;
    text?: string;
    pdfFile?: File;
  }) => {
    try {
      let response: Response;

      if (params.sourceType === 'pdf' && params.pdfFile) {
        // For PDF uploads, use FormData
        const formData = new FormData();
        formData.append('sourceType', params.sourceType);
        formData.append('title', params.pdfFile.name);
        formData.append('stylePreset', params.stylePreset);
        formData.append('maxDepth', params.maxDepth.toString());
        formData.append('maxNodes', params.maxNodes.toString());
        formData.append('pdfFile', params.pdfFile);

        response = await fetch('/api/maps/generate', {
          method: 'POST',
          body: formData,
        });
      } else {
        // For topic and text, use JSON
        response = await fetch('/api/maps/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceType: params.sourceType,
            title: params.title,
            stylePreset: params.stylePreset,
            maxDepth: params.maxDepth,
            maxNodes: params.maxNodes,
            text: params.text,
          }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate mind map');
      }

      const { document } = await response.json() as { document: MindMapDocument };

      // Store the document
      setDocument(document);

      // Navigate to editor
      router.push(`/editor/${document.id}`);
    } catch (error) {
      console.error('Error generating mind map:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate mind map. Please try again.');
    }
  };

  return <LandingPage onGenerate={handleGenerate} />;
}
