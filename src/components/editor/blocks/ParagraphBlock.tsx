import React, { useRef, useEffect } from 'react';
import { Block, BlockContent } from '@/types';
import { DragHandle } from '../DragHandle';
import { DeleteButton } from '../DeleteButton';

interface ParagraphBlockProps {
  block: Block;
  currentText: string;
  onTextChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onUpdate: (updates: Partial<{ type: Block['type']; content: Partial<BlockContent> }>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDelete: () => void;
  isFocused: boolean;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  block,
  currentText,
  onTextChange,
  onKeyDown,
  onFocus,
  onBlur,
  onDragStart,
  onDelete,
  isFocused,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isFocused]);

  return (
    <div className="group relative seamless-block">
      <textarea
        ref={textareaRef}
        value={currentText}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full seamless-block resize-none min-h-[2.5rem]"
        style={{
          color: 'var(--foreground)',
          lineHeight: '1.6',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '0.75rem 0',
          fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
        }}
        placeholder="Type '/' for commands, or just start writing..."
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = target.scrollHeight + 'px';
        }}
      />
      <DragHandle onDragStart={onDragStart} />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
};