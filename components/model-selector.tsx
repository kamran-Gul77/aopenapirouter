"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';

interface ModelSelectorProps {
  value: 'openai/gpt-4o' | 'deepseek/deepseek-chat';
  onChange: (model: 'openai/gpt-4o' | 'deepseek/deepseek-chat') => void;
}

const modelLabels = {
  'openai/gpt-4o': 'Switch to ChatGPT',
  'deepseek/deepseek-chat': 'Switch to DeepSeek',
};

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const currentLabel = value === 'openai/gpt-4o' ? 'ChatGPT' : 'DeepSeek';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 text-sm">
          Switch Model
          <ChevronDownIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onChange('openai/gpt-4o')}
          disabled={value === 'openai/gpt-4o'}
        >
          🤖 ChatGPT
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onChange('deepseek/deepseek-chat')}
          disabled={value === 'deepseek/deepseek-chat'}
        >
          ⚡ DeepSeek
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}