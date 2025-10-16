import React from 'react';
import { GripVertical } from 'lucide-react';
import { DragHandleProps } from './types';

export const DragHandle: React.FC<DragHandleProps> = ({ onDragStart }) => (
  <div
    draggable
    onDragStart={onDragStart}
    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 p-1 cursor-grab active:cursor-grabbing transition-opacity"
    style={{ color: 'var(--muted-foreground)' }}
  >
    <GripVertical className="w-4 h-4" />
  </div>
);