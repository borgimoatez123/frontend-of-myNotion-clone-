'use client';

import React, { useState, useEffect } from 'react';
import { Block } from '@/types';
import { blocksAPI } from '@/lib/api';
import { BlockEditorProps } from './types';
import { getDefaultContent } from './utils';
import { BlockComponent } from './BlockComponent';

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

  const createBlock = async (type: Block['type'], order?: number, content?: any, autoFocus = false) => {
    try {
      const newOrder = order ?? (blocks.length > 0 ? Math.max(...blocks.map(b => b.order)) + 1 : 1);
      const defaultContent = content ?? getDefaultContent(type);
      
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
      // Send both type and content to the backend
      const updateData: { type?: Block['type']; content?: Partial<BlockContent> } = {};
      
      if (updates.type) {
        updateData.type = updates.type;
      }
      
      if (updates.content) {
        updateData.content = updates.content;
      }
      
      await blocksAPI.update(blockId, updateData);
      
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

  const reorderBlock = async (blockId: string, newOrder: number) => {
    try {
      await blocksAPI.update(blockId, { order: newOrder });
      
      setBlocks(prev => prev.map(block => 
        block._id === blockId 
          ? { ...block, order: newOrder }
          : block
      ).sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to reorder block:', error);
    }
  };

  const moveBlockUp = (blockId: string) => {
    const currentIndex = blocks.findIndex(b => b._id === blockId);
    if (currentIndex > 0) {
      const currentBlock = blocks[currentIndex];
      const previousBlock = blocks[currentIndex - 1];
      
      // Swap orders
      reorderBlock(currentBlock._id, previousBlock.order);
      reorderBlock(previousBlock._id, currentBlock.order);
    }
  };

  const moveBlockDown = (blockId: string) => {
    const currentIndex = blocks.findIndex(b => b._id === blockId);
    if (currentIndex < blocks.length - 1) {
      const currentBlock = blocks[currentIndex];
      const nextBlock = blocks[currentIndex + 1];
      
      // Swap orders
      reorderBlock(currentBlock._id, nextBlock.order);
      reorderBlock(nextBlock._id, currentBlock.order);
    }
  };

  const deleteBlock = async (blockId: string) => {
    try {
      await blocksAPI.delete(blockId);
      setBlocks(prev => prev.filter(block => block._id !== blockId));
      
      const blockIndex = blocks.findIndex(b => b._id === blockId);
      if (blockIndex > 0) {
        setFocusedBlockId(blocks[blockIndex - 1]._id);
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
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
      // Implement reorder logic here
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
              onMoveUp={() => moveBlockUp(block._id)}
              onMoveDown={() => moveBlockDown(block._id)}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
              isDragging={draggedBlock === block._id}
              isFocused={focusedBlockId === block._id}
              onFocus={() => setFocusedBlockId(block._id)}
              onBlur={() => setFocusedBlockId(null)}
            />
          </div>
        ))}
      </div>

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
          Press 'Enter' to continue writing...
        </div>
      </div>
    </div>
  );
};