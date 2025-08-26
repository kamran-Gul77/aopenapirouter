"use client";

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatInterface } from '@/components/chat-interface';
import { ModelSelectionModal } from '@/components/model-selection-modal';
import type { Chat } from '@/lib/supabase';

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModelSelection, setShowModelSelection] = useState(false);
  const supabase = createSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);
      await loadChats();
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth');
        } else if (session) {
          setUser(session.user);
          loadChats();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        setChats(data);
        
        // Don't auto-show modal anymore - let user trigger it
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async (model: 'openai/gpt-4o' | 'deepseek/deepseek-chat') => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        setActiveChat(newChat);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleNewChatClick = () => {
    setShowModelSelection(true);
  };

  const handleModelSelection = async (model: 'openai/gpt-4o' | 'deepseek/deepseek-chat') => {
    await createNewChat(model);
  };
  const handleCloseModal = () => {
    setShowModelSelection(false);
  };
  const renameChat = async (id: string, title: string) => {

    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (response.ok) {
        const updatedChat = await response.json();
        setChats(prev => prev.map(chat => 
          chat.id === id ? updatedChat : chat
        ));
        if (activeChat?.id === id) {
          setActiveChat(updatedChat);
        }
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const deleteChat = async (id: string) => {
    try {
      const response = await fetch(`/api/chats/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChats(prev => prev.filter(chat => chat.id !== id));
        if (activeChat?.id === id) {
          setActiveChat(null);
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleUpdateChat = (updatedChat: Chat) => {
    setChats(prev => prev.map(chat => 
      chat.id === updatedChat.id ? updatedChat : chat
    ));
    setActiveChat(updatedChat);
  };

  if (isLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <ModelSelectionModal
        open={showModelSelection}
        onClose={handleCloseModal}
        onSelectModel={handleModelSelection}
        
      />
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        onNewChat={handleNewChatClick}
        onSelectChat={setActiveChat}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
      />
      <ChatInterface
        activeChat={activeChat}
        onUpdateChat={handleUpdateChat}
        onNewChat={handleNewChatClick}
      />
    </div>
  );
}