import React from 'react';
import { Block, BlockContent } from '@/types';
import { DragHandle } from '../DragHandle';
import { DeleteButton } from '../DeleteButton';

interface VideoBlockProps {
  block: Block;
  onUpdate: (updates: Partial<{ type: Block['type']; content: Partial<BlockContent> }>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDelete: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  block,
  onUpdate,
  onFocus,
  onBlur,
  onDragStart,
  onDelete,
}) => {
  const handleUrlChange = (videoUrl: string) => {
    onUpdate({ content: { videoUrl } });
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="group relative seamless-block" style={{ padding: '0.75rem 0' }}>
      {block.content.videoUrl ? (
        <div className="space-y-2">
          <div className="aspect-video">
            <iframe
              src={getEmbedUrl(block.content.videoUrl)}
              className="w-full h-full rounded-lg"
              allowFullScreen
              title="Embedded video"
            />
          </div>
          <input
            type="text"
            value={block.content.videoUrl}
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
            placeholder="Video URL"
          />
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-8 text-center" style={{ borderColor: 'var(--border)' }}>
          <input
            type="text"
            onChange={(e) => handleUrlChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            className="w-full seamless-block text-center"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
              background: 'transparent',
              border: 'none',
              outline: 'none',
            }}
            placeholder="Paste YouTube or video URL here..."
          />
          <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Works with YouTube, Vimeo, and direct video links
          </p>
        </div>
      )}
      <DragHandle onDragStart={onDragStart} />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
};