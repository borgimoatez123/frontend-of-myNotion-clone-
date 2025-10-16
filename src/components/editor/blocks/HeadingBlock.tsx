import React, { useRef, useEffect } from 'react';
import { Block, BlockContent } from '@/types';
import { DragHandle } from '../DragHandle';
import { DeleteButton } from '../DeleteButton';

interface HeadingBlockProps {
  block: Block;
  currentText: string;
  onTextChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onUpdate: (updates: Partial<{ type: Block['type']; content: Partial<BlockContent> }>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDelete: () => void;
  isFocused: boolean;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
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
  const inputRef = useRef<HTMLInputElement>(null);
  const level = block.content.headingLevel || 1;
  const fontSize = level === 1 ? '32px' : level === 2 ? '24px' : '20px';
  const fontWeight = level === 1 ? '700' : level === 2 ? '600' : '500';

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [isFocused]);

  return (
    <div className="group relative seamless-block">
      <input
        ref={inputRef}
        value={currentText}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full seamless-block"
        style={{
          color: 'var(--foreground)',
          fontSize,
          fontWeight,
          lineHeight: '1.2',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          padding: '0.75rem 0',
          fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
        }}
        placeholder={`Heading ${level}`}
      />
      <DragHandle onDragStart={onDragStart} />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
};