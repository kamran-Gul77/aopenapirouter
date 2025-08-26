"use client";

import { useState, useEffect, useRef } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatInput } from './chat-input';
import { MessageList } from './message-list';
import { ModelSelector } from './model-selector';
import { BotIcon, PlusIcon, ZapIcon } from 'lucide-react';
import type { Chat, Message } from '@/lib/supabase';

interface ChatInterfaceProps {
  activeChat: Chat | null;
  onUpdateChat: (chat: Chat) => void;
  onNewChat: () => void;
}

export function ChatInterface({ activeChat, onUpdateChat, onNewChat }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (activeChat) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const loadMessages = async () => {
    if (!activeChat) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', activeChat.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
    } else {
      setMessages(data || []);
    }
  };

  const sendMessage = async (content: any) => {
    if (!activeChat) return;

    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Send message and stream response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChat.id,
          message: content,
          model: activeChat.model,
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setStreamingMessage(accumulatedText);
      }

      // Reload messages after streaming is complete
      await loadMessages();
      setStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatModel = async (model: 'openai/gpt-4o' | 'deepseek/deepseek-chat') => {
    if (!activeChat) return;

    // Instead of updating current chat, create a new chat with the selected model
    onNewChat();
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <BotIcon size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Welcome to AI Chat
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Choose an AI model and start chatting. You can switch between ChatGPT and DeepSeek anytime.
          </p>
          
          {/* Model Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* ChatGPT Card */}
            <div 
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl cursor-pointer transition-all duration-200 hover:border-green-400 hover:shadow-lg hover:scale-[1.02]"
              onClick={() => updateChatModel('openai/gpt-4o')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4">
                  <BotIcon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ChatGPT</h3>
                <p className="text-sm text-gray-600 mb-4">By OpenAI</p>
                <p className="text-xs text-gray-500 mb-4">Great for most tasks, creative writing, and complex reasoning</p>
                <div className="w-full">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:bg-green-700">
                    Start with ChatGPT
                  </Button>
                </div>
              </div>
            </div>

            {/* DeepSeek Card */}
            <div 
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02]"
              onClick={() => updateChatModel('deepseek/deepseek-chat')}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <ZapIcon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">DeepSeek</h3>
                <p className="text-sm text-gray-600 mb-4">By DeepSeek</p>
                <p className="text-xs text-gray-500 mb-4">Fast and efficient, excellent for coding and technical tasks</p>
                <div className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700">
                    Start with DeepSeek
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative button */}
          <div className="text-center">
            <Button 
              variant="outline"
              onClick={onNewChat}
              className="text-gray-600 hover:text-gray-800"
            >
              <PlusIcon size={16} className="mr-2" />
              Or choose from modal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {activeChat.title || 'Untitled Chat'}
          </h2>
          <p className="text-sm text-gray-500">
            {activeChat.model === 'openai/gpt-4o' ? '🤖 ChatGPT' : '⚡ DeepSeek'}
          </p>
        </div>
        <ModelSelector
          value={activeChat.model}
          onChange={updateChatModel}
        />
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <MessageList
          messages={messages}
          streamingMessage={streamingMessage}
          isLoading={isLoading}
        />
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}