'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/heysalad/sidebar';
import { ChatView } from '@/components/heysalad/chat-view';

export default function HomePage() {
  const [chats] = useState<Array<{ id: string; title: string }>>([]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar 
        chats={chats}
      />
      <main className="flex-1 min-w-0">
        <ChatView />
      </main>
    </div>
  );
}
