import React from 'react';
import { Trash2 } from 'lucide-react';
import { DeleteButtonProps } from './types';

export const DeleteButton: React.FC<DeleteButtonProps> = ({ onDelete }) => (
  <button
    onClick={onDelete}
    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-opacity"
  >
    <Trash2 className="w-4 h-4" />
  </button>
);