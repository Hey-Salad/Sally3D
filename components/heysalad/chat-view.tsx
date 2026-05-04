'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { LauncherIcon } from './launcher-icon';
import { ChatInput } from './chat-input';
import { ThinkingStates } from './thinking-states';
import { ModelViewer } from '@/components/viewer/model-viewer';
import { 
  Box, 
  Cpu,
  Wrench,
  Printer,
  Sparkles,
} from 'lucide-react';

interface ChatViewProps {
  onModelGenerated?: (modelData: any) => void;
}

// Tool result inline card
function ToolResult({ toolName, result }: { toolName: string; result: any }) {
  const getIcon = () => {
    switch (toolName) {
      case 'generate_enclosure':
      case 'generate_pcb_enclosure':
        return <Box className="w-4 h-4 text-coral" />;
      case 'modify_design':
        return <Wrench className="w-4 h-4 text-coral" />;
      case 'send_to_printer':
        return <Printer className="w-4 h-4 text-coral" />;
      case 'analyze_print_settings':
        return <Cpu className="w-4 h-4 text-coral" />;
      default:
        return <Sparkles className="w-4 h-4 text-coral" />;
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
    <div className="mt-3 p-4 bg-secondary/40 rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="text-sm font-medium">{getTitle()}</span>
      </div>
      
      {result.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
      )}
      
      {result.outerDimensions && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-background/60 rounded-md text-xs font-mono">
          <span className="text-muted-foreground">Dimensions:</span>
          <span className="text-foreground">{result.outerDimensions.length} × {result.outerDimensions.width} × {result.outerDimensions.height} mm</span>
        </div>
      )}
      
      {result.recommendations && (
        <ul className="mt-3 text-sm text-muted-foreground space-y-1.5">
          {result.recommendations.map((rec: string, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-coral mt-1">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      )}
      
      {result.templates && (
        <div className="mt-3 grid gap-2">
          {result.templates.slice(0, 4).map((t: any) => (
            <div key={t.id} className="text-sm p-3 bg-background/60 rounded-lg">
              <div className="font-medium mb-0.5">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.description.slice(0, 80)}{t.description.length > 80 ? '...' : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Inline 3D model viewer card
function ModelViewerCard({ modelData }: { modelData: any }) {
  if (!modelData) return null;
  return (
    <div className="mt-3 rounded-xl border border-border overflow-hidden bg-viewer-bg" style={{ height: '400px' }}>
      <ModelViewer 
        modelData={modelData}
        showGrid={true}
        showDimensions={true}
      />
    </div>
  );
}

const exampleQuestions = [
  'Create a 100×60×30mm enclosure for an Arduino Nano',
  'Design a Raspberry Pi 4 case with GPIO access',
  'PCB enclosure with USB-C cutout, 80×50mm',
  'Show me available enclosure templates',
];

export function ChatView({ onModelGenerated }: ChatViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [generatedModel, setGeneratedModel] = useState<any>(null);
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const hasMessages = messages.length > 0;

  // Process messages for model generation
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== 'assistant') return;

    for (const part of lastMessage.parts || []) {
      if (part.type === 'tool-invocation' && 'result' in part && part.state === 'result') {
        const toolName = part.toolName;
        if (toolName === 'generate_enclosure' || toolName === 'generate_pcb_enclosure') {
          const result = part.result as any;
          if (result?.success) {
            const params = result.parameters || result.enclosureParameters;
            if (params && result.outerDimensions) {
              const modelData = {
                type: 'box' as const,
                dimensions: result.outerDimensions,
                wallThickness: params.wallThickness,
              };
              setGeneratedModel(modelData);
              onModelGenerated?.(modelData);
            }
          }
        }
      }
    }
  }, [messages, onModelGenerated]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (text: string) => {
    sendMessage({ text });
  };

  const getMessageText = (parts: any[]): string => {
    return parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('') || '';
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Messages area or welcome */}
      <div className="flex-1 min-h-0 overflow-y-auto pt-6" ref={scrollRef}>
        {!hasMessages ? (
          <WelcomeScreen onExampleClick={handleSend} />
        ) : (
          <div className="max-w-3xl mx-auto px-6 pb-8 space-y-8">
            {messages.map((message) => {
              const isUser = message.role === 'user';
              const textContent = getMessageText(message.parts);
              
              if (isUser) {
                return (
                  <div key={message.id} className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                        You
                      </span>
                      <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-medium">
                        P
                      </div>
                    </div>
                    <div className="max-w-2xl rounded-2xl border border-coral/40 bg-coral-glow/30 px-5 py-3 text-foreground">
                      {textContent}
                    </div>
                  </div>
                );
              }

              return (
                <div key={message.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <LauncherIcon size={28} />
                    <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                      Sally
                    </span>
                  </div>
                  <div className="space-y-3">
                    {textContent && (
                      <div className="rounded-2xl border border-border bg-card px-5 py-4 text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {textContent}
                      </div>
                    )}
                    
                    {message.parts?.map((part, index) => {
                      if (part.type === 'tool-invocation' && 'toolName' in part) {
                        const toolName = part.toolName as string;
                        const state = 'state' in part ? part.state : undefined;
                        
                        if (state === 'result' && 'result' in part) {
                          const result = part.result as any;
                          const isModelTool = 
                            toolName === 'generate_enclosure' || 
                            toolName === 'generate_pcb_enclosure';
                          
                          return (
                            <div key={index} className="space-y-3">
                              <ToolResult toolName={toolName} result={result} />
                              {isModelTool && result?.success && result.outerDimensions && (
                                <ModelViewerCard 
                                  modelData={{
                                    type: 'box',
                                    dimensions: result.outerDimensions,
                                    wallThickness: (result.parameters || result.enclosureParameters)?.wallThickness,
                                  }}
                                />
                              )}
                            </div>
                          );
                        }
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <LauncherIcon size={28} />
                  <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Sally
                  </span>
                </div>
                <ThinkingStates 
                  active={true}
                  states={[
                    { id: 'thinking', label: 'thinking' },
                    { id: 'analyzing', label: 'analyzing your requirements' },
                    { id: 'designing', label: 'designing the enclosure' },
                    { id: 'finalizing', label: 'finalising the answer' },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-6 pb-6 pt-2 bg-background">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSend} isLoading={isLoading} />
          {!hasMessages && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              HeySalad can help with hardware design, 3D printing, and prototyping.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onExampleClick }: { onExampleClick: (text: string) => void }) {
  const greeting = getGreeting();

  return (
    <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-semibold text-foreground tracking-tight text-balance leading-tight mb-4">
          What can we get done {greeting}?
        </h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          Start with 3 free chats, move the work, and sign in when you&apos;re ready to save everything.
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center gap-3 pl-5 pr-1 py-1 rounded-full bg-coral-glow border border-coral/20">
          <span className="text-sm text-foreground/90">3 of 3 free chats left.</span>
          <button
            type="button"
            className="px-4 py-1.5 rounded-full bg-coral hover:bg-coral/90 text-white text-sm font-medium transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
        {exampleQuestions.map((q) => (
          <button
            key={q}
            onClick={() => onExampleClick(q)}
            className={cn(
              'text-left text-sm px-4 py-3 rounded-xl border border-border bg-card/50',
              'hover:bg-card hover:border-border/80 transition-colors',
              'text-foreground/80 hover:text-foreground'
            )}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const now = new Date();
  const hour = now.getHours();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  if (hour < 12) return `this ${day} morning`;
  if (hour < 17) return `this ${day} afternoon`;
  return `this ${day} evening`;
}
