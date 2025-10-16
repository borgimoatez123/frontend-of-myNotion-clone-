import React from 'react';
import { Block, BlockContent } from '@/types';
import { DragHandle } from '../DragHandle';
import { DeleteButton } from '../DeleteButton';

interface CodeBlockProps {
  block: Block;
  onUpdate: (updates: Partial<{ type: Block['type']; content: Partial<BlockContent> }>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDelete: () => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  onUpdate,
  onKeyDown,
  onFocus,
  onBlur,
  onDragStart,
  onDelete,
}) => {
  return (
    <div className="group relative">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono">
        <div className="flex items-center justify-between mb-2">
          <select
            value={block.content.language || 'javascript'}
            onChange={(e) => onUpdate({ content: { language: e.target.value } })}
            className="text-xs bg-transparent border rounded px-2 py-1"
            style={{
              color: 'var(--foreground)',
              borderColor: 'var(--border)',
            }}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        <textarea
          value={block.content.code || ''}
          onChange={(e) => onUpdate({ content: { code: e.target.value } })}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full bg-transparent border-none outline-none resize-none font-mono text-sm"
          style={{
            color: 'var(--foreground)',
            minHeight: '100px',
          }}
          placeholder="Enter your code..."
        />
      </div>
      <DragHandle onDragStart={onDragStart} />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
};