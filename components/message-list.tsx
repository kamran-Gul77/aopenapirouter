"use client";

import { cn } from '@/lib/utils';
import type { Message } from '@/lib/supabase';
import { UserIcon, BotIcon, CopyIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface MessageListProps {
  messages: Message[];
  streamingMessage?: string;
  isLoading?: boolean;
  isThinking?: boolean;
}

export function MessageList({ messages, streamingMessage, isLoading, isThinking }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {/* Thinking state */}
      {isThinking && !streamingMessage && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <BotIcon size={16} className="text-white" />
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-sm text-gray-600 font-medium">
                AI is thinking...
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Streaming response */}
      {streamingMessage && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <BotIcon size={16} className="text-white" />
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-4">
            <div className="prose prose-sm max-w-none">
              {streamingMessage}
              <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

  const isUser = message.role === 'user';
   const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500); // reset after 1.5s
  };
  return (
    <div className={cn(
      "flex gap-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <BotIcon size={16} className="text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[70%] rounded-lg p-4",
        isUser 
          ? "bg-blue-600 text-white" 
          : "bg-gray-50 text-gray-900"
      )}>
        <div className="prose prose-sm max-w-none">
          {typeof message.content === 'string' 
            ? message.content 
            : message.content.text
          }
          
          {/* Render files if present */}
          {typeof message.content === 'object' && message.content.files && (
            <div className="mt-3 space-y-2">
              {message.content.files.map((file, index) => (
                <div key={index} className="border rounded p-2 bg-white/50">
                  {file.type.startsWith('image/') ? (
                    <Image
                      src={file.url} 
                      alt={file.name}
                      className="max-w-full h-auto rounded"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      📎 {file.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
<div className="flex justify-end mt-2">
              <button
                onClick={() => copyToClipboard(message?.content?.text ?? "" , "streaming")}
                className={` flex items-center gap-1 ${isUser ? "text-white":"text-gray-500 hover:text-gray" }-800 text-sm`}
              >
                <CopyIcon size={16} />
                {copiedId === "streaming" ? "Copied!" : "Copy"}
              </button>
            </div>      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
          <UserIcon size={16} className="text-white" />
        </div>
      )}
    </div>
  );
}