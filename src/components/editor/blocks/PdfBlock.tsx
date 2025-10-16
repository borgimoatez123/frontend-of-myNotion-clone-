import React, { useRef } from 'react';
import { Block, BlockContent } from '@/types';
import { DragHandle } from '../DragHandle';
import { DeleteButton } from '../DeleteButton';

interface PdfBlockProps {
  block: Block;
  onUpdate: (updates: Partial<{ type: Block['type']; content: Partial<BlockContent> }>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDelete: () => void;
}

export const PdfBlock: React.FC<PdfBlockProps> = ({
  block,
  onUpdate,
  onFocus,
  onBlur,
  onDragStart,
  onDelete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      onUpdate({ content: { url } });
    }
  };

  const handleUrlChange = (url: string) => {
    onUpdate({ content: { url } });
  };

  return (
    <div className="group relative seamless-block" style={{ padding: '0.75rem 0' }}>
      {block.content.url ? (
        <div className="space-y-2">
          <div className="border rounded-lg" style={{ borderColor: 'var(--border)', height: '400px' }}>
            <iframe
              src={block.content.url}
              className="w-full h-full rounded-lg"
              title="PDF Document"
            />
          </div>
          <input
            type="text"
            value={block.content.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            className="w-full seamless-block text-sm"
            style={{
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
              background: 'transparent',
              border: 'none',
              outline: 'none',
            }}
            placeholder="PDF URL"
          />
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: 'var(--border)' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
            }}
          >
            Upload PDF
          </button>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Or paste a PDF URL below
          </p>
          <input
            type="text"
            onChange={(e) => handleUrlChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            className="mt-2 w-full seamless-block text-center"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
              background: 'transparent',
              border: 'none',
              outline: 'none',
            }}
            placeholder="Paste PDF URL here..."
          />
        </div>
      )}
      <DragHandle onDragStart={onDragStart} />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
};