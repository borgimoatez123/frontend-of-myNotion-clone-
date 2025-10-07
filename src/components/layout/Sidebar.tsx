'use client';

import React, { useState, useEffect } from 'react';
import { Page } from '@/types';
import { pagesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Plus, FileText, Settings, LogOut, Trash2 } from 'lucide-react';

interface SidebarProps {
  onPageSelect: (page: Page) => void;
  selectedPageId?: string;
  onCreatePage: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onPageSelect,
  selectedPageId,
  onCreatePage,
}) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    pageId: string;
  }>({ show: false, x: 0, y: 0, pageId: '' });
  const { user, logout } = useAuth();

  useEffect(() => {
    loadPages();
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, pageId: '' });
    };

    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.show]);

  const loadPages = async () => {
    try {
      const pagesData = await pagesAPI.getAll();
      setPages(pagesData);
    } catch (error) {
      console.error('Failed to load pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async (pageId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        await pagesAPI.delete(pageId);
        setPages(pages.filter(p => p._id !== pageId));
        setContextMenu({ show: false, x: 0, y: 0, pageId: '' });
      } catch (error) {
        console.error('Failed to delete page:', error);
      }
    }
  };

  const handleRightClick = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      pageId: pageId,
    });
  };

  return (
    <div 
      className="w-64 border-r flex flex-col h-screen relative"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      {/* User Info */}
      <div 
        className="p-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p 
              className="font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              {user?.name}
            </p>
            <p 
              className="text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {user?.email}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="p-2"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pages Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              Pages
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreatePage}
              className="p-1"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div 
              className="text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Loading pages...
            </div>
          ) : pages.length === 0 ? (
            <div 
              className="text-sm"
              style={{ color: 'var(--muted-foreground)' }}
            >
              No pages yet
            </div>
          ) : (
            <div className="space-y-1">
              {pages.map((page) => (
                <div
                  key={page._id}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:opacity-80 transition-colors ${
                    selectedPageId === page._id ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: selectedPageId === page._id ? 'var(--accent)' : 'transparent',
                    ringColor: selectedPageId === page._id ? 'var(--primary)' : 'transparent',
                  }}
                  onClick={() => onPageSelect(page)}
                  onContextMenu={(e) => handleRightClick(e, page._id)}
                  onMouseEnter={(e) => {
                    if (selectedPageId !== page._id) {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPageId !== page._id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {page.iconUrl ? (
                      <img src={page.iconUrl} alt="" className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <FileText 
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: 'var(--muted-foreground)' }}
                      />
                    )}
                    <span 
                      className="text-sm truncate"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {page.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDeletePage(page._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-600 transition-opacity"
                    style={{
                      color: '#ef4444',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed z-50 py-1 rounded-md shadow-lg border"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <button
            onClick={() => handleDeletePage(contextMenu.pageId)}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:opacity-80 transition-colors"
            style={{
              color: '#ef4444',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Page</span>
          </button>
        </div>
      )}
    </div>
  );
};