import React, { useState } from 'react';
import { Block, BlockContent } from '@/types';
import { DragHandle } from '../DragHandle';
import { DeleteButton } from '../DeleteButton';

interface TableBlockProps {
  block: Block;
  onUpdate: (updates: Partial<{ type: Block['type']; content: Partial<BlockContent> }>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDelete: () => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  onUpdate,
  onFocus,
  onBlur,
  onDragStart,
  onDelete,
}) => {
  const [table, setTable] = useState<string[][]>(
    block.content.table || [
      ['Header 1', 'Header 2', 'Header 3'],
      ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
      ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
    ]
  );

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newTable = [...table];
    newTable[rowIndex][colIndex] = value;
    setTable(newTable);
    onUpdate({ content: { table: newTable } });
  };

  const addRow = () => {
    const newRow = new Array(table[0]?.length || 3).fill('');
    const newTable = [...table, newRow];
    setTable(newTable);
    onUpdate({ content: { table: newTable } });
  };

  const addColumn = () => {
    const newTable = table.map(row => [...row, '']);
    setTable(newTable);
    onUpdate({ content: { table: newTable } });
  };

  return (
    <div className="group relative seamless-block" style={{ padding: '0.75rem 0' }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {table.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className="border p-2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      onFocus={onFocus}
                      onBlur={onBlur}
                      className="w-full seamless-block"
                      style={{
                        color: 'var(--foreground)',
                        fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                      }}
                      placeholder={rowIndex === 0 ? `Header ${colIndex + 1}` : `Cell ${rowIndex}-${colIndex + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={addRow}
          className="px-3 py-1 text-sm rounded"
          style={{
            backgroundColor: 'var(--muted)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
          }}
        >
          Add Row
        </button>
        <button
          onClick={addColumn}
          className="px-3 py-1 text-sm rounded"
          style={{
            backgroundColor: 'var(--muted)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-work-sans), Arial, Helvetica, sans-serif',
          }}
        >
          Add Column
        </button>
      </div>
      <DragHandle onDragStart={onDragStart} />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
};