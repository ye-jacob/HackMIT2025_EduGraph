import React, { useCallback } from 'react';
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
    <div className="bg-card rounded-lg border border-border p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-foreground">Concept Timeline</h4>
        <span className="text-sm text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="relative">
        {/* Timeline Track */}
        <div 
          className="h-8 bg-muted rounded-lg cursor-pointer relative overflow-hidden"
          onClick={handleTimelineClick}
        >
          {/* Progress Fill */}
          <div 
            className="h-full bg-primary rounded-lg transition-all duration-300"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Current Time Indicator */}
          <div 
            className="absolute top-0 w-1 h-full bg-accent shadow-lg transition-all duration-300"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />

          {/* Concept Markers */}
          {concepts.map((concept) =>
            concept.timestamps.map((timestamp, index) => (
              <div
                key={`${concept.id}-${index}`}
                className="absolute top-1 w-6 h-6 rounded-full border-2 border-background cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center text-xs font-bold text-white shadow-md"
                style={{ 
                  left: `${(timestamp / duration) * 100}%`,
                  backgroundColor: getCategoryColor(concept.category),
                  transform: 'translateX(-50%)',
                  zIndex: concept.isActive ? 10 : 5,
                  boxShadow: concept.isActive ? `0 0 12px ${getCategoryColor(concept.category)}` : undefined
                }}
                title={`${concept.label} - ${formatTime(timestamp)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(timestamp);
                }}
              >
                {concept.isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Active Concepts Display */}
        <div className="mt-3 min-h-[2rem]">
          {concepts.filter(c => c.isActive).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground mr-2">Now discussing:</span>
              {concepts
                .filter(c => c.isActive)
                .map((concept) => (
                  <span
                    key={concept.id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => onClick(concept.timestamps[0])}
                  >
                    {concept.label}
                  </span>
                ))
              }
            </div>
          ) : (
            <div className="text-xs text-muted-foreground italic">
              No active concepts at current time
            </div>
          )}
        </div>
      </div>

      {/* Timeline Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: getCategoryColor('definition') }}
          />
          <span className="text-muted-foreground">Definitions</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: getCategoryColor('example') }}
          />
          <span className="text-muted-foreground">Examples</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: getCategoryColor('application') }}
          />
          <span className="text-muted-foreground">Applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: getCategoryColor('prerequisite') }}
          />
          <span className="text-muted-foreground">Prerequisites</span>
        </div>
      </div>
    </div>
  );
};