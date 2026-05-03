'use client';

import { useState } from 'react';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from '@/components/ui/resizable';
import { ChatInterface } from '@/components/chat/chat-interface';
import { ModelViewer } from '@/components/viewer/model-viewer';
import { ParametersPanel } from '@/components/design/parameters-panel';
import { PrinterStatus } from '@/components/printer/printer-status';
import { Button } from '@/components/ui/button';
import { 
  Box, 
  Menu, 
  Settings, 
  HelpCircle,
  Github
} from 'lucide-react';

export default function DashboardPage() {
  const [modelData, setModelData] = useState<{
    type: 'box' | 'custom';
    dimensions: { length: number; width: number; height: number };
    wallThickness?: number;
    cornerRadius?: number;
  } | undefined>(undefined);

  const handleModelGenerated = (data: typeof modelData) => {
    setModelData(data);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex-shrink-0 h-14 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Box className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">ProtoForge</h1>
              <p className="text-xs text-muted-foreground">Hardware Prototyping AI</p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Templates
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Projects
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Docs
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Github className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r border-border">
              <ChatInterface onModelGenerated={handleModelGenerated} />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* 3D Viewer Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-4">
              <ModelViewer 
                modelData={modelData}
                showGrid={true}
                showDimensions={true}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Parameters Panel */}
          <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
            <div className="h-full border-l border-border">
              <ParametersPanel modelData={modelData} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      {/* Printer Status Bar */}
      <PrinterStatus />
    </div>
  );
}
