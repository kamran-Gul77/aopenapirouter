"use client";

import { cn } from '@/lib/utils';
import type { Message } from '@/lib/supabase';
import { UserIcon, BotIcon, CopyIcon, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <StreamingMessageBubble message={streamingMessage} />
      )}
    </div>
  );
}

function StreamingMessageBubble({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="group flex gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        <BotIcon size={16} className="text-white" />
      </div>
      <div className="flex-1 relative">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="prose prose-sm max-w-none">
            {message}
            <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse" />
          </div>
        </div>
        
        {/* Copy button for streaming message */}
        {message && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white shadow-sm"
            onClick={handleCopy}
          >
            {copied ? (
              <CheckIcon size={14} className="text-green-600" />
            ) : (
              <CopyIcon size={14} className="text-gray-600" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  
  const getMessageText = () => {
    if (typeof message.content === 'string') {
      return message.content;
    }
    return message.content.text || '';
  };

  const handleCopy = async () => {
    try {
      const textToCopy = getMessageText();
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  return (
    <div className={cn(
      "group flex gap-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <BotIcon size={16} className="text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[70%] rounded-lg p-4 relative",
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
                    <img 
                      src={file.url} 
                      alt={file.name}
                      className="max-w-full h-auto rounded"
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
        
        {/* Copy button */}
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm",
            isUser 
              ? "bg-blue-500/20 hover:bg-blue-500/30 text-white" 
              : "bg-white/80 hover:bg-white text-gray-600"
          )}
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon size={14} className={isUser ? "text-white" : "text-green-600"} />
          ) : (
            <CopyIcon size={14} />
          )}
        </Button>
      </div>
      
      {isUser && (
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