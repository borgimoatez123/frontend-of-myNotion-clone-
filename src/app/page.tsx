'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Sidebar } from '@/components/layout/Sidebar';
import { BlockEditor } from '@/components/editor/BlockEditor';
import { Page } from '@/types';
import { pagesAPI } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, FileText } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showCreateSubPage, setShowCreateSubPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [sidebarKey, setSidebarKey] = useState(0);

  // Load pages when user is available
  useEffect(() => {
    if (user) {
      loadPages();
    }
  }, [user]);

  const loadPages = async () => {
    try {
      const pagesData = await pagesAPI.getAll();
      setPages(pagesData);
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  };

  const refreshSidebar = () => {
    setSidebarKey(prev => prev + 1);
    loadPages();
  };

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return;
    
    setCreating(true);
    try {
      const response = await pagesAPI.create({
        title: newPageTitle,
        parentId: null,
      });
      setSelectedPage(response.page);
      setPages(prev => [...prev, response.page]);
      setNewPageTitle('');
      setShowCreatePage(false);
      refreshSidebar();
    } catch (error) {
      console.error('Failed to create page:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSubPage = async () => {
    if (!newPageTitle.trim() || !selectedPage) return;
    
    setCreating(true);
    try {
      const response = await pagesAPI.create({
        title: newPageTitle,
        parentId: selectedPage._id,
      });
      setSelectedPage(response.page);
      setPages(prev => [...prev, response.page]);
      setNewPageTitle('');
      setShowCreateSubPage(false);
      refreshSidebar();
    } catch (error) {
      console.error('Failed to create sub-page:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePage = async () => {
    if (!selectedPage) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedPage.title}"?`);
    if (!confirmDelete) return;
    
    setDeleting(true);
    try {
      await pagesAPI.delete(selectedPage._id);
      setPages(prev => prev.filter(page => page._id !== selectedPage._id));
      setSelectedPage(null);
      refreshSidebar();
    } catch (error) {
      console.error('Failed to delete page:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleTitleDoubleClick = () => {
    if (selectedPage) {
      setEditingTitle(selectedPage.title);
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = async () => {
    if (!selectedPage || !editingTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      await pagesAPI.update(selectedPage._id, { title: editingTitle.trim() });
      
      // Update the selected page state
      const updatedPage = { ...selectedPage, title: editingTitle.trim() };
      setSelectedPage(updatedPage);
      
      // Update the pages array
      setPages(prev => prev.map(page => 
        page._id === selectedPage._id 
          ? { ...page, title: editingTitle.trim() }
          : page
      ));
      
      setIsEditingTitle(false);
      refreshSidebar();
    } catch (error) {
      console.error('Failed to update page title:', error);
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditingTitle('');
    }
  };

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page);
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundColor: 'var(--background)' }}
      >
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Sidebar
        key={sidebarKey}
        onPageSelect={handlePageSelect}
        selectedPageId={selectedPage?._id}
        onCreatePage={() => setShowCreatePage(true)}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedPage ? (
          <div className="flex-1 overflow-y-auto">
            <div 
              className="p-6 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="text-3xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 flex-1 mr-4"
                    style={{ 
                      color: 'var(--foreground)',
                      backgroundColor: 'var(--input)',
                    }}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                  />
                ) : (
                  <h1 
                    className="text-3xl font-bold cursor-pointer hover:bg-opacity-10 hover:bg-gray-500 rounded px-2 py-1 transition-colors"
                    style={{ color: 'var(--foreground)' }}
                    onDoubleClick={handleTitleDoubleClick}
                    title="Double-click to edit title"
                  >
                    {selectedPage.title}
                  </h1>
                )}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateSubPage(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Sub Page</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeletePage}
                    disabled={deleting}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deleting ? 'Deleting...' : 'Delete Page'}</span>
                  </Button>
                </div>
              </div>
              {selectedPage.coverUrl && (
                <img
                  src={selectedPage.coverUrl}
                  alt="Page cover"
                  className="w-full h-48 object-cover rounded-lg mt-4"
                />
              )}
            </div>
            <BlockEditor pageId={selectedPage._id} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 
                className="text-2xl font-semibold mb-4"
                style={{ color: 'var(--foreground)' }}
              >
                Welcome to your Notion Clone
              </h2>
              <p 
                className="mb-6"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Select a page from the sidebar or create a new one to get started.
              </p>
              <Button onClick={() => setShowCreatePage(true)}>
                Create Your First Page
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      {showCreatePage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-96"
            style={{ backgroundColor: 'var(--card)' }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Create New Page
            </h3>
            <Input
              type="text"
              placeholder="Page title"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              className="mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreatePage();
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreatePage(false);
                  setNewPageTitle('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePage}
                disabled={creating || !newPageTitle.trim()}
              >
                {creating ? 'Creating...' : 'Create Page'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sub Page Modal */}
      {showCreateSubPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="p-6 rounded-lg w-96"
            style={{ backgroundColor: 'var(--card)' }}
          >
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Create Sub Page
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ color: 'var(--muted-foreground)' }}
            >
              This will create a sub-page under "{selectedPage?.title}"
            </p>
            <Input
              type="text"
              placeholder="Sub-page title"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              className="mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateSubPage();
                }
              }}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateSubPage(false);
                  setNewPageTitle('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSubPage}
                disabled={creating || !newPageTitle.trim()}
              >
                {creating ? 'Creating...' : 'Create Sub Page'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
