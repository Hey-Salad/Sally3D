'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  Ruler, 
  Layers, 
  Download,
  Upload,
  Copy,
  Settings2,
  Cpu,
  Wind,
  PlugZap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EnclosureParameters } from '@/lib/templates/types';

interface ParametersPanelProps {
  modelData?: {
    type: 'box' | 'custom';
    dimensions: { length: number; width: number; height: number };
    wallThickness?: number;
    cornerRadius?: number;
  };
  onParametersChange?: (params: Partial<EnclosureParameters>) => void;
}

export function ParametersPanel({ modelData, onParametersChange }: ParametersPanelProps) {
  const [activeTab, setActiveTab] = useState('dimensions');
  
  // Local state for parameters
  const [length, setLength] = useState(modelData?.dimensions.length ?? 100);
  const [width, setWidth] = useState(modelData?.dimensions.width ?? 60);
  const [height, setHeight] = useState(modelData?.dimensions.height ?? 30);
  const [wallThickness, setWallThickness] = useState(modelData?.wallThickness ?? 2.5);
  const [cornerRadius, setCornerRadius] = useState(modelData?.cornerRadius ?? 3);

  const handleExportSTL = () => {
    // In production, this would trigger STL download from CAD service
    alert('STL export would be triggered here. Connect to CAD service for actual export.');
  };

  const handleExportSTEP = () => {
    // In production, this would trigger STEP download from CAD service
    alert('STEP export would be triggered here. Connect to CAD service for actual export.');
  };

  if (!modelData) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm">Parameters</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <Settings2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No Model Selected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Generate a model to adjust parameters
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Parameters</h3>
          <Badge variant="outline" className="text-xs">
            {modelData.type === 'box' ? 'Enclosure' : 'Custom'}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="flex-shrink-0 w-full justify-start rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger 
            value="dimensions" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Ruler className="w-3.5 h-3.5 mr-1.5" />
            Dims
          </TabsTrigger>
          <TabsTrigger 
            value="features"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Layers className="w-3.5 h-3.5 mr-1.5" />
            Features
          </TabsTrigger>
          <TabsTrigger 
            value="export"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="dimensions" className="p-4 space-y-6 mt-0">
            {/* Outer dimensions display */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Outer Dimensions
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-mono font-semibold">{length}</div>
                  <div className="text-xs text-muted-foreground">Length</div>
                </div>
                <div>
                  <div className="text-lg font-mono font-semibold">{width}</div>
                  <div className="text-xs text-muted-foreground">Width</div>
                </div>
                <div>
                  <div className="text-lg font-mono font-semibold">{height}</div>
                  <div className="text-xs text-muted-foreground">Height</div>
                </div>
              </div>
            </div>

            {/* Dimension sliders */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Length (mm)</Label>
                  <span className="text-xs font-mono text-muted-foreground">{length}</span>
                </div>
                <Slider
                  value={[length]}
                  onValueChange={([v]) => setLength(v)}
                  min={20}
                  max={300}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Width (mm)</Label>
                  <span className="text-xs font-mono text-muted-foreground">{width}</span>
                </div>
                <Slider
                  value={[width]}
                  onValueChange={([v]) => setWidth(v)}
                  min={20}
                  max={300}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Height (mm)</Label>
                  <span className="text-xs font-mono text-muted-foreground">{height}</span>
                </div>
                <Slider
                  value={[height]}
                  onValueChange={([v]) => setHeight(v)}
                  min={10}
                  max={400}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Wall settings */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Wall Thickness (mm)</Label>
                  <span className="text-xs font-mono text-muted-foreground">{wallThickness}</span>
                </div>
                <Slider
                  value={[wallThickness]}
                  onValueChange={([v]) => setWallThickness(v)}
                  min={1.2}
                  max={6}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Corner Radius (mm)</Label>
                  <span className="text-xs font-mono text-muted-foreground">{cornerRadius}</span>
                </div>
                <Slider
                  value={[cornerRadius]}
                  onValueChange={([v]) => setCornerRadius(v)}
                  min={0}
                  max={20}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="p-4 space-y-4 mt-0">
            {/* Feature buttons */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Mounting
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Cpu className="w-3.5 h-3.5 mr-2" />
                  Add Standoff
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Box className="w-3.5 h-3.5 mr-2" />
                  Screw Boss
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Ports & Cutouts
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <PlugZap className="w-3.5 h-3.5 mr-2" />
                  USB Cutout
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <PlugZap className="w-3.5 h-3.5 mr-2" />
                  Power Jack
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Ventilation
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Wind className="w-3.5 h-3.5 mr-2" />
                  Vent Slots
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Wind className="w-3.5 h-3.5 mr-2" />
                  Honeycomb
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
              Click a feature button to add it to your design, or describe the feature to the AI assistant.
            </p>
          </TabsContent>

          <TabsContent value="export" className="p-4 space-y-4 mt-0">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Download Model
              </Label>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleExportSTL}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export STL
                  <span className="ml-auto text-xs text-muted-foreground">3D Print</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportSTEP}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export STEP
                  <span className="ml-auto text-xs text-muted-foreground">CAD Edit</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Share
              </Label>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Copy Parameters
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Import
              </Label>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Import STL/STEP
              </Button>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p className="font-medium mb-1">CAD Service Required</p>
              <p>
                Export functionality requires connection to the CadQuery service running on your Mac Mini.
              </p>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
