import React, { useEffect, useRef, useState } from 'react';

import { Cog6ToothIcon, EllipsisVerticalIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import logo from '@src/assets/t8d512.jpg';
import { useTaskLists } from '@src/Hooks/useTaskLists';

import NewListModal from './NewListModal';

type View = 'todolist' | 'settings';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ currentView, onNavigate, setSidebarOpen }: SidebarProps) => {
  const { taskLists, activeListId, setActiveListId, addTaskList, removeTaskList, updateTaskList, isLoading } =
    useTaskLists();
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingListId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingListId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStartEditing = (listId: string, currentName: string) => {
    setEditingListId(listId);
    setEditingValue(currentName);
    setActiveMenuId(null);
  };

  const handleCancelEditing = () => {
    setEditingListId(null);
    setEditingValue('');
  };

  const handleSaveEdit = () => {
    if (
      editingListId &&
      editingValue.trim() &&
      editingValue.trim() !== taskLists.find(l => l.id === editingListId)?.name
    ) {
      void updateTaskList(editingListId, { name: editingValue.trim() });
    }
    handleCancelEditing();
  };

  const handleSelectList = (listId: string) => {
    if (editingListId !== listId) {
      setActiveListId(listId);
      onNavigate('todolist');
    }
  };

  const handleAddNewList = (name: string) => {
    void addTaskList(name).then(newList => {
      if (newList) {
        onNavigate('todolist');
      }
    });
    setAddModalOpen(false);
  };

  const handleDeleteList = (listId: string) => {
    void removeTaskList(listId);
    setActiveMenuId(null);
  };

  const toggleMenu = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === listId ? null : listId);
  };

  return (
    <>
      <div className="h-full w-64 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="relative flex flex-col justify-center items-center bg-gradient-to-r from-sky-600 to-sky-500 dark:from-sky-700 dark:to-sky-600 text-white py-6 shadow-md">
          <button
            className="absolute top-2 right-2 p-2 text-sky-200 hover:text-white lg:hidden"
            onClick={() => {
              setSidebarOpen(false);
            }}
            aria-label="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <img src={logo} alt="T8D logo" className="h-16 w-16 mb-2 rounded-lg shadow-md object-cover" />
          <h1 className="text-xl font-bold">T8D</h1>
          <p className="text-sm text-sky-100 dark:text-sky-200">Task Manager</p>
        </div>

        {/* Task Lists */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              My Lists
            </h2>
            <button
              onClick={() => {
                setAddModalOpen(true);
              }}
              className="p-1 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 transition-colors"
              aria-label="Add new list"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <nav className="space-y-1">
            {isLoading ? (
              <p className="text-slate-500 dark:text-slate-400">Loading lists...</p>
            ) : (
              taskLists.map(list => (
                <div
                  key={list.id}
                  onDoubleClick={() => {
                    handleStartEditing(list.id, list.name);
                  }}
                  onClick={() => {
                    handleSelectList(list.id);
                  }}
                  className={`relative flex items-center justify-between w-full px-3 py-2 text-sm rounded-md font-medium transition-colors duration-150 group cursor-pointer ${
                    activeListId === list.id && currentView === 'todolist' && !editingListId
                      ? 'bg-sky-100 dark:bg-sky-700 text-sky-700 dark:text-sky-100'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {editingListId === list.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingValue}
                      onChange={e => {
                        setEditingValue(e.target.value);
                      }}
                      onBlur={handleSaveEdit}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEditing();
                      }}
                      onClick={e => {
                        e.stopPropagation();
                      }}
                      className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-sm -m-1 p-1"
                    />
                  ) : (
                    <>
                      <span className="truncate">{list.name}</span>
                      <button
                        onClick={e => {
                          toggleMenu(e, list.id);
                        }}
                        className="p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 lg:opacity-100"
                        aria-label="List options"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                      {activeMenuId === list.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 z-10 w-32 bg-white dark:bg-slate-900 rounded-md shadow-lg border border-slate-200 dark:border-slate-700"
                        >
                          <button
                            onClick={() => {
                              handleStartEditing(list.id, list.name);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Rename
                          </button>
                          {taskLists.length > 1 && (
                            <button
                              onClick={() => {
                                handleDeleteList(list.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </nav>
        </div>

        {/* Footer with Settings */}
        <div className="flex justify-between items-center p-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p>T8D v0.5.0</p>
          <button
            onClick={() => {
              onNavigate('settings');
            }}
            className={`p-1 rounded-full transition-colors ${
              currentView === 'settings'
                ? 'bg-sky-100 dark:bg-sky-700 text-sky-700 dark:text-sky-100'
                : 'text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400'
            }`}
            aria-label="Open settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <NewListModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setAddModalOpen(false);
        }}
        onSave={handleAddNewList}
      />
    </>
  );
};

export default Sidebar;
