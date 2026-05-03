'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Box, 
  Search, 
  Cpu, 
  Hand, 
  Building, 
  Layout,
  Grip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { enclosureTemplates, searchTemplates } from '@/lib/templates/enclosure-templates';
import type { EnclosureTemplate } from '@/lib/templates/types';

interface TemplateBrowserProps {
  onSelectTemplate: (template: EnclosureTemplate) => void;
  trigger?: React.ReactNode;
}

const categoryIcons: Record<EnclosureTemplate['category'], React.ReactNode> = {
  basic: <Box className="w-4 h-4" />,
  electronics: <Cpu className="w-4 h-4" />,
  pcb: <Layout className="w-4 h-4" />,
  handheld: <Hand className="w-4 h-4" />,
  'wall-mount': <Building className="w-4 h-4" />,
  'din-rail': <Grip className="w-4 h-4" />,
};

const categoryLabels: Record<EnclosureTemplate['category'], string> = {
  basic: 'Basic',
  electronics: 'Electronics',
  pcb: 'PCB',
  handheld: 'Handheld',
  'wall-mount': 'Wall Mount',
  'din-rail': 'DIN Rail',
};

export function TemplateBrowser({ onSelectTemplate, trigger }: TemplateBrowserProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EnclosureTemplate['category'] | 'all'>('all');

  const filteredTemplates = search.trim()
    ? searchTemplates(search)
    : selectedCategory === 'all'
    ? enclosureTemplates
    : enclosureTemplates.filter(t => t.category === selectedCategory);

  const handleSelect = (template: EnclosureTemplate) => {
    onSelectTemplate(template);
    setOpen(false);
  };

  const categories: (EnclosureTemplate['category'] | 'all')[] = [
    'all', 'basic', 'electronics', 'pcb', 'handheld', 'wall-mount'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Box className="w-4 h-4 mr-2" />
            Browse Templates
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Enclosure Templates</DialogTitle>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="h-8"
            >
              {category === 'all' ? (
                'All'
              ) : (
                <>
                  {categoryIcons[category]}
                  <span className="ml-1.5">{categoryLabels[category]}</span>
                </>
              )}
            </Button>
          ))}
        </div>

        {/* Template grid */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={cn(
                  'text-left p-4 rounded-lg border border-border',
                  'hover:border-primary hover:bg-muted/50 transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {categoryIcons[template.category]}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {categoryLabels[template.category]}
                  </Badge>
                </div>
                
                <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {template.description}
                </p>
                
                {/* Default dimensions */}
                {template.defaultParameters.innerDimensions && (
                  <div className="text-xs font-mono text-muted-foreground">
                    {template.defaultParameters.innerDimensions.length} x{' '}
                    {template.defaultParameters.innerDimensions.width} x{' '}
                    {template.defaultParameters.innerDimensions.height} mm
                  </div>
                )}
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 bg-muted rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Box className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No templates found</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
