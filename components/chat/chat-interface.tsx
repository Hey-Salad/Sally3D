'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Box, 
  Cpu,
  Wrench,
  Printer,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  onModelGenerated?: (modelData: any) => void;
}

// Tool result display component
function ToolResult({ toolName, result }: { toolName: string; result: any }) {
  const getIcon = () => {
    switch (toolName) {
      case 'generate_enclosure':
      case 'generate_pcb_enclosure':
        return <Box className="w-4 h-4 text-primary" />;
      case 'modify_design':
        return <Wrench className="w-4 h-4 text-warning" />;
      case 'send_to_printer':
        return <Printer className="w-4 h-4 text-info" />;
      case 'analyze_print_settings':
        return <Cpu className="w-4 h-4 text-chart-2" />;
      default:
        return <Sparkles className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (toolName) {
      case 'generate_enclosure':
        return 'Enclosure Generated';
      case 'generate_pcb_enclosure':
        return 'PCB Enclosure Generated';
      case 'modify_design':
        return 'Design Modified';
      case 'send_to_printer':
        return 'Print Job Queued';
      case 'list_templates':
        return 'Available Templates';
      case 'analyze_print_settings':
        return 'Print Settings Analysis';
      default:
        return toolName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="text-sm font-medium">{getTitle()}</span>
      </div>
      
      {result.summary && (
        <p className="text-sm text-muted-foreground">{result.summary}</p>
      )}
      
      {result.outerDimensions && (
        <div className="mt-2 flex items-center gap-4 text-xs font-mono">
          <span className="text-muted-foreground">Outer:</span>
          <span>{result.outerDimensions.length} x {result.outerDimensions.width} x {result.outerDimensions.height} mm</span>
        </div>
      )}
      
      {result.recommendations && (
        <ul className="mt-2 text-xs text-muted-foreground space-y-1">
          {result.recommendations.map((rec: string, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      )}
      
      {result.templates && (
        <div className="mt-2 grid gap-2">
          {result.templates.slice(0, 4).map((t: any) => (
            <div key={t.id} className="text-xs p-2 bg-background/50 rounded border border-border/50">
              <span className="font-medium">{t.name}</span>
              <span className="text-muted-foreground ml-2">{t.description.slice(0, 60)}...</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Quick action suggestions
const quickActions = [
  { label: 'Create basic enclosure', prompt: 'Create a basic enclosure 100x60x30mm with snap-fit lid' },
  { label: 'Raspberry Pi case', prompt: 'Design an enclosure for a Raspberry Pi 4 with GPIO access' },
  { label: 'PCB enclosure', prompt: 'I need an enclosure for a custom PCB that is 80x50mm with USB-C on one side' },
  { label: 'Show templates', prompt: 'What enclosure templates are available?' },
];

export function ChatInterface({ onModelGenerated }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Process messages for model generation callback
  useEffect(() => {
    if (!onModelGenerated) return;
    
    const lastMessage = messages[messages.length - 1];
    console.log('[v0] Last message:', lastMessage?.role, lastMessage?.parts?.length, 'parts');
    if (lastMessage?.role !== 'assistant') return;

    for (const part of lastMessage.parts || []) {
      console.log('[v0] Part type:', part.type, 'state' in part ? part.state : 'no-state');
      // AI SDK 6 tool parts have type 'tool-invocation' with toolName and result
      if (part.type === 'tool-invocation' && 'result' in part && part.state === 'result') {
        const toolName = part.toolName;
        console.log('[v0] Tool invocation result:', toolName, part.result);
        if (toolName === 'generate_enclosure' || toolName === 'generate_pcb_enclosure') {
          const result = part.result as any;
          if (result?.success) {
            const params = result.parameters || result.enclosureParameters;
            console.log('[v0] Params:', params, 'outerDimensions:', result.outerDimensions);
            if (params && result.outerDimensions) {
              onModelGenerated({
                type: 'box',
                dimensions: result.outerDimensions,
                wallThickness: params.wallThickness,
              });
            }
          }
        }
      }
    }
  }, [messages, onModelGenerated]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue });
    setInputValue('');
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  // Helper to extract text from parts
  const getMessageText = (parts: any[]): string => {
    return parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('') || '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">ProtoForge AI</h2>
            <p className="text-xs text-muted-foreground">Hardware Design Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="divide-y divide-border/50">
          {messages.length === 0 ? (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Box className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">Design Your Enclosure</h3>
                <p className="text-sm text-muted-foreground">
                  Describe what you need and I&apos;ll help you create it
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Quick Actions
                </p>
                <div className="grid gap-2">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="text-left text-sm p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === 'user';
              const textContent = getMessageText(message.parts);
              
              return (
                <div 
                  key={message.id}
                  className={cn(
                    'flex gap-3 p-4',
                    isUser ? 'bg-transparent' : 'bg-muted/30'
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {isUser ? 'You' : 'ProtoForge AI'}
                      </span>
                    </div>
                    
                    {textContent && (
                      <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {textContent}
                      </div>
                    )}
                    
                    {/* Render tool results */}
                    {message.parts?.map((part, index) => {
                      // AI SDK 6 uses 'tool-invocation' type with toolName property
                      if (part.type === 'tool-invocation' && 'toolName' in part) {
                        const toolName = part.toolName as string;
                        const state = 'state' in part ? part.state : undefined;
                        
                        if (state === 'result' && 'result' in part) {
                          return (
                            <ToolResult 
                              key={index}
                              toolName={toolName} 
                              result={part.result} 
                            />
                          );
                        }
                        if (state === 'call' || state === 'partial-call') {
                          return (
                            <div key={index} className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Executing {toolName.replace(/_/g, ' ')}...</span>
                            </div>
                          );
                        }
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })
          )}
          
          {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3 p-4 bg-muted/30">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">ProtoForge AI</span>
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground">Thinking...</div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your enclosure or PCB requirements..."
            className="flex-1 bg-muted border-border"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !inputValue.trim()}
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
