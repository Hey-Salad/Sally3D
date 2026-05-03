'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Upload,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PCBSpecification, MountingHole, PortCutout } from '@/lib/templates/types';

interface PCBInputProps {
  onSubmit: (pcb: PCBSpecification) => void;
  trigger?: React.ReactNode;
}

export function PCBInput({ onSubmit, trigger }: PCBInputProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  
  // Form state
  const [name, setName] = useState('');
  const [length, setLength] = useState(80);
  const [width, setWidth] = useState(50);
  const [height, setHeight] = useState(15);
  const [clearanceTop, setClearanceTop] = useState(10);
  const [clearanceBottom, setClearanceBottom] = useState(3);
  const [mountingHoles, setMountingHoles] = useState<MountingHole[]>([
    { x: 5, y: 5, diameter: 3, type: 'standoff' },
    { x: 75, y: 5, diameter: 3, type: 'standoff' },
    { x: 5, y: 45, diameter: 3, type: 'standoff' },
    { x: 75, y: 45, diameter: 3, type: 'standoff' },
  ]);
  const [connectors, setConnectors] = useState<PortCutout[]>([]);

  const addMountingHole = () => {
    setMountingHoles([
      ...mountingHoles,
      { x: 0, y: 0, diameter: 3, type: 'standoff' },
    ]);
  };

  const updateMountingHole = (index: number, field: keyof MountingHole, value: any) => {
    const updated = [...mountingHoles];
    updated[index] = { ...updated[index], [field]: value };
    setMountingHoles(updated);
  };

  const removeMountingHole = (index: number) => {
    setMountingHoles(mountingHoles.filter((_, i) => i !== index));
  };

  const addConnector = () => {
    setConnectors([
      ...connectors,
      { x: 0, y: 0, width: 12, height: 8, wall: 'back', type: 'usb', label: '' },
    ]);
  };

  const updateConnector = (index: number, field: keyof PortCutout, value: any) => {
    const updated = [...connectors];
    updated[index] = { ...updated[index], [field]: value };
    setConnectors(updated);
  };

  const removeConnector = (index: number) => {
    setConnectors(connectors.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const pcb: PCBSpecification = {
      name: name || 'Custom PCB',
      dimensions: { length, width, height },
      mountingHoles,
      connectors,
      clearanceTop,
      clearanceBottom,
    };
    onSubmit(pcb);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Cpu className="w-4 h-4 mr-2" />
            Add PCB Specs
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>PCB Specification</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="import" disabled>Import File</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6 mt-4">
            {/* Basic info */}
            <FieldGroup>
              <Field>
                <FieldLabel>PCB Name</FieldLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., ESP32 Controller Board"
                />
              </Field>
            </FieldGroup>

            {/* Dimensions */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">
                PCB Dimensions (mm)
              </Label>
              <div className="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>Length</FieldLabel>
                  <Input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    min={10}
                    max={300}
                  />
                </Field>
                <Field>
                  <FieldLabel>Width</FieldLabel>
                  <Input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    min={10}
                    max={300}
                  />
                </Field>
                <Field>
                  <FieldLabel>Component Height</FieldLabel>
                  <Input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    min={1}
                    max={100}
                  />
                </Field>
              </div>
            </div>

            {/* Clearances */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">
                Clearances (mm)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Above Components</FieldLabel>
                  <Input
                    type="number"
                    value={clearanceTop}
                    onChange={(e) => setClearanceTop(Number(e.target.value))}
                    min={0}
                    max={50}
                  />
                </Field>
                <Field>
                  <FieldLabel>Below PCB (wiring)</FieldLabel>
                  <Input
                    type="number"
                    value={clearanceBottom}
                    onChange={(e) => setClearanceBottom(Number(e.target.value))}
                    min={0}
                    max={50}
                  />
                </Field>
              </div>
            </div>

            {/* Mounting holes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Mounting Holes
                </Label>
                <Button variant="outline" size="sm" onClick={addMountingHole}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {mountingHoles.map((hole, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <span className="text-xs text-muted-foreground w-6">#{i + 1}</span>
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <Input
                        type="number"
                        placeholder="X"
                        value={hole.x}
                        onChange={(e) => updateMountingHole(i, 'x', Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Y"
                        value={hole.y}
                        onChange={(e) => updateMountingHole(i, 'y', Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Dia"
                        value={hole.diameter}
                        onChange={(e) => updateMountingHole(i, 'diameter', Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                      <select
                        value={hole.type}
                        onChange={(e) => updateMountingHole(i, 'type', e.target.value)}
                        className="h-8 text-xs rounded-md border border-input bg-background px-2"
                      >
                        <option value="standoff">Standoff</option>
                        <option value="through">Through</option>
                        <option value="threaded">Threaded</option>
                      </select>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMountingHole(i)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Connectors */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Connectors
                </Label>
                <Button variant="outline" size="sm" onClick={addConnector}>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {connectors.map((conn, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16">Connector {i + 1}</span>
                      <select
                        value={conn.type}
                        onChange={(e) => updateConnector(i, 'type', e.target.value)}
                        className="h-8 text-xs rounded-md border border-input bg-background px-2 flex-1"
                      >
                        <option value="usb">USB</option>
                        <option value="hdmi">HDMI</option>
                        <option value="power">Power</option>
                        <option value="ethernet">Ethernet</option>
                        <option value="custom">Custom</option>
                      </select>
                      <select
                        value={conn.wall}
                        onChange={(e) => updateConnector(i, 'wall', e.target.value)}
                        className="h-8 text-xs rounded-md border border-input bg-background px-2"
                      >
                        <option value="front">Front</option>
                        <option value="back">Back</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConnector(i)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Input
                        type="number"
                        placeholder="X"
                        value={conn.x}
                        onChange={(e) => updateConnector(i, 'x', Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Y"
                        value={conn.y}
                        onChange={(e) => updateConnector(i, 'y', Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Width"
                        value={conn.width}
                        onChange={(e) => updateConnector(i, 'width', Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Height"
                        value={conn.height}
                        onChange={(e) => updateConnector(i, 'height', Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                ))}
                {connectors.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No connectors added. Click Add to specify port cutouts.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Import PCB File</p>
              <p className="text-xs text-muted-foreground mb-4">
                Support for KiCad, Eagle, and Gerber files coming soon
              </p>
              <Button variant="outline" disabled>
                Select File
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Enclosure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
