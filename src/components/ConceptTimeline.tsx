import React, { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { GraphNode } from './EduGraph';

interface ConceptTimelineProps {
  duration: number;
  currentTime: number;
  concepts: GraphNode[];
  onClick: (time: number) => void;
}

export const ConceptTimeline: React.FC<ConceptTimelineProps> = ({
  duration,
  currentTime,
  concepts,
  onClick
}) => {
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    onClick(newTime);
  }, [duration, onClick]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'definition': return 'hsl(var(--concept-primary))';
      case 'example': return 'hsl(var(--concept-secondary))';
      case 'application': return 'hsl(var(--concept-tertiary))';
      case 'prerequisite': return 'hsl(var(--concept-accent))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Concept Timeline</CardTitle>
            <CardDescription className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            {/* Timeline Track */}
            <div 
              className="h-10 bg-muted rounded-lg cursor-pointer relative overflow-hidden border"
              onClick={handleTimelineClick}
            >
              {/* Progress Fill */}
              <div 
                className="h-full bg-primary/20 rounded-lg transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />

              {/* Current Time Indicator */}
              <div 
                className="absolute top-0 w-1 h-full bg-primary shadow-lg transition-all duration-300 z-10"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />

              {/* Concept Markers */}
              {concepts.map((concept) =>
                concept.timestamps.map((timestamp, index) => (
                  <Tooltip key={`${concept.id}-${index}`}>
                    <TooltipTrigger asChild>
                      <div
                        className="absolute top-1 w-8 h-8 rounded-full border-2 border-background cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center text-xs font-bold text-white shadow-lg"
                        style={{ 
                          left: `${(timestamp / duration) * 100}%`,
                          backgroundColor: getCategoryColor(concept.category),
                          transform: 'translateX(-50%)',
                          zIndex: concept.isActive ? 15 : 10,
                          boxShadow: concept.isActive ? `0 0 16px ${getCategoryColor(concept.category)}` : undefined
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClick(timestamp);
                        }}
                      >
                        {concept.isActive && (
                          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{concept.label} - {formatTime(timestamp)}</p>
                    </TooltipContent>
                  </Tooltip>
                ))
              )}
            </div>

            {/* Active Concepts Display */}
            <div className="mt-4 min-h-[2rem]">
              {concepts.filter(c => c.isActive).length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Currently discussing:</p>
                  <div className="flex flex-wrap gap-2">
                    {concepts
                      .filter(c => c.isActive)
                      .map((concept) => (
                        <Tooltip key={concept.id}>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => onClick(concept.timestamps[0])}
                            >
                              {concept.label}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Jump to {concept.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))
                    }
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No active concepts at current time
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Timeline Legend */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Concept Categories</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: getCategoryColor('definition') }}
                />
                <span className="text-muted-foreground">Definitions</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: getCategoryColor('example') }}
                />
                <span className="text-muted-foreground">Examples</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: getCategoryColor('application') }}
                />
                <span className="text-muted-foreground">Applications</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full border" 
                  style={{ backgroundColor: getCategoryColor('prerequisite') }}
                />
                <span className="text-muted-foreground">Prerequisites</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};