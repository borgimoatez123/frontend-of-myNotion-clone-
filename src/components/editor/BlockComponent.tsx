'use client';

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Block } from '@/types';
import { BlockComponentProps, SlashCommand } from './types';
import { slashCommands } from './slashCommands';
import { getDefaultContentForType } from './utils';
import { SlashMenu } from './SlashMenu';
import { ParagraphBlock } from './blocks/ParagraphBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { TodoBlock } from './blocks/TodoBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { PdfBlock } from './blocks/PdfBlock';
import { TableBlock } from './blocks/TableBlock';
import { DragHandle } from './DragHandle';
import { DeleteButton } from './DeleteButton';
import { ReorderButtons } from './ReorderButtons';

export const BlockComponent: React.FC<BlockComponentProps> = ({ 
  block, 
  onUpdate, 
  onDelete, 
  onCreateBlock, 
  onDragStart, 
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isDragging,
  isFocused,
  onFocus,
  onBlur
}) => {
  const [currentText, setCurrentText] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [filteredCommands, setFilteredCommands] = useState<SlashCommand[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  useEffect(() => {
    if (block.content?.text) {
      setCurrentText(block.content.text);
    }
  }, [block.content?.text]);

  const handleTextChange = (text: string) => {
    setCurrentText(text);
    
    const lastSlashIndex = text.lastIndexOf('/');
    if (lastSlashIndex !== -1 && lastSlashIndex === text.length - 1) {
      setShowSlashMenu(true);
      setFilteredCommands(slashCommands);
      setSelectedCommandIndex(0);
    } else if (lastSlashIndex !== -1 && text.substring(lastSlashIndex).includes('/')) {
      const searchTerm = text.substring(lastSlashIndex + 1).toLowerCase();
      const filtered = slashCommands.filter(cmd => 
        cmd.label.toLowerCase().includes(searchTerm) || 
        cmd.id.toLowerCase().includes(searchTerm)
      );
      
      if (filtered.length > 0) {
        setFilteredCommands(filtered);
        setSelectedCommandIndex(0);
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    } else {
      setShowSlashMenu(false);
    }
    
    onUpdate({ content: { text } });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showSlashMenu) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedCommandIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedCommandIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          handleSlashCommand(filteredCommands[selectedCommandIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          setShowSlashMenu(false);
          break;
      }
    } else {
      switch (e.key) {
        case 'Enter':
          if (!e.shiftKey) {
            e.preventDefault();
            onCreateBlock('paragraph', block.order + 1, undefined, true);
          }
          break;
        case 'Backspace':
          if (currentText === '' && block.type === 'paragraph') {
            e.preventDefault();
            onDelete();
          }
          break;
      }
    }
  };

  const handleSlashCommand = (command: SlashCommand) => {
    const lastSlashIndex = currentText.lastIndexOf('/');
    const textBeforeSlash = currentText.substring(0, lastSlashIndex);
    
    setShowSlashMenu(false);
    
    if (command.type === 'heading') {
      const headingLevel = command.id === 'heading1' ? 1 : command.id === 'heading2' ? 2 : 3;
      onUpdate({ 
        type: 'heading', 
        content: { text: textBeforeSlash, headingLevel } 
      });
    } else {
      onUpdate({ 
        type: command.type, 
        content: { ...getDefaultContentForType(command.type), text: textBeforeSlash } 
      });
    }
    
    setCurrentText(textBeforeSlash);
  };

  const renderBlock = () => {
    const commonProps = {
      block,
      currentText,
      onTextChange: handleTextChange,
      onKeyDown: handleKeyDown,
      onFocus,
      onBlur,
      onDragStart,
      onDelete,
      isFocused,
    };

    const updateProps = {
      block,
      onUpdate,
      onFocus,
      onBlur,
      onDragStart,
      onDelete,
    };

    switch (block.type) {
      case 'paragraph':
        return (
          <div className="group relative">
            <ParagraphBlock {...commonProps} onUpdate={onUpdate} />
            <ReorderButtons 
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
      
      case 'heading':
        return (
          <div className="group relative">
            <HeadingBlock {...commonProps} onUpdate={onUpdate} />
            <ReorderButtons 
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
      
      case 'todo':
        return (
          <div className="group relative">
            <TodoBlock {...commonProps} onUpdate={onUpdate} />
            <ReorderButtons 
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
      
      case 'code':
        return (
          <div className="group relative">
            <CodeBlock {...commonProps} onUpdate={onUpdate} />
            <ReorderButtons 
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
      
      case 'image':
        return (
          <div className="group relative">
            <ImageBlock {...updateProps} />
            <ReorderButtons 
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
      
      case 'video':
        return (
          <div className="group relative">
            <VideoBlock {...updateProps} />
            <ReorderButtons 
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="group relative">
            <PdfBlock {...updateProps} />
            <ReorderButtons 
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
      
      case 'table':
        return (
          <div className="group relative">
            <TableBlock {...updateProps} />
            <ReorderButtons 
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
      
      default:
        return (
          <div className="group relative">
            <div className="p-3 text-gray-500">
              Block type "{block.type}" not implemented yet
            </div>
            <ReorderButtons 
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
    }
  };

  return (
    <>
      {renderBlock()}
      <SlashMenu
        show={showSlashMenu}
        position={slashMenuPosition}
        commands={filteredCommands}
        selectedIndex={selectedCommandIndex}
        onSelect={handleSlashCommand}
      />
    </>
  );
};