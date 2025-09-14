import React from 'react';
import { X, Clock, Tag, ExternalLink, BookOpen, Lightbulb, Wrench, BookMarked } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { GraphNode } from './EduGraph';

interface ConceptPanelProps {
  concept: GraphNode;
  onClose: () => void;
  onTimeJump: (time: number) => void;
}

export const ConceptPanel: React.FC<ConceptPanelProps> = ({
  concept,
  onClose,
  onTimeJump
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'definition': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'example': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'application': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'prerequisite': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'definition': return <BookOpen className="w-3 h-3" />;
      case 'example': return <Lightbulb className="w-3 h-3" />;
      case 'application': return <Wrench className="w-3 h-3" />;
      case 'prerequisite': return <BookMarked className="w-3 h-3" />;
      default: return <Tag className="w-3 h-3" />;
    }
  };

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-lg">{concept.label}</CardTitle>
                <Badge variant="secondary" className={getCategoryColor(concept.category)}>
                  {getCategoryIcon(concept.category)}
                  <span className="ml-1 capitalize">{concept.category}</span>
                </Badge>
              </div>
              
              {concept.isActive && (
                <Badge variant="default" className="inline-flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                  Currently Active
                </Badge>
              )}
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close panel</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Description</h4>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {concept.description}
                </CardDescription>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Node Size</p>
                  <p className="font-mono font-medium">{concept.size}px</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">References</p>
                  <p className="font-mono font-medium">{concept.timestamps.length}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-muted-foreground">Total Duration</p>
                  <p className="font-mono font-medium">
                    {concept.timestamps.length > 1 
                      ? `${Math.round((concept.timestamps[concept.timestamps.length - 1] - concept.timestamps[0]) / 60)}min`
                      : '< 1min'
                    }
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">
                  Video References ({concept.timestamps.length} times)
                </h4>
              </div>
              
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  {concept.timestamps.map((timestamp, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          onClick={() => onTimeJump(timestamp)}
                          className="w-full justify-between h-auto p-3 hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="font-mono text-sm">
                              {formatTime(timestamp)}
                            </span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Jump to {formatTime(timestamp)}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onTimeJump(concept.timestamps[0])}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              First Reference
            </Button>
            
            {concept.timestamps.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTimeJump(concept.timestamps[concept.timestamps.length - 1])}
                className="flex-1"
              >
                Last Reference
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};