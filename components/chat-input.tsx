"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, PaperclipIcon, XIcon } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: any) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && files.length === 0) return;

    const content = {
      text: message.trim(),
      ...(files.length > 0 && { files }),
    };

    onSendMessage(content);
    setMessage('');
    setFiles([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        
        if (result.success) {
          setFiles(prev => [...prev, result.file]);
        }
      } catch (error) {
        console.error('File upload error:', error);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* File previews */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
            >
              <span className="truncate max-w-32">{file.name}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-gray-200"
                onClick={() => removeFile(index)}
              >
                <XIcon size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-12 max-h-32 resize-none pr-12"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          {/* File upload button */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-2 bottom-2 h-8 w-8 p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <PaperclipIcon size={16} />
          </Button>
        </div>

        <Button
          type="submit"
          disabled={(!message.trim() && files.length === 0) || disabled}
          className="h-12 px-4"
        >
          <SendIcon size={16} />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt,.md"
        onChange={handleFileUpload}
      />
    </form>
  );
}