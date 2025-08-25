"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BotIcon, ZapIcon } from 'lucide-react';

interface ModelSelectionModalProps {
  open: boolean;
  onSelectModel: (model: 'openai/gpt-4o' | 'deepseek-chat') => void;
}

export function ModelSelectionModal({ open, onSelectModel }: ModelSelectionModalProps) {
  const [selectedModel, setSelectedModel] = useState<'openai/gpt-4o' | 'deepseek-chat' | null>(null);

  const models = [
    {
      id: 'openai/gpt-4o' as const,
      name: 'ChatGPT',
      description: 'GPT-4o - Advanced reasoning and creative tasks',
      icon: BotIcon,
      features: ['Advanced reasoning', 'Creative writing', 'Code generation', 'Image analysis'],
      color: 'bg-green-600',
    },
    {
      id: 'deepseek-chat' as const,
      name: 'DeepSeek',
      description: 'DeepSeek Chat - Fast and efficient AI assistant',
      icon: ZapIcon,
      features: ['Fast responses', 'Efficient processing', 'Code assistance', 'General chat'],
      color: 'bg-blue-600',
    },
  ];

  const handleSelectModel = (model: 'openai/gpt-4o' | 'deepseek-chat') => {
    setSelectedModel(model);
    onSelectModel(model);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Choose Your AI Assistant</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Select the AI model you'd like to chat with. You can change this later for each conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {models.map((model) => {
            const Icon = model.icon;
            const isSelected = selectedModel === model.id;
            
            return (
              <Card 
                key={model.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  isSelected 
                    ? 'border-blue-500 shadow-lg scale-105' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectModel(model.id)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${model.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  <CardTitle className="text-xl">{model.name}</CardTitle>
                  <CardDescription className="text-sm">{model.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {model.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className={`w-full mt-6 ${
                      isSelected 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                    onClick={() => handleSelectModel(model.id)}
                  >
                    {isSelected ? 'Selected' : 'Select'} {model.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>You can switch between models anytime using the dropdown in your chat interface.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}