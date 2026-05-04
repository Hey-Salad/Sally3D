'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { HeySaladLogo } from './logo';
import { LauncherIcon } from './launcher-icon';
import { UserFooter } from './user-footer';
import { 
  Plus,
  Search,
  Grid3x3,
  Telescope,
  FolderPlus,
  Settings,
  PanelLeftClose,
  MessageSquare,
  Box,
  Printer,
} from 'lucide-react';

interface SidebarProps {
  onNewChat?: () => void;
  activeChatId?: string;
  chats?: Array<{ id: string; title: string }>;
}

const navItems = [
  { id: 'new', label: 'New chat', icon: Plus, primary: true },
  { id: 'search', label: 'Search chats', icon: Search },
  { id: 'models', label: '3D Models', icon: Box },
  { id: 'templates', label: 'Templates', icon: Grid3x3 },
  { id: 'printers', label: 'Printers', icon: Printer },
  { id: 'research', label: 'Deep research', icon: Telescope },
];

export function Sidebar({ 
  onNewChat,
  activeChatId,
  chats = [],
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="w-14 h-screen bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-2 flex-shrink-0">
        <button
          onClick={() => setCollapsed(false)}
          className="rounded-lg hover:opacity-80 transition-opacity mb-2"
          aria-label="Expand sidebar"
        >
          <LauncherIcon size={36} />
        </button>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.id === 'new' ? onNewChat : undefined}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground"
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground/80 hover:text-sidebar-foreground"
          aria-label="Personal Config"
          title="Personal Config"
        >
          <Settings className="w-5 h-5" />
        </button>
        <UserFooter collapsed />
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col flex-shrink-0">
      {/* Logo header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <HeySaladLogo size={96} className="h-24 w-auto" />
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground/60 hover:text-sidebar-foreground"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-2 flex flex-col gap-0.5 flex-shrink-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = false;
          return (
            <button
              key={item.id}
              onClick={item.id === 'new' ? onNewChat : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                isActive && 'bg-sidebar-accent text-sidebar-foreground'
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Projects */}
      <div className="px-2 mt-6 flex-shrink-0">
        <h3 className="px-3 text-xs text-sidebar-foreground/50 mb-1">Projects</h3>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <FolderPlus className="w-[18px] h-[18px] flex-shrink-0" />
          <span>New project</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground">
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          <span>Personal Config</span>
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 mt-6 pb-4">
        <h3 className="px-3 text-xs text-sidebar-foreground/50 mb-2">Your chats</h3>
        {chats.length === 0 ? (
          <p className="px-3 text-xs text-sidebar-foreground/40">No chats yet</p>
        ) : (
          <div className="space-y-0.5">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                  activeChatId === chat.id
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                )}
              >
                <MessageSquare className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="truncate">{chat.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User footer */}
      <UserFooter />
    </aside>
  );
}
