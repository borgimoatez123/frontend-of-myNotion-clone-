import React from 'react';
import { SlashMenuProps } from './types';

export const SlashMenu: React.FC<SlashMenuProps> = ({
  show,
  position,
  commands,
  selectedIndex,
  onSelect,
}) => {
  if (!show) return null;

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-w-xs w-64"
      style={{
        left: position.x,
        top: position.y,
        borderColor: 'var(--border)',
        backgroundColor: 'var(--background)',
      }}
    >
      <div className="p-2 max-h-64 overflow-y-auto">
        {commands.map((command, index) => (
          <div
            key={command.id}
            onClick={() => onSelect(command)}
            className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
              index === selectedIndex ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex-shrink-0">{command.icon}</div>
            <div className="flex-1 min-w-0">
              <div 
                className="text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {command.label}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {command.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};