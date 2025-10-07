'use client';

import React, { useState, useEffect, useRef, KeyboardEvent, JSX } from 'react';
import { Block, BlockContent } from '@/types';
import { blocksAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, GripVertical, Type, Hash, CheckSquare, Code, Image, Video, Table, FileText } from 'lucide-react';

interface BlockEditorProps {
  pageId: string;
}

interface SlashCommand {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: Block['type'];
  description: string;
}

const slashCommands: SlashCommand[] = [
  { id: 'paragraph', label: 'Text', icon: <Type className="w-4 h-4" />, type: 'paragraph', description: 'Just start writing with plain text.' },
  { id: 'heading1', label: 'Heading 1', icon: <Hash className="w-4 h-4" />, type: 'heading', description: 'Big section heading.' },
  { id: 'heading2', label: 'Heading 2', icon: <Hash className="w-4 h-4" />, type: 'heading', description: 'Medium section heading.' },
  { id: 'heading3', label: 'Heading 3', icon: <Hash className="w-4 h-4" />, type: 'heading', description: 'Small section heading.' },
  { id: 'todo', label: 'To-do list', icon: <CheckSquare className="w-4 h-4" />, type: 'todo', description: 'Track tasks with a to-do list.' },
  { id: 'code', label: 'Code', icon: <Code className="w-4 h-4" />, type: 'code', description: 'Capture a code snippet.' },
  { id: 'image', label: 'Image', icon: <Image className="w-4 h-4" />, type: 'image', description: 'Upload or embed with a link.' },
  { id: 'video', label: 'Video', icon: <Video className="w-4 h-4" />, type: 'video', description: 'Embed a video.' },
  { id: 'table', label: 'Table', icon: <Table className="w-4 h-4" />, type: 'table', description: 'Create a table.' },
  { id: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" />, type: 'pdf', description: 'Upload a PDF file.' },
];

export const BlockEditor: React.FC<BlockEditorProps> = ({ pageId }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (pageId) {
      loadBlocks();
    }
  }, [pageId]);

  const loadBlocks = async () => {
    try {
      const blocksData = await blocksAPI.getByPageId(pageId);
      setBlocks(blocksData.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBlock = async (type: Block['type'], order?: number, content?: BlockContent, autoFocus = false) => {
    try {
      const newOrder = order ?? (blocks.length > 0 ? Math.max(...blocks.map(b => b.order)) + 1 : 1);
      const defaultContent: BlockContent = content ?? getDefaultContent(type);
      
      const response = await blocksAPI.create({
        pageId,
        type,
        order: newOrder,
        content: defaultContent,
      });
      
      setBlocks(prev => [...prev, response.block].sort((a, b) => a.order - b.order));
      
      if (autoFocus) {
        setTimeout(() => setFocusedBlockId(response.block._id), 100);
      }
      
      return response.block;
    } catch (error) {
      console.error('Failed to create block:', error);
    }
  };

  const updateBlock = async (blockId: string, updates: Partial<{ type: Block['type']; content: Partial<BlockContent> }>) => {
    try {
      if (updates.content) {
        await blocksAPI.update(blockId, { content: updates.content });
      }
      
      setBlocks(prev => prev.map(block => 
        block._id === blockId 
          ? { 
              ...block, 
              ...(updates.type && { type: updates.type }),
              content: { ...block.content, ...updates.content }
            }
          : block
      ));
    } catch (error) {
      console.error('Failed to update block:', error);
    }
  };

  const deleteBlock = async (blockId: string) => {
    try {
      await blocksAPI.delete(blockId);
      setBlocks(prev => prev.filter(block => block._id !== blockId));
      
      // Focus previous block if available
      const blockIndex = blocks.findIndex(b => b._id === blockId);
      if (blockIndex > 0) {
        setFocusedBlockId(blocks[blockIndex - 1]._id);
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  const reorderBlocks = async (draggedId: string, targetId: string, position: 'before' | 'after') => {
    const draggedIndex = blocks.findIndex(b => b._id === draggedId);
    const targetIndex = blocks.findIndex(b => b._id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    newBlocks.splice(insertIndex, 0, draggedBlock);

    // Update order values
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index + 1
    }));

    setBlocks(updatedBlocks);

    // Update order in backend
    try {
      await Promise.all(
        updatedBlocks.map(block => 
          blocksAPI.update(block._id, { content: { ...block.content } })
        )
      );
    } catch (error) {
      console.error('Failed to update block order:', error);
    }
  };

  const getDefaultContent = (type: Block['type'], headingLevel?: 1 | 2 | 3): BlockContent => {
    switch (type) {
      case 'paragraph':
        return { text: '' };
      case 'heading':
        return { text: '', headingLevel: headingLevel || 1 };
      case 'todo':
        return { text: '', checked: false };
      case 'code':
        return { code: '', language: 'javascript' };
      case 'image':
        return { url: '' };
      case 'video':
        return { videoUrl: '', autoplay: false };
      case 'table':
        return { table: [['Header 1', 'Header 2'], ['', '']] };
      case 'pdf':
        return { url: '' };
      default:
        return { text: '' };
    }
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string, position: 'before' | 'after') => {
    e.preventDefault();
    if (draggedBlock && draggedBlock !== targetId) {
      reorderBlocks(draggedBlock, targetId, position);
    }
    setDraggedBlock(null);
  };

  const handleNewBlockAtEnd = () => {
    createBlock('paragraph', undefined, undefined, true);
  };

  if (loading) {
    return (
      <div 
        className="p-8 text-center"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Loading blocks...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen">
      <div className="space-y-1">
        {blocks.map((block, index) => (
          <div
            key={block._id}
            className="relative group"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, block._id, 'before')}
          >
            <BlockComponent
              block={block}
              onUpdate={(updates) => updateBlock(block._id, updates)}
              onDelete={() => deleteBlock(block._id)}
              onCreateBlock={createBlock}
              onDragStart={(e) => handleDragStart(e, block._id)}
              isDragging={draggedBlock === block._id}
              isFocused={focusedBlockId === block._id}
              onFocus={() => setFocusedBlockId(block._id)}
              onBlur={() => setFocusedBlockId(null)}
            />
          </div>
        ))}
      </div>

      {/* Always show a new block at the end for continuous writing */}
      <div className="mt-2">
        <div
          onClick={handleNewBlockAtEnd}
          className="p-3 min-h-[2.5rem] cursor-text rounded transition-colors hover:bg-opacity-50"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--muted-foreground)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {blocks.length === 0 ? "Start writing..." : "Press 'Enter' to continue writing..."}
        </div>
      </div>
    </div>
  );
};

interface BlockComponentProps {
  block: Block;
  onUpdate: (updates: Partial<{ type: Block['type']; content: Partial<BlockContent> }>) => void;
  onDelete: () => void;
  onCreateBlock: (type: Block['type'], order?: number, content?: BlockContent, autoFocus?: boolean) => Promise<Block | undefined>;
  onDragStart: (e: React.DragEvent) => void;
  isDragging: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const BlockComponent: React.FC<BlockComponentProps> = ({ 
  block, 
  onUpdate, 
  onDelete, 
  onCreateBlock, 
  onDragStart, 
  isDragging,
  isFocused,
  onFocus,
  onBlur
}) => {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [filteredCommands, setFilteredCommands] = useState(slashCommands);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [currentText, setCurrentText] = useState(block.content.text || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentText(block.content.text || '');
  }, [block.content.text]);

  useEffect(() => {
    if (isFocused && (textareaRef.current || inputRef.current)) {
      const element = textareaRef.current || inputRef.current!;
      element.focus();
      // Move cursor to end
      element.setSelectionRange(element.value.length, element.value.length);
    }
  }, [isFocused]);

  const handleTextChange = (text: string) => {
    setCurrentText(text);
    
    // Auto-save on every change
    onUpdate({ content: { text } });
    
    // Check for slash command
    const lastSlashIndex = text.lastIndexOf('/');
    if (lastSlashIndex !== -1 && lastSlashIndex === text.length - 1) {
      // Show slash menu
      setShowSlashMenu(true);
      setFilteredCommands(slashCommands);
      setSelectedCommandIndex(0);
      
      // Position slash menu
      if (textareaRef.current || inputRef.current) {
        const element = textareaRef.current || inputRef.current!;
        const rect = element.getBoundingClientRect();
        setSlashMenuPosition({ x: rect.left, y: rect.bottom });
      }
    } else if (lastSlashIndex !== -1 && lastSlashIndex < text.length - 1) {
      // Filter commands based on text after slash
      const searchTerm = text.substring(lastSlashIndex + 1).toLowerCase();
      const filtered = slashCommands.filter(cmd => 
        cmd.label.toLowerCase().includes(searchTerm) ||
        cmd.description.toLowerCase().includes(searchTerm)
      );
      setFilteredCommands(filtered);
      setSelectedCommandIndex(0);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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
            // Create new paragraph block below and focus it
            onCreateBlock('paragraph', block.order + 1, undefined, true);
          }
          break;
        case 'Backspace':
          if (currentText === '' && block.type === 'paragraph') {
            e.preventDefault();
            onDelete();
          }
          break;
        case 'ArrowUp':
          // TODO: Focus previous block
          break;
        case 'ArrowDown':
          // TODO: Focus next block
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

  const getDefaultContentForType = (type: Block['type']): BlockContent => {
    switch (type) {
      case 'todo':
        return { checked: false };
      case 'code':
        return { code: '', language: 'javascript' };
      case 'image':
      case 'pdf':
        return { url: '' };
      case 'video':
        return { videoUrl: '', autoplay: false };
      case 'table':
        return { table: [['Header 1', 'Header 2'], ['', '']] };
      default:
        return {};
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a file storage service
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      onUpdate({ content: { url } });
    }
  };

  const renderBlock = () => {
    const commonProps = {
      onFocus,
      onBlur,
    };

    switch (block.type) {
      case 'paragraph':
        return (
          <div className="group relative">
            <textarea
              ref={textareaRef}
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border-none outline-none resize-none min-h-[2.5rem] bg-transparent transition-colors"
              style={{
                color: 'var(--foreground)',
                lineHeight: '1.6',
              }}
              placeholder="Type '/' for commands, or just start writing..."
              rows={1}
              onInput={(e) => {
                // Auto-resize textarea
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
              {...commonProps}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );

      case 'heading':
        const level = block.content.headingLevel || 1;
        const fontSize = level === 1 ? '2rem' : level === 2 ? '1.5rem' : '1.25rem';
        const fontWeight = level === 1 ? '700' : level === 2 ? '600' : '500';
        
        return (
          <div className="group relative">
            <input
              ref={inputRef}
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border-none outline-none bg-transparent transition-colors"
              style={{
                fontSize,
                fontWeight,
                color: 'var(--foreground)',
                lineHeight: '1.2',
              }}
              placeholder={`Heading ${level}`}
              {...commonProps}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );

      case 'todo':
        return (
          <div className="group relative flex items-start space-x-3 p-3">
            <input
              type="checkbox"
              checked={block.content.checked || false}
              onChange={(e) => onUpdate({ content: { checked: e.target.checked } })}
              className="w-4 h-4 flex-shrink-0 mt-1"
            />
            <input
              ref={inputRef}
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 border-none outline-none bg-transparent transition-colors ${
                block.content.checked ? 'line-through opacity-60' : ''
              }`}
              style={{
                color: 'var(--foreground)',
                lineHeight: '1.6',
              }}
              placeholder="To-do"
              {...commonProps}
            />
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );

      case 'code':
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
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none resize-none font-mono text-sm"
                style={{
                  color: 'var(--foreground)',
                  minHeight: '100px',
                }}
                placeholder="Enter your code..."
                {...commonProps}
              />
            </div>
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );

      // Add other block types with similar direct editing approach...
      default:
        return (
          <div className="group relative">
            <div className="p-3 text-gray-500">
              Block type "{block.type}" not implemented yet
            </div>
            <DragHandle onDragStart={onDragStart} />
            <DeleteButton onDelete={onDelete} />
          </div>
        );
    }
  };

  return (
    <>
      {renderBlock()}
      
      {/* Slash Command Menu */}
      {showSlashMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-w-xs w-64"
          style={{
            left: slashMenuPosition.x,
            top: slashMenuPosition.y,
            borderColor: 'var(--border)',
            backgroundColor: 'var(--background)',
          }}
        >
          <div className="p-2 max-h-64 overflow-y-auto">
            {filteredCommands.map((command, index) => (
              <div
                key={command.id}
                onClick={() => handleSlashCommand(command)}
                className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                  index === selectedCommandIndex ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={{
                  backgroundColor: index === selectedCommandIndex ? 'var(--accent)' : 'transparent',
                  color: 'var(--foreground)',
                }}
              >
                {command.icon}
                <div>
                  <div className="font-medium text-sm">{command.label}</div>
                  <div className="text-xs opacity-60">{command.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const DragHandle: React.FC<{ onDragStart: (e: React.DragEvent) => void }> = ({ onDragStart }) => (
  <div
    draggable
    onDragStart={onDragStart}
    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 p-1 cursor-grab active:cursor-grabbing transition-opacity"
    style={{ color: 'var(--muted-foreground)' }}
  >
    <GripVertical className="w-4 h-4" />
  </div>
);

const DeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <button
    onClick={onDelete}
    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-opacity"
  >
    <Trash2 className="w-4 h-4" />
  </button>
);