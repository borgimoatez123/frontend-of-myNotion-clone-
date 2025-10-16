import React from 'react';
import { Block, BlockContent } from '@/types';

export interface BlockEditorProps {
  pageId: string;
}

export interface SlashCommand {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: Block['type'];
  description: string;
}

export interface BlockComponentProps {
  block: Block;
  onUpdate: (updates: Partial<{ type: Block['type']; content: Partial<BlockContent> }>) => void;
  onDelete: () => void;
  onCreateBlock: (type: Block['type'], order?: number, content?: BlockContent, autoFocus?: boolean) => Promise<Block | undefined>;
  onDragStart: (e: React.DragEvent) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isDragging: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

export interface SlashMenuProps {
  show: boolean;
  position: { x: number; y: number };
  commands: SlashCommand[];
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
}

export interface DragHandleProps {
  onDragStart: (e: React.DragEvent) => void;
}

export interface DeleteButtonProps {
  onDelete: () => void;
}