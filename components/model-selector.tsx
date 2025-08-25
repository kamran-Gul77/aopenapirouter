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
  value: 'openai/gpt-4o' | 'deepseek-chat';
  onChange: (model: 'openai/gpt-4o' | 'deepseek-chat') => void;
}

const modelLabels = {
  'openai/gpt-4o': 'ChatGPT (GPT-4o)',
  'deepseek-chat': 'DeepSeek Chat',
};

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {modelLabels[value]}
          <ChevronDownIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange('openai/gpt-4o')}>
          ChatGPT (GPT-4o)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('deepseek-chat')}>
          DeepSeek Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}