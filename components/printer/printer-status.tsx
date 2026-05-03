'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Printer, 
  Thermometer, 
  Clock, 
  Pause, 
  Play, 
  X,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Printer as PrinterType, PrintJob } from '@/lib/templates/types';

// Mock printer data for demo
const mockPrinter: PrinterType = {
  id: 'cr10-smart-1',
  name: 'CR-10 Smart',
  type: 'octoprint',
  status: 'online',
  buildVolume: { length: 300, width: 300, height: 400 },
  temperature: { hotend: 0, bed: 0 },
};

const mockJob: PrintJob | null = null;

interface PrinterStatusProps {
  className?: string;
}

export function PrinterStatus({ className }: PrinterStatusProps) {
  const [printer, setPrinter] = useState<PrinterType>(mockPrinter);
  const [currentJob, setCurrentJob] = useState<PrintJob | null>(mockJob);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getStatusColor = (status: PrinterType['status']) => {
    switch (status) {
      case 'online': return 'bg-success';
      case 'printing': return 'bg-primary';
      case 'offline': return 'bg-muted-foreground';
      case 'error': return 'bg-destructive';
    }
  };

  const getStatusLabel = (status: PrinterType['status']) => {
    switch (status) {
      case 'online': return 'Ready';
      case 'printing': return 'Printing';
      case 'offline': return 'Offline';
      case 'error': return 'Error';
    }
  };

  return (
    <div className={cn('flex items-center gap-4 p-3 bg-card border-t border-border', className)}>
      {/* Printer info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Printer className="w-5 h-5 text-foreground" />
          </div>
          <div className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card',
            getStatusColor(printer.status)
          )} />
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{printer.name}</span>
            <Badge variant="outline" className="text-xs h-5">
              {getStatusLabel(printer.status)}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {printer.status === 'offline' ? (
                <WifiOff className="w-3 h-3" />
              ) : (
                <Wifi className="w-3 h-3 text-success" />
              )}
              {printer.type === 'octoprint' ? 'OctoPrint' : 'Creality Cloud'}
            </span>
            <span>
              {printer.buildVolume.length}x{printer.buildVolume.width}x{printer.buildVolume.height}mm
            </span>
          </div>
        </div>
      </div>

      {/* Temperature display */}
      <div className="flex items-center gap-4 px-4 border-l border-border">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-warning" />
          <div className="text-sm">
            <span className="text-muted-foreground">Hotend:</span>
            <span className="font-mono ml-1">{printer.temperature?.hotend ?? 0}°C</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-info" />
          <div className="text-sm">
            <span className="text-muted-foreground">Bed:</span>
            <span className="font-mono ml-1">{printer.temperature?.bed ?? 0}°C</span>
          </div>
        </div>
      </div>

      {/* Current job or empty state */}
      <div className="flex-1 px-4 border-l border-border">
        {currentJob ? (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate">{currentJob.fileName}</span>
                <span className="text-xs text-muted-foreground">
                  {currentJob.progress.toFixed(0)}%
                </span>
              </div>
              <Progress value={currentJob.progress} className="h-1.5" />
              {currentJob.estimatedTime && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>~{Math.round(currentJob.estimatedTime / 60)} min remaining</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pause className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">No active print job</span>
            <span className="text-xs text-muted-foreground">
              Ready to receive prints from the design agent
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pl-4 border-l border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
