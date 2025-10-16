import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface ReorderButtonsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const ReorderButtons: React.FC<ReorderButtonsProps> = ({ 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown 
}) => (
  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-opacity">
    <button
      onClick={onMoveUp}
      disabled={!canMoveUp}
      className={`p-1 rounded transition-colors ${
        canMoveUp 
          ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-800' 
          : 'text-gray-300 cursor-not-allowed'
      }`}
      title="Move up"
    >
      <ChevronUp className="w-4 h-4" />
    </button>
    <button
      onClick={onMoveDown}
      disabled={!canMoveDown}
      className={`p-1 rounded transition-colors ${
        canMoveDown 
          ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-800' 
          : 'text-gray-300 cursor-not-allowed'
      }`}
      title="Move down"
    >
      <ChevronDown className="w-4 h-4" />
    </button>
  </div>
);