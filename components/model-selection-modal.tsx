"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { BotIcon, ZapIcon, XIcon } from 'lucide-react';

interface ModelSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectModel: (model: 'openai/gpt-4o' | 'deepseek/deepseek-chat') => void;
}

export function ModelSelectionModal({ open, onClose, onSelectModel }: ModelSelectionModalProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  const models = [
    {
      id: 'openai/gpt-4o' as const,
      name: 'ChatGPT',
      subtitle: 'By OpenAI',
      description: 'Great for most tasks',
      icon: BotIcon,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBorder: 'hover:border-green-400',
    },
    {
      id: 'deepseek/deepseek-chat' as const,
      name: 'DeepSeek',
      subtitle: 'By DeepSeek',
      description: 'Fast and efficient',
      icon: ZapIcon,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400',
    },
  ];

  const handleSelectModel = (model: 'openai/gpt-4o' | 'deepseek/deepseek-chat') => {
    onSelectModel(model);
    onClose();
  };

  return (
    <Dialog open={open}  onOpenChange={(open) => {
  if (!open) onClose();
}} >
      <DialogContent 
      
        className="max-w-md p-0 gap-0 bg-white rounded-2xl border-0 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        
        
      >
        {/* Header */}
        <div className="relative p-6 pb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Choose a bot
          </h2>
          <p className="text-sm text-gray-600">
            Select an AI assistant to start chatting
          </p>
        </div>

        {/* Models List */}
        <div className="px-6 pb-6 space-y-3">
          {models.map((model) => {
            const Icon = model.icon;
            const isHovered = hoveredModel === model.id;
            
            return (
              <div
                key={model.id}
                className={`
                  relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                  ${model.bgColor} ${model.borderColor} ${model.hoverBorder}
                  ${isHovered ? 'scale-[1.02] shadow-lg' : 'hover:shadow-md'}
                `}
                onClick={() => handleSelectModel(model.id)}
                onMouseEnter={() => setHoveredModel(model.id)}
                onMouseLeave={() => setHoveredModel(null)}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {model.name}
                      </h3>
                      <span className="text-xs text-gray-500 font-medium">
                        {model.subtitle}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {model.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200
                    ${isHovered ? 'bg-white shadow-sm' : 'bg-transparent'}
                  `}>
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 12 12" 
                      fill="none" 
                      className={`transition-colors duration-200 ${isHovered ? 'text-gray-700' : 'text-gray-400'}`}
                    >
                      <path 
                        d="M4.5 3L7.5 6L4.5 9" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 text-center">
            You can switch models anytime during your conversation
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}