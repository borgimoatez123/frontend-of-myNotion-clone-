import React, { useRef, useEffect } from 'react';
import { Block, BlockContent } from '@/types';
import { DragHandle } from '../DragHandle';
import { DeleteButton } from '../DeleteButton';

interface TodoBlockProps {
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

export const TodoBlock: React.FC<TodoBlockProps> = ({
  block,
  currentText,
  onTextChange,
  onKeyDown,
  onUpdate,
  onFocus,
  onBlur,
  onDragStart,
  onDelete,
  isFocused,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div className="group relative flex items-start gap-2 seamless-block" style={{ padding: '0.75rem 0' }}>
      <input
        type="checkbox"
        checked={block.content.checked || false}
        onChange={(e) => onUpdate({ content: { checked: e.target.checked } })}
        className="mt-1 rounded"
        style={{
          accentColor: 'var(--primary)',
          background: 'transparent',
        }}
      />
      <input
        ref={inputRef}
        type="text"
        value={currentText}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className="flex-1 seamless-block"
        style={{
          color: 'var(--foreground)',
          textDecoration: block.content.checked ? 'line-through' : 'none',
          opacity: block.content.checked ? 0.6 : 1,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
        }}
        placeholder="To-do"
      />
      <DragHandle onDragStart={onDragStart} />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
};